#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIG =====
const char* WIFI_SSID     = "SCHOLARS G";
const char* WIFI_PASSWORD = "9001578111";

String BASE_URL = "http://192.168.1.109:3000"; // Change to your server
String UMID        = "butane-mq2-001";
String MODULE_TYPE = "butane-sensor";

// Pins
const uint8_t MQ2_PIN = 35; // ESP32 ADC pin
const uint8_t STATUS_LED_PIN = 13; // Built-in LED on most ESP boards

// Interval
const unsigned long SEND_INTERVAL_MS = 5000;

// Globals
String sessionId = "";
unsigned long lastSend = 0;
unsigned long lastLedToggle = 0;

float mq2ToPpm(int raw) {
  // Simple linear approximation (for demo). Calibrate per your sensor.
  // Map 0-4095 to 0-2000 ppm
  return (float)raw * 10.0f / 4095.0f;
}

bool httpGetJson(const String& url, DynamicJsonDocument& doc) {
  HTTPClient http;
  http.begin(url);
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    DeserializationError err = deserializeJson(doc, payload);
    http.end();
    return !err;
  }
  http.end();
  return false;
}

bool httpPostJson(const String& url, const String& jsonBody) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(jsonBody);
  http.end();
  return code > 0;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  
  // WiFi connection blinking pattern - LED OFF during connection
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(100);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(100);
  }
  
  // LED OFF for 1 second when connected
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(1000);
    digitalWrite(STATUS_LED_PIN, HIGH);
  }
}

bool registerModule() {
  String url = BASE_URL + "/api/register?umid=" + UMID + "&type=" + MODULE_TYPE;
  DynamicJsonDocument doc(1024);
  if (!httpGetJson(url, doc)) return false;
  if (doc["success"].as<bool>()) {
    sessionId = doc["session_id"].as<String>();
    return sessionId.length() > 0;
  }
  return false;
}

bool sendSensorData(float butanePpm) {
  if (sessionId.length() == 0) return false;

  // Turn LED OFF before sending data
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);
  
  DynamicJsonDocument doc(512);
  doc["session_id"] = sessionId;
  doc["umid"] = UMID;
  doc["moduleType"] = MODULE_TYPE;
  JsonObject data = doc.createNestedObject("data");
  data["butane"] = butanePpm;
  
  Serial.print("Butane PPM: ");
  Serial.println(butanePpm);
  
  String body;
  serializeJson(doc, body);
  bool result = httpPostJson(BASE_URL + "/api/pool", body);
  
  // Turn LED back ON after sending data
  digitalWrite(STATUS_LED_PIN, HIGH);
  
  return result;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ClusterFox MQ2 Butane Module ===");
  
  // Setup pins
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH); // LED ON when idle
  
  analogReadResolution(12);
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection failed");
    return;
  }
  Serial.print("Connected to WiFi, IP: ");
  Serial.println(WiFi.localIP());

  if (!registerModule()) {
    for (int i = 0; i < 5 && sessionId.length() == 0; i++) {
      delay(2000);
      registerModule();
    }
  }
  
  // Turn LED back ON after operations
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;

    int raw = analogRead(MQ2_PIN);
    float ppm = mq2ToPpm(raw);
    sendSensorData(ppm);
  }

  delay(50);
}



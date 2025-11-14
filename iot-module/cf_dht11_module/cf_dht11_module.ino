#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ===== CONFIG =====
// WiFi
const char* WIFI_SSID     = "SCHOLARS G";
const char* WIFI_PASSWORD = "9001578111";

String BASE_URL = "http://192.168.1.109:3000"; // Change to your server

String UMID      = "temprature-humidity-dht11-001";      // Unique Module ID
String MODULE_TYPE = "temperature-humidity";   // Module type label

// Pins
const uint8_t DHT_PIN = 4;    // GPIO for DHT11 data
const uint8_t DHT_TYPE = DHT11;
const uint8_t STATUS_LED_PIN = 13; // Built-in LED on most ESP boards

// Interval (ms)
const unsigned long SEND_INTERVAL_MS = 2000; // 5s

// ===== GLOBALS =====
DHT dht(DHT_PIN, DHT_TYPE);
String sessionId = "";
unsigned long lastSend = 0;
unsigned long lastLedToggle = 0;

// ===== UTILS =====
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

bool httpPostJson(const String& url, const String& jsonBody, DynamicJsonDocument* response = nullptr) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(jsonBody);
  if (code > 0) {
    if (response) {
      String payload = http.getString();
      deserializeJson(*response, payload);
    }
    http.end();
    return true;
  }
  http.end();
  return false;
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
  // Simulator uses GET /api/register?umid=...&type=...
  String url = BASE_URL + "/api/register?umid=" + UMID + "&type=" + MODULE_TYPE;
  DynamicJsonDocument doc(1024);
  if (!httpGetJson(url, doc)) return false;
  if (doc["success"].as<bool>()) {
    sessionId = doc["session_id"].as<String>();
    return sessionId.length() > 0;
  }
  return false;
}

bool sendSensorData(float temperature, float humidity) {
  if (sessionId.length() == 0) return false;

  // Turn LED OFF before sending data
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);

  // Build payload: { session_id, umid, moduleType, data: { temp, humi } }
  DynamicJsonDocument doc(512);
  doc["session_id"] = sessionId;
  doc["umid"] = UMID;
  doc["moduleType"] = MODULE_TYPE;
  JsonObject data = doc.createNestedObject("data");
  data["temperature"] = temperature;
  data["humidity"] = humidity;

  String body;
  serializeJson(doc, body);
  bool result = httpPostJson(BASE_URL + "/api/pool", body, nullptr);

  // Turn LED OFF briefly after sending data
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);
  digitalWrite(STATUS_LED_PIN, HIGH);

  return result;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ClusterFox DHT11 Module ===");

  // Setup pins
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH); // LED ON when idle

  // Initialize DHT sensor
  dht.begin();

  // Connect to WiFi
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection failed");
    return;
  }
  Serial.print("Connected to WiFi, IP: ");
  Serial.println(WiFi.localIP());

  // Register with server
  registerModule();

  // Turn LED back ON after operations
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature(); // Celsius

    if (isnan(h) || isnan(t)) {
      // Skip if read failed
    } else {
      sendSensorData(t, h);
    }
  }

  delay(50);
}




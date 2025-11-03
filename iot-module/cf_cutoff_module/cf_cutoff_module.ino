#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIG =====
const char* WIFI_SSID     = "SCHOLARS G";
const char* WIFI_PASSWORD = "9001578111";

String BASE_URL = "http://192.168.1.109:3000"; // Change to your server
String UMID = "CUTOFF-1001";
String NAME = "Cutoff Relay";
String POOL_ID = "POOL001";

// Poll/heartbeat
const unsigned long POLL_INTERVAL_MS = 2000;

// Relay pin (simulate physical cutoff; LOW=on, HIGH=off depending on module)
const uint8_t RELAY_PIN = 2; // Onboard for demonstration
// Emergency pins that should go HIGH during emergency
const uint8_t EMERGENCY_PIN_1 = 18;
const uint8_t EMERGENCY_PIN_2 = 19;
// Status LED pin
const uint8_t STATUS_LED_PIN = 13; // Built-in LED on most ESP boards

// ===== STATE =====
bool cutoffActive = false;
unsigned long lastPoll = 0;
unsigned long lastLedToggle = 0;

// ===== HTTP =====
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

bool registerCutoff() {
  // Cutoff simulator used POST /api/register with JSON
  DynamicJsonDocument doc(512);
  doc["umid"] = UMID;
  doc["name"] = NAME;
  doc["poolId"] = POOL_ID;
  doc["sensors"] = JsonArray();
  doc["isCutoffModule"] = true;
  doc["cutoffActive"] = false;

  String body;
  serializeJson(doc, body);
  return httpPostJson(BASE_URL + "/api/register", body, nullptr);
}

bool sendHeartbeat() {
  DynamicJsonDocument doc(128);
  doc["umid"] = UMID;
  String body; serializeJson(doc, body);
  return httpPostJson(BASE_URL + "/api/heartbeat", body, nullptr);
}

void applyRelay(bool active) {
  cutoffActive = active;
  // Toggle relay (adjust logic to your module)
  digitalWrite(RELAY_PIN, active ? HIGH : LOW);
  
  // Control emergency pins 18 and 19
  digitalWrite(EMERGENCY_PIN_1, active ? HIGH : LOW);
  digitalWrite(EMERGENCY_PIN_2, active ? HIGH : LOW);
}

void pollCutoffStatus() {
  // Turn LED OFF before sending data
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);
  
  // Send heartbeat first
  sendHeartbeat();

  // GET /api/modules and find this module
  DynamicJsonDocument resp(8192);
  if (!httpGetJson(BASE_URL + "/api/modules", resp)) {
    // Turn LED back ON if operation failed
    digitalWrite(STATUS_LED_PIN, HIGH);
    return;
  }

  // Turn LED OFF briefly after receiving data
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);
  digitalWrite(STATUS_LED_PIN, HIGH);

  // API returns { success, modules: [] }
  if (!resp.containsKey("modules")) {
    // Turn LED back ON if operation failed
    digitalWrite(STATUS_LED_PIN, HIGH);
    return;
  }
  
  JsonArray modules = resp["modules"].as<JsonArray>();
  for (JsonObject m : modules) {
    if (m["umid"].as<String>() == UMID) {
      bool active = m["cutoffActive"].as<bool>();
      if (active != cutoffActive) {
        applyRelay(active);
      }
      break;
    }
  }
  
  // Turn LED back ON after all operations
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ClusterFox Cutoff Module ===");

  // Setup pins
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(EMERGENCY_PIN_1, OUTPUT);
  pinMode(EMERGENCY_PIN_2, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  
  // Initial state
  digitalWrite(RELAY_PIN, HIGH); // Relay off
  digitalWrite(EMERGENCY_PIN_1, LOW);
  digitalWrite(EMERGENCY_PIN_2, LOW);
  digitalWrite(STATUS_LED_PIN, HIGH); // LED ON when idle

  // Connect to WiFi
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection failed");
    return;
  }
  Serial.print("Connected to WiFi, IP: ");
  Serial.println(WiFi.localIP());

  // Register with server
  registerCutoff();
  
  // Turn LED back ON after operations
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  unsigned long now = millis();
  if (now - lastPoll >= POLL_INTERVAL_MS) {
    lastPoll = now;
    pollCutoffStatus();
  }

  delay(20);
}



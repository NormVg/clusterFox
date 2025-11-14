#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

// ===== STATIC DEFAULTS =====
const char* AP_SSID     = "CF-butane-001:192.168.4.1";
const char* AP_PASS     = "12345678";
const unsigned long SETUP_DURATION = 60000UL;  // 60 seconds

// ===== MODULE SETTINGS =====
String BASE_URL    = "";
const String UMID        = "butane-001";
const String MODULE_TYPE = "butane-sensor";

// ===== PINS =====
const uint8_t MQ2_PIN        = 35;  // ADC pin
const uint8_t STATUS_LED_PIN = 13;  // LED indicator

// ===== LED SEQUENCE SETTINGS =====
unsigned long ledSeqLast        = 0;
const unsigned long ledSeqInterval = 200;  // blink every 200 ms during setup
bool ledState                     = false;

// ===== INTERVAL =====
const unsigned long SEND_INTERVAL_MS = 5000;

// ===== GLOBALS =====
Preferences prefs;
AsyncWebServer server(80);
bool setupMode      = true;
unsigned long setupStart = 0;

String wifiSSID  = "";
String wifiPass  = "";
String serverURL = "";

String sessionId = "";
unsigned long lastSend = 0;

float mq2ToPpm(int raw) {
  return (float)raw * 10.0f / 4095.0f;
}

bool httpGetJson(const String& url, DynamicJsonDocument& doc) {
  HTTPClient http;
  http.begin(url);
  int code = http.GET();
  Serial.print("HTTP GET to "); Serial.print(url); Serial.print(" returned "); Serial.println(code);
  if (code > 0) {
    String payload = http.getString();
    Serial.print("Payload: "); Serial.println(payload);
    DeserializationError err = deserializeJson(doc, payload);
    http.end();
    if (err) {
      Serial.print("JSON parse error: "); Serial.println(err.c_str());
      return false;
    }
    return true;
  }
  http.end();
  Serial.println("HTTP GET failed");
  return false;
}

bool httpPostJson(const String& url, const String& jsonBody) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(jsonBody);
  Serial.print("HTTP POST to "); Serial.print(url); Serial.print(" returned "); Serial.println(code);
  http.end();
  return (code > 0);
}

void saveConfig() {
  prefs.begin("clusterfox", false);
  prefs.putString("wifi_ssid", wifiSSID);
  prefs.putString("wifi_pass", wifiPass);
  prefs.putString("server_url", serverURL);
  prefs.end();
  Serial.println("Config saved:");
  Serial.print("  SSID: "); Serial.println(wifiSSID);
  Serial.print("  URL : "); Serial.println(serverURL);
}

void loadConfig() {
  prefs.begin("clusterfox", true);
  wifiSSID  = prefs.getString("wifi_ssid", "");
  wifiPass  = prefs.getString("wifi_pass", "");
  serverURL = prefs.getString("server_url", "");
  prefs.end();
}

void setupAPserver() {
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);  // start LED off for sequence
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("AP mode started. Connect to SSID: ");
  Serial.print(AP_SSID);
  Serial.print(", IP: ");
  Serial.println(WiFi.softAPIP());

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req){
    const char* html = R"rawliteral(
      <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>ClusterFox Setup</title>
      <style>
        body { margin:0; padding:0; font-family:Arial,sans-serif; background:#f4f4f9;
          display:flex; align-items:center; justify-content:center; min-height:100vh;}
        .container { background:#fff; padding:20px; border-radius:8px;
          box-shadow:0 2px 8px rgba(0,0,0,0.1); width:90%; max-width:400px;}
        h2 { margin-top:0; text-align:center; color:#333;}
        .form-group { margin-bottom:15px;}
        label { display:block; margin-bottom:5px; color:#555;}
        input[type=text] { width:100%; padding:10px; border:1px solid #ccc;
          border-radius:4px; box-sizing:border-box;}
        button { width:100%; padding:12px; border:none; border-radius:4px;
          background:#0066cc; color:#fff; font-size:16px; cursor:pointer;}
        button:hover { background:#004a99;}
        @media(max-width:480px){ .container { padding:15px;} button { font-size:14px;} }
      </style>
      </head><body>
      <div class="container">
        <h2>ClusterFox Setup</h2>
        <form action="/set" method="GET">
          <div class="form-group"><label for="ssid">WiFi SSID</label>
            <input type="text" id="ssid" name="ssid" placeholder="Enter WiFi SSID"></div>
          <div class="form-group"><label for="pass">WiFi Password</label>
            <input type="text" id="pass" name="pass" placeholder="Enter WiFi Password"></div>
          <div class="form-group"><label for="url">Server URL</label>
            <input type="text" id="url" name="url" placeholder="e.g. http://192.168.1.100:3000"></div>
          <button type="submit">Save Configuration</button>
        </form>
      </div>
      </body></html>
    )rawliteral";
    req->send(200, "text/html", html);
  });

  server.on("/set", HTTP_GET, [](AsyncWebServerRequest *req){
    if (req->hasParam("ssid") && req->hasParam("pass") && req->hasParam("url")) {
      wifiSSID  = req->getParam("ssid")->value();
      wifiPass  = req->getParam("pass")->value();
      serverURL = req->getParam("url")->value();
      saveConfig();
      req->send(200, "text/plain", "Configuration saved. Restart device or reconnect.");
      Serial.println("New config received via webpage.");
      Serial.print("SSID: "); Serial.println(wifiSSID);
      Serial.print("URL : "); Serial.println(serverURL);
    } else {
      req->send(400, "text/plain", "Missing parameter(s)");
    }
  });

  server.begin();
  setupStart = millis();
}

void stopAPserver() {
  server.end();
  WiFi.softAPdisconnect(true);
  delay(500);  // allow network stack to settle
  WiFi.mode(WIFI_STA);
  Serial.println("Setup mode ended.");
}

void connectWiFi() {
  if (wifiSSID.length() == 0) {
    Serial.println("No WiFi credentials configured!");
    return;
  }

  WiFi.begin(wifiSSID.c_str(), wifiPass.c_str());
  Serial.print("Connecting to WiFi \"");
  Serial.print(wifiSSID);
  Serial.println("\" ...");

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < 20000) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(100);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(100);
  }

  Serial.print("WiFi status: "); Serial.println(WiFi.status());
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected. IP address: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed. No fallback.");
  }
}

bool registerModule() {
  if (serverURL.length() == 0) return false;
  String url = serverURL + "/api/register?umid=" + UMID + "&type=" + MODULE_TYPE;
  Serial.print("Register URL: "); Serial.println(url);

  DynamicJsonDocument doc(1024);
  if (!httpGetJson(url, doc)) {
    Serial.println("Module registration HTTP GET failed");
    return false;
  }
  if (doc["success"].as<bool>()) {
    sessionId = doc["session_id"].as<String>();
    Serial.print("Session created: "); Serial.println(sessionId);
    return true;
  }
  Serial.println("Registration returned success=false or no session_id");
  return false;
}

bool sendSensorData(float butanePpm) {
  if (sessionId.length() == 0) {
    Serial.println("No sessionId, skipping data send");
    return false;
  }

  digitalWrite(STATUS_LED_PIN, LOW);
  delay(50);

  DynamicJsonDocument doc(512);
  doc["session_id"] = sessionId;
  doc["umid"]       = UMID;
  doc["moduleType"] = MODULE_TYPE;
  JsonObject data = doc.createNestedObject("data");
  data["butane"] = butanePpm;

  Serial.print("Butane PPM: "); Serial.println(butanePpm);

  String body;
  serializeJson(doc, body);
  bool result = httpPostJson(serverURL + "/api/pool", body);

  digitalWrite(STATUS_LED_PIN, HIGH);
  if (!result) {
    Serial.println("Data send failed");
  } else {
    Serial.println("Data sent successfully");
  }
  return result;
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH); // idle ON

  loadConfig();
  Serial.println("\n\n=== ClusterFox MQ2 Butane Module ===");
  Serial.print("Loaded WiFi SSID : ");  Serial.println(wifiSSID);
  Serial.print("Loaded Server URL: ");  Serial.println(serverURL);

  setupAPserver();
}

void loop() {
  if (setupMode) {
    // Blink LED during setup mode
    if (millis() - ledSeqLast >= ledSeqInterval) {
      ledSeqLast = millis();
      ledState = !ledState;
      digitalWrite(STATUS_LED_PIN, ledState ? HIGH : LOW);
    }

    if (millis() - setupStart > SETUP_DURATION) {
      setupMode = false;
      stopAPserver();
      connectWiFi();
      if (WiFi.status() == WL_CONNECTED) {
        if (!registerModule()) {
          Serial.println("Module registration failed.");
        }
      }
    }
  } else {
    // Normal mode: steady LED on
    digitalWrite(STATUS_LED_PIN, HIGH);

    if (WiFi.status() == WL_CONNECTED) {
      if (millis() - lastSend >= SEND_INTERVAL_MS) {
        lastSend = millis();
        int raw = analogRead(MQ2_PIN);
        float ppm = mq2ToPpm(raw);
        sendSensorData(ppm);
      }
    }
  }
}

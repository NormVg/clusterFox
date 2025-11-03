// Preprocessor directives
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <String.h>

// global variables (avoid it)

uint8_t myId = 0;
const char* ssid = "SCHOLARS G";
const char* password = "9001578111";
const char* serverName = "http://192.168.1.120:8080/data?loogoo=123";
String jsonData;

void setup() {
  // put your setup code here, to run once:

  Serial.begin(9600);
  WiFi.begin(ssid, password);
  Serial.println("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(" .");
  }

  Serial.println("");
  Serial.print("Connected on WiFi network with IP: ");
  Serial.println(WiFi.localIP());
}

bool fetchAPI() {
  delay(10000);
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Use http.begin() without WiFiClientSecure for HTTP connections
    http.begin(serverName);

    int httpResponseCode = http.GET();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    String responseBody = http.getString();
    Serial.print("Response body: ");
    Serial.println(responseBody);
    
    http.end();
    return true;
  } else {
    Serial.println("WiFi Disconnected");
    return false;
  } 
}

void loop() {
  // put your main code here, to run repeatedly:

  bool bFetchAPI = fetchAPI();

  if (bFetchAPI) {
    Serial.println("Success");
  } else {
    Serial.println("Failed");
  }
}
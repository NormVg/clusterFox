
#include <DHT.h>
#define DHT_TYPE DHT11

int sigPin = 18;
int dly = 2000;

DHT dht(sigPin,DHT_TYPE);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(19200);
  Serial.println("HELLO BUDDY");
  pinMode(2,OUTPUT);

  dht.begin();

}

void loop() {
  // put your main code here, to run repeatedly:

  delay(dly);

  digitalWrite(2,HIGH);

  float humidity = dht.readHumidity();
  float temp = dht.readTemperature();

  digitalWrite(2,LOW);

  if (isnan(humidity) || isnan(temp)){
    Serial.println("BUDDY IS FAILEDDD");
    return;
  }

  Serial.print("HUMIDITY : ");
  Serial.print(humidity);

  Serial.print("\t");
  Serial.print("TEMP : ");
  Serial.print(temp);

  Serial.print("\n");


}

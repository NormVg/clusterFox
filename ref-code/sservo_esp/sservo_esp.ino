#include <ESP32Servo.h>

Servo myServo;
int servoPin = 18;

void blinkLED(){
  digitalWrite(2,HIGH);
  delay(200);
  digitalWrite(2,LOW);
  delay(200);
  digitalWrite(2,HIGH);
  delay(200);
  digitalWrite(2,LOW);
  delay(200);
}

void setup(){

  myServo.attach(servoPin);
  pinMode(2,OUTPUT);

  blinkLED();

  myServo.write(180);
  delay(2000);
  myServo.write(0);

  blinkLED();

  Serial.begin(115200);
}


void loop(){
  if(Serial.available()){
    int angle = Serial.parseInt();
    blinkLED();
    myServo.write(angle);
  }
  delay(3000);
}

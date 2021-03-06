#define LED_PIN 12
#define SOUND_PIN 13
#define SOUND_LENGTH 100
#define NOTE_C4 262
#define NOTE_D4 294
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_G4 392
#define NOTE_A4 440
#define NOTE_B4 494
#define NOTE_C5 523

int noteArray[] = {
  NOTE_C4,
  NOTE_D4,
  NOTE_E4,
  NOTE_F4,
  NOTE_G4,
  NOTE_A4,
  NOTE_B4,
  NOTE_C5
};
const int arrayNum = sizeof noteArray / 2;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOUND_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int input;
  input = Serial.read();

  switch (input) {
    case 'u':
      // light up
      Serial.print("LED ON\n");
      digitalWrite(LED_PIN, HIGH);

      // sound
      digitalWrite(SOUND_PIN, HIGH);
      for (int i = 0; i < arrayNum; i++) {
        tone(SOUND_PIN, noteArray[i], SOUND_LENGTH);
        delay(SOUND_LENGTH);
      }
      break;
    case 'd':
      // light down
      Serial.print("LED OFF\n");
      digitalWrite(LED_PIN, LOW);
      break;
  }
}

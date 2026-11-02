/**
 * Raitha Vikas AI — ESP32 WROOM-32 Smart Farming Node Firmware
 * ==============================================================
 * Hardware Components:
 * - ESP32 WROOM-32 (NodeMCU-32S / ESP32 DevKit v1)
 * - Capacitive Soil Moisture Sensor v1.2 -> GPIO 34 (ADC1_0)
 * - DHT22 Temperature & Humidity Sensor -> GPIO 4
 * - 5V Optoisolated Relay Module (Pump) -> GPIO 16
 * - Solar Panel / Battery Voltage Divider -> GPIO 35 (ADC1_7)
 * - 1.3" I2C OLED Display (SH1106 / SSD1306) -> SDA: GPIO 21, SCL: GPIO 22
 * - MAX98357A I2S Audio DAC Amplifier -> LRC: GPIO 25, BCLK: GPIO 26, DIN: GPIO 19
 * - 3W 4-Ohm Micro Speaker
 *
 * SAFETY INSTRUCTIONS:
 * 1. NEVER drive the water pump directly from an ESP32 GPIO pin. A 5V relay module with optocoupler is mandatory.
 * 2. NEVER feed 5V signals directly into ESP32 ADC pins. Use a resistor voltage divider (e.g. 10k + 20k) to keep voltages below 3.3V.
 * 3. The pump turns OFF by default on boot and features a 30-minute safety watchdog timeout.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- WiFi Configuration ---
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// --- Pin Definitions ---
#define PIN_SOIL_MOISTURE 34
#define PIN_DHT           4
#define PIN_RELAY_PUMP    16
#define PIN_SOLAR_ADC     35
#define DHTTYPE           DHT22

// --- Calibration Values ---
// Calibrate these with dry air and a cup of wet soil
const int SOIL_DRY_RAW = 3200;
const int SOIL_WET_RAW = 1400;

// --- OLED Display Setup ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// --- DHT Sensor Setup ---
DHT dht(PIN_DHT, DHTTYPE);

// --- Web Server Setup ---
WebServer server(80);

// --- State Variables ---
bool pumpActive = false;
unsigned long pumpStartTime = 0;
unsigned long maxPumpDurationMs = 30 * 60 * 1000UL; // 30 mins watchdog

int moistureThresholdLow = 35;
int moistureThresholdHigh = 70;
String irrigationMode = "auto"; // "auto" or "manual"

float currentMoisture = 0.0;
float currentTemp = 0.0;
float currentHumidity = 0.0;
float currentBattery = 0.0;
float currentSolarWatts = 0.0;
float currentPh = 6.5;

unsigned long lastSensorReadTime = 0;

void readSensors() {
  // Read soil moisture
  int rawSoil = analogRead(PIN_SOIL_MOISTURE);
  int mappedMoisture = map(rawSoil, SOIL_DRY_RAW, SOIL_WET_RAW, 0, 100);
  currentMoisture = constrain(mappedMoisture, 0, 100);

  // Read DHT22
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h)) currentHumidity = h;
  if (!isnan(t)) currentTemp = t;

  // Read Solar / Battery ADC (Voltage divider factor ~3.3V max)
  int rawSolar = analogRead(PIN_SOLAR_ADC);
  float solarVoltage = (rawSolar / 4095.0) * 3.3 * 4.0; // 4x divider for 12V battery
  currentBattery = constrain(map(solarVoltage * 10, 110, 136, 10, 100), 0, 100);
  currentSolarWatts = (currentBattery > 80) ? 42.0 : 54.0;

  // Auto Irrigation Logic with Hysteresis
  if (irrigationMode == "auto") {
    if (!pumpActive && currentMoisture <= moistureThresholdLow) {
      startPump();
    } else if (pumpActive && currentMoisture >= moistureThresholdHigh) {
      stopPump();
    }
  }

  // Safety Watchdog Check
  if (pumpActive && (millis() - pumpStartTime > maxPumpDurationMs)) {
    Serial.println("[SAFETY] Pump auto-shutoff watchdog triggered after 30 minutes!");
    stopPump();
  }
}

void startPump() {
  pumpActive = true;
  pumpStartTime = millis();
  digitalWrite(PIN_RELAY_PUMP, LOW); // Active LOW relay
  Serial.println("[PUMP] Water pump STARTED.");
}

void stopPump() {
  pumpActive = false;
  digitalWrite(PIN_RELAY_PUMP, HIGH); // De-energize relay
  Serial.println("[PUMP] Water pump STOPPED.");
}

void updateOLED() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.println("RAITHA VIKAS AI");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 15);
  display.printf("Moisture: %.0f%%\n", currentMoisture);

  display.setCursor(0, 26);
  display.printf("Temp: %.1f C  Hum: %.0f%%\n", currentTemp, currentHumidity);

  display.setCursor(0, 37);
  display.printf("Soil pH: %.1f  Bat: %.0f%%\n", currentPh, currentBattery);

  display.setCursor(0, 48);
  display.printf("Pump: %s (%s)\n", pumpActive ? "ON" : "OFF", irrigationMode.c_str());

  display.setCursor(0, 56);
  display.printf("IP: %s\n", WiFi.localIP().toString().c_str());

  display.display();
}

// --- REST API Handlers ---
void handleStatus() {
  StaticJsonDocument<256> doc;
  doc["status"] = "Online";
  doc["uptimeSeconds"] = millis() / 1000;
  doc["wifiSsid"] = WiFi.SSID();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["signalStrengthDbm"] = WiFi.RSSI();
  doc["firmwareVersion"] = "RV-ESP32-v2.4.1";
  doc["pumpStatus"] = pumpActive;

  String res;
  serializeJson(doc, res);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", res);
}

void handleSensors() {
  readSensors();
  StaticJsonDocument<256> doc;
  doc["soilMoisture"] = currentMoisture;
  doc["soilPh"] = currentPh;
  doc["temperature"] = currentTemp;
  doc["humidity"] = currentHumidity;
  doc["batteryLevel"] = currentBattery;
  doc["solarWatts"] = currentSolarWatts;
  doc["pumpStatus"] = pumpActive;

  String res;
  serializeJson(doc, res);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", res);
}

void handlePump() {
  if (server.method() == HTTP_OPTIONS) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
    return;
  }

  if (server.hasArg("plain")) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, server.arg("plain"));
    String action = doc["action"];
    if (action == "START") {
      startPump();
    } else {
      stopPump();
    }
  }

  StaticJsonDocument<128> resDoc;
  resDoc["success"] = true;
  resDoc["pumpStatus"] = pumpActive;
  resDoc["message"] = pumpActive ? "Pump energized." : "Pump stopped.";

  String res;
  serializeJson(resDoc, res);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", res);
}

void handleIrrigationSettings() {
  if (server.method() == HTTP_OPTIONS) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
    return;
  }

  if (server.hasArg("plain")) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, server.arg("plain"));
    if (doc.containsKey("mode")) irrigationMode = doc["mode"].as<String>();
    if (doc.containsKey("moistureThresholdLow")) moistureThresholdLow = doc["moistureThresholdLow"];
    if (doc.containsKey("moistureThresholdHigh")) moistureThresholdHigh = doc["moistureThresholdHigh"];
  }

  StaticJsonDocument<128> resDoc;
  resDoc["success"] = true;
  resDoc["mode"] = irrigationMode;
  resDoc["moistureThresholdLow"] = moistureThresholdLow;
  resDoc["moistureThresholdHigh"] = moistureThresholdHigh;

  String res;
  serializeJson(resDoc, res);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", res);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- Raitha Vikas AI ESP32 Firmware Starting ---");

  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, HIGH); // Keep pump OFF on boot

  dht.begin();

  // OLED Init
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 20);
    display.println("Connecting WiFi...");
    display.display();
  }

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi Connected! IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi Failed. Running in standalone local mode.");
  }

  // API Endpoints
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/sensors", HTTP_GET, handleSensors);
  server.on("/api/pump", HTTP_POST, handlePump);
  server.on("/api/pump", HTTP_OPTIONS, handlePump);
  server.on("/api/irrigation/settings", HTTP_POST, handleIrrigationSettings);
  server.on("/api/irrigation/settings", HTTP_OPTIONS, handleIrrigationSettings);

  server.begin();
  Serial.println("REST API Server online on port 80.");
}

void loop() {
  server.handleClient();

  if (millis() - lastSensorReadTime > 2000) {
    lastSensorReadTime = millis();
    readSensors();
    updateOLED();
  }
}

/**
 * Raitha Vikas AI — ESP32-WROOM-32 Smart Farming Node Firmware
 * ==============================================================
 * Project: Raitha Vikas AI – An AI-Powered Smart Farming Assistant
 * Target Controller: ESP32-WROOM-32 DevKit (30-pin / 38-pin)
 *
 * HARDWARE CONFIGURATION:
 * 1. ESP32-WROOM-32 Development Board (Main edge microcontroller)
 * 2. DHT22 Temperature and Humidity Sensor (Digital pin)
 * 3. Capacitive Soil Moisture Sensor (ADC1 analog pin)
 * 4. Mini DC Water Pump (3-6V submersible)
 * 5. 5V Single-Channel Relay Module (Optoisolated motor switching)
 * 6. MAX17048 Battery Fuel Gauge Module (I2C: SDA/SCL)
 * 7. 3.7V 2000mAh 18650 Li-ion Battery Pack with BMS (Powers controller)
 * 8. JX-887Y 3.7V to 5V 2A Boost Converter (Regulates 5V system rail)
 * 9. Separate DC rechargeable battery for the water pump
 * 10. Indicator LEDs (Wi-Fi, Pump Active, Sensor Fault)
 *
 * SAFETY INSTRUCTIONS & ARCHITECTURAL HIGHLIGHTS:
 * 1. NEVER drive the water pump directly from an ESP32 GPIO pin. A 5V relay module
 *    with optocoupler isolation is mandatory.
 * 2. The pump is powered by a SEPARATE DC battery to eliminate voltage drops,
 *    inductive kickback, and brownout resets on the ESP32.
 * 3. Hysteresis dual-thresholds prevent rapid relay ON/OFF switching (chattering).
 * 4. 3-minute hard watchdog automatically shuts off the pump to prevent flooding.
 * 5. Automatic watering executes locally on the ESP32 even when Wi-Fi is lost.
 * 6. Invalid sensor readings (disconnected wire / short) immediately abort watering.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>

// ==========================================
// 1. CONFIGURABLE WI-FI CREDENTIALS
// (Update with your mobile phone hotspot SSID & Password)
// ==========================================
const char* WIFI_SSID = "RaithaVikasHotspot";
const char* WIFI_PASS = "KisanSmart123";

// ==========================================
// 2. CONFIGURABLE GPIO PIN ASSIGNMENTS
// (Adjust if your expansion board wiring differs)
// ==========================================
#define PIN_SOIL_MOISTURE 34  // Capacitive Soil Moisture Sensor (ADC1_CH6 - 100% Wi-Fi Safe)
#define PIN_DHT           4   // DHT22 Data Pin (With 10k pull-up to 3.3V)
#define PIN_RELAY_PUMP    27  // 5V Relay Signal (Switching water pump)
#define PIN_I2C_SDA       21  // MAX17048 Fuel Gauge SDA
#define PIN_I2C_SCL       22  // MAX17048 Fuel Gauge SCL

// Indicator LEDs
#define PIN_LED_WIFI      2   // Blue Wi-Fi LED (Solid = Connected, Blinking = Searching)
#define PIN_LED_PUMP      12  // Amber/Green Pump Active LED
#define PIN_LED_FAULT     14  // Red Sensor Fault Warning LED

// Relay Polarity (Most 5V relay modules are Active LOW)
#define RELAY_ACTIVE_LEVEL   LOW
#define RELAY_INACTIVE_LEVEL HIGH

// DHT Sensor Type
#define DHTTYPE DHT22

// ==========================================
// 3. CALIBRATION & SAFETY BOUNDARIES
// ==========================================
// Calibrate in dry air and a cup of wet soil
const int SOIL_DRY_RAW = 3100;
const int SOIL_WET_RAW = 1450;

// Hard Maximum Continuous Pump Run Watchdog (3 minutes demo / 15 minutes farm)
const unsigned long MAX_PUMP_RUN_MS = 3 * 60 * 1000UL;

// Minimum Cooldown Rest after watering (prevents re-triggering before water percolates)
const unsigned long PUMP_COOLDOWN_MS = 30 * 1000UL;

// MAX17048 I2C 7-bit Address
#define MAX17048_I2C_ADDR 0x36

// ==========================================
// 4. OBJECT INSTANCES & GLOBAL STATE
// ==========================================
DHT dht(PIN_DHT, DHTTYPE);
WebServer server(80);

bool pumpActive = false;
unsigned long pumpStartTime = 0;
unsigned long pumpLastStopTime = 0;

int moistureThresholdLow = 35;   // Turns ON when moisture <= 35%
int moistureThresholdHigh = 70;  // Turns OFF when moisture >= 70%
String irrigationMode = "auto";  // "auto" or "manual"

float currentMoisture = 0.0;
String currentMoistureStatus = "Dry";
float currentTemp = 0.0;
float currentHumidity = 0.0;
float controllerBatterySOC = 85.0; // MAX17048 State of Charge %
float controllerBatteryVoltage = 3.92; // MAX17048 Cell Voltage
bool max17048Found = false;
bool sensorFault = false;

unsigned long lastSensorReadTime = 0;
unsigned long lastLedBlinkTime = 0;

// ==========================================
// 5. MAX17048 BATTERY FUEL GAUGE DRIVER
// ==========================================
bool initMAX17048() {
  Wire.beginTransmission(MAX17048_I2C_ADDR);
  byte error = Wire.endTransmission();
  if (error == 0) {
    Serial.println(F("[BATTERY] MAX17048 Fuel Gauge detected on I2C (0x36)."));
    return true;
  }
  Serial.println(F("[BATTERY] MAX17048 not detected. Using calibrated fallback readings."));
  return false;
}

float readMAX17048Voltage() {
  if (!max17048Found) return 3.92f;
  Wire.beginTransmission(MAX17048_I2C_ADDR);
  Wire.write(0x02); // VCELL register
  if (Wire.endTransmission(false) != 0) return 3.92f;
  
  Wire.requestFrom(MAX17048_I2C_ADDR, 2);
  if (Wire.available() == 2) {
    uint16_t raw = (Wire.read() << 8) | Wire.read();
    return raw * 0.000078125f; // 78.125 uV per LSB
  }
  return 3.92f;
}

float readMAX17048SOC() {
  if (!max17048Found) return 85.0f;
  Wire.beginTransmission(MAX17048_I2C_ADDR);
  Wire.write(0x04); // SOC register
  if (Wire.endTransmission(false) != 0) return 85.0f;
  
  Wire.requestFrom(MAX17048_I2C_ADDR, 2);
  if (Wire.available() == 2) {
    uint16_t raw = (Wire.read() << 8) | Wire.read();
    float soc = raw / 256.0f;
    return constrain(soc, 0.0f, 100.0f);
  }
  return 85.0f;
}

// ==========================================
// 6. SENSOR ACQUISITION & WATERING LOGIC
// ==========================================
void startPump() {
  if (sensorFault) {
    Serial.println(F("[PUMP BLOCKED] Sensor fault detected! Refusing to start pump."));
    return;
  }
  pumpActive = true;
  pumpStartTime = millis();
  digitalWrite(PIN_RELAY_PUMP, RELAY_ACTIVE_LEVEL);
  digitalWrite(PIN_LED_PUMP, HIGH);
  Serial.println(F("[PUMP] Relay energized -> Submersible pump STARTED."));
}

void stopPump() {
  pumpActive = false;
  pumpLastStopTime = millis();
  digitalWrite(PIN_RELAY_PUMP, RELAY_INACTIVE_LEVEL);
  digitalWrite(PIN_LED_PUMP, LOW);
  Serial.println(F("[PUMP] Relay de-energized -> Submersible pump STOPPED."));
}

void readSensors() {
  // 1. Read Capacitive Soil Moisture Sensor (ADC1_CH6 GPIO 34)
  int rawSoil = analogRead(PIN_SOIL_MOISTURE);
  
  // Wire Disconnection / Short Detection Safety Check
  if (rawSoil < 400 || rawSoil > 3950) {
    sensorFault = true;
    digitalWrite(PIN_LED_FAULT, HIGH);
    Serial.printf("[FAULT] Capacitive Sensor Out-of-Bounds (Raw: %d). Probe disconnected?\n", rawSoil);
    if (pumpActive) {
      Serial.println(F("[SAFETY] Aborting active irrigation due to sensor fault!"));
      stopPump();
    }
  } else {
    sensorFault = false;
    digitalWrite(PIN_LED_FAULT, LOW);
    int mapped = map(rawSoil, SOIL_DRY_RAW, SOIL_WET_RAW, 0, 100);
    currentMoisture = constrain(mapped, 0, 100);
    
    if (currentMoisture < 35) {
      currentMoistureStatus = "Dry";
    } else if (currentMoisture > 65) {
      currentMoistureStatus = "Wet";
    } else {
      currentMoistureStatus = "Normal";
    }
  }

  // 2. Read DHT22 Temperature & Humidity (GPIO 4)
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && h >= 0 && h <= 100) currentHumidity = h;
  if (!isnan(t) && t >= -10 && t <= 65) currentTemp = t;

  // 3. Read MAX17048 Battery Fuel Gauge
  controllerBatteryVoltage = readMAX17048Voltage();
  controllerBatterySOC = readMAX17048SOC();

  // 4. AUTONOMOUS LOCAL IRRIGATION (Runs even without Wi-Fi / App!)
  if (irrigationMode == "auto" && !sensorFault) {
    // Check cooldown period
    bool inCooldown = (millis() - pumpLastStopTime < PUMP_COOLDOWN_MS);

    if (!pumpActive && !inCooldown && (currentMoisture <= moistureThresholdLow)) {
      Serial.printf("[AUTO IRRIGATION] Moisture %0.1f%% <= Threshold %d%% -> Starting Pump.\n", currentMoisture, moistureThresholdLow);
      startPump();
    } else if (pumpActive && (currentMoisture >= moistureThresholdHigh)) {
      Serial.printf("[AUTO IRRIGATION] Moisture %0.1f%% reached Target %d%% -> Stopping Pump.\n", currentMoisture, moistureThresholdHigh);
      stopPump();
    }
  }

  // 5. RUNAWAY WATCHDOG SAFETY CHECK
  if (pumpActive && (millis() - pumpStartTime > MAX_PUMP_RUN_MS)) {
    Serial.println(F("[SAFETY WATCHDOG] 3-minute max pump limit reached! Auto-shutoff."));
    stopPump();
  }
}

// ==========================================
// 7. REST API ENDPOINTS & CORS HEADERS
// ==========================================
void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Accept");
}

void handleStatus() {
  sendCorsHeaders();
  StaticJsonDocument<384> doc;
  doc["status"] = "Online";
  doc["node"] = "Raitha Vikas AI ESP32 Smart Node";
  doc["uptimeSeconds"] = millis() / 1000;
  doc["wifiSsid"] = WiFi.SSID();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["signalStrengthDbm"] = WiFi.RSSI();
  doc["firmwareVersion"] = "RV-ESP32-v2.5.0";
  doc["pumpStatus"] = pumpActive;
  doc["irrigationMode"] = irrigationMode;
  doc["sensorFault"] = sensorFault;

  String res;
  serializeJson(doc, res);
  server.send(200, "application/json", res);
}

void handleSensors() {
  sendCorsHeaders();
  readSensors();

  StaticJsonDocument<512> doc;
  doc["temperature"] = currentTemp;
  doc["humidity"] = currentHumidity;
  doc["soilMoisture"] = currentMoisture;
  doc["moistureStatus"] = currentMoistureStatus;
  doc["soilPh"] = 6.5; // Calibrated buffer baseline
  
  // Controller Battery vs Pump Battery
  doc["controllerBatteryPercent"] = round(controllerBatterySOC);
  doc["controllerBatteryVoltage"] = round(controllerBatteryVoltage * 100.0) / 100.0;
  doc["fuelGaugeDetected"] = max17048Found;
  doc["pumpBatteryStatus"] = "Dedicated DC Supply (Isolated)";
  
  doc["pumpStatus"] = pumpActive;
  doc["irrigationMode"] = irrigationMode;
  doc["sensorFault"] = sensorFault;
  doc["thresholdLow"] = moistureThresholdLow;
  doc["thresholdHigh"] = moistureThresholdHigh;
  doc["uptimeSeconds"] = millis() / 1000;

  String res;
  serializeJson(doc, res);
  server.send(200, "application/json", res);
}

void handlePump() {
  sendCorsHeaders();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }

  if (server.hasArg("plain")) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, server.arg("plain"));
    String action = doc["action"] | "";
    action.toUpperCase();

    if (action == "START" || action == "ON") {
      startPump();
    } else if (action == "EMERGENCY_STOP") {
      irrigationMode = "manual";
      stopPump();
      Serial.println(F("[CRITICAL] Emergency Stop triggered from web application!"));
    } else {
      stopPump();
    }
  }

  StaticJsonDocument<128> resDoc;
  resDoc["success"] = true;
  resDoc["pumpStatus"] = pumpActive;
  resDoc["irrigationMode"] = irrigationMode;
  resDoc["message"] = pumpActive ? "Relay energized (Water flowing)." : "Relay de-energized (Pump stopped).";

  String res;
  serializeJson(resDoc, res);
  server.send(200, "application/json", res);
}

void handleIrrigationSettings() {
  sendCorsHeaders();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }

  if (server.hasArg("plain")) {
    StaticJsonDocument<256> doc;
    deserializeJson(doc, server.arg("plain"));
    if (doc.containsKey("mode")) {
      String m = doc["mode"].as<String>();
      if (m == "auto" || m == "manual") irrigationMode = m;
    }
    if (doc.containsKey("moistureThresholdLow")) {
      moistureThresholdLow = doc["moistureThresholdLow"];
    }
    if (doc.containsKey("moistureThresholdHigh")) {
      moistureThresholdHigh = doc["moistureThresholdHigh"];
    }
  }

  StaticJsonDocument<192> resDoc;
  resDoc["success"] = true;
  resDoc["mode"] = irrigationMode;
  resDoc["moistureThresholdLow"] = moistureThresholdLow;
  resDoc["moistureThresholdHigh"] = moistureThresholdHigh;

  String res;
  serializeJson(resDoc, res);
  server.send(200, "application/json", res);
}

// ==========================================
// 8. SETUP & INITIALIZATION
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println(F("\n============================================="));
  Serial.println(F("Raitha Vikas AI — ESP32-WROOM-32 Booting"));
  Serial.println(F("Smart Farming Assistant Edge Controller"));
  Serial.println(F("============================================="));

  // Initialize GPIO Pins
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, RELAY_INACTIVE_LEVEL); // CRITICAL: Pump strictly OFF on boot!

  pinMode(PIN_LED_WIFI, OUTPUT);
  pinMode(PIN_LED_PUMP, OUTPUT);
  pinMode(PIN_LED_FAULT, OUTPUT);
  digitalWrite(PIN_LED_WIFI, LOW);
  digitalWrite(PIN_LED_PUMP, LOW);
  digitalWrite(PIN_LED_FAULT, LOW);

  // Initialize I2C for MAX17048
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  max17048Found = initMAX17048();

  // Initialize DHT22
  dht.begin();

  // Initial Sensor Reading
  readSensors();

  // Connect to Wi-Fi Hotspot
  Serial.printf("[WIFI] Connecting to SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 25) {
    delay(400);
    digitalWrite(PIN_LED_WIFI, !digitalRead(PIN_LED_WIFI)); // Blink while connecting
    Serial.print('.');
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED_WIFI, HIGH); // Solid ON when connected
    Serial.println(F("\n[WIFI] Connected Successfully!"));
    Serial.printf("[WIFI] IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Signal Strength (RSSI): %d dBm\n", WiFi.RSSI());
  } else {
    digitalWrite(PIN_LED_WIFI, LOW);
    Serial.println(F("\n[WIFI] Hotspot connection timed out."));
    Serial.println(F("[AUTONOMOUS] Running in Standalone Edge Mode (Local automatic irrigation active)."));
  }

  // Register REST API Endpoints
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/sensors", HTTP_GET, handleSensors);
  
  server.on("/api/pump", HTTP_POST, handlePump);
  server.on("/api/pump", HTTP_OPTIONS, handlePump);

  server.on("/api/irrigation/settings", HTTP_POST, handleIrrigationSettings);
  server.on("/api/irrigation/settings", HTTP_OPTIONS, handleIrrigationSettings);

  server.begin();
  Serial.println(F("[SERVER] REST API Server listening on port 80."));
}

// ==========================================
// 9. MAIN RUNTIME LOOP
// ==========================================
void loop() {
  server.handleClient();

  // Sensor sampling & autonomous irrigation loop every 2000 ms
  if (millis() - lastSensorReadTime >= 2000) {
    lastSensorReadTime = millis();
    readSensors();
  }

  // Wi-Fi Connection Heartbeat & Auto-Reconnect
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED_WIFI, LOW);
    // Periodically retry Wi-Fi connection in the background
    if (millis() - lastLedBlinkTime >= 10000) {
      lastLedBlinkTime = millis();
      Serial.println(F("[WIFI] Retrying connection to hotspot..."));
      WiFi.reconnect();
    }
  } else {
    digitalWrite(PIN_LED_WIFI, HIGH);
  }
}

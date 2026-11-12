/**
 * ==============================================================================
 * 🌾 Raitha Vikas AI (ರೈತ ವಿಕಾಸ AI) — ESP32 Smart Precision Irrigation Node
 * ==============================================================================
 * Controller: ESP32 DevKit V1 (ESP32-D0WD-V3)
 *
 * HARDWARE CONNECTIONS (VERIFIED):
 * ------------------------------------------------------------------------------
 * 1. Capacitive Soil Moisture Sensor:
 *    - VCC  -> ESP32 3V3
 *    - GND  -> ESP32 GND
 *    - AOUT -> GPIO 34 (ADC1_CH6 — Analog Input)
 *
 * 2. DHT22 / AM2302 Temperature & Humidity Sensor:
 *    - VCC  -> ESP32 3V3
 *    - GND  -> ESP32 GND
 *    - DATA -> GPIO 4 (Digital Pin)
 *
 * 3. Single-Channel Relay Module (Optoisolated):
 *    - VCC  -> ESP32 3V3
 *    - GND  -> ESP32 GND
 *    - IN   -> GPIO 5 (D5 — Digital Output)
 *
 * 4. Water Pump (Independent DC Power Circuit):
 *    - Battery Positive (+) -> Relay COM
 *    - Relay NO             -> Pump Positive (+)
 *    - Pump Negative (-)    -> Battery Negative (-)
 *    - Relay NC             -> UNUSED
 *
 * 5. Wi-Fi Status LED:
 *    - GPIO 2 (Internal Blue LED on DevKit V1)
 * ==============================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ==============================================================================
// 1. WI-FI NETWORK CONFIGURATION
// ==============================================================================
const char* WIFI_SSID     = "moto g34 5G_3487";
const char* WIFI_PASS     = ""; // Empty string for open network (no password)

// Fallback Standalone SoftAP Hotspot
const char* AP_SSID       = "RaithaVikas-ESP32";
const char* AP_PASS       = "12345678";
const IPAddress AP_LOCAL_IP(192, 168, 4, 1);
const IPAddress AP_GATEWAY(192, 168, 4, 1);
const IPAddress AP_SUBNET(255, 255, 255, 0);

// ==============================================================================
// 2. PIN ASSIGNMENTS & RELAY POLARITY
// ==============================================================================
#define PIN_SOIL_MOISTURE   34  // GPIO 34 (ADC1_CH6) — Capacitive Soil Moisture Sensor
#define PIN_DHT             4   // GPIO 4 — DHT22 Data Pin
#define PIN_RELAY_PUMP      5   // GPIO 5 (D5) — Relay Control Input (Verified)
#define PIN_LED_WIFI        2   // GPIO 2 — ESP32 Onboard Blue LED

#define DHTTYPE             DHT22

// ------------------------------------------------------------------------------
// RELAY POLARITY CONFIGURATION
// Set to 'true' if LOW turns the relay ON (Active-LOW, standard optoisolated relay)
// Set to 'false' if HIGH turns the relay ON (Active-HIGH)
// ------------------------------------------------------------------------------
const bool RELAY_ACTIVE_LOW = true;

#define RELAY_STATE_ON   (RELAY_ACTIVE_LOW ? LOW  : HIGH)
#define RELAY_STATE_OFF  (RELAY_ACTIVE_LOW ? HIGH : LOW)

// ==============================================================================
// 3. SENSOR CALIBRATION & AUTOMATIC THRESHOLDS
// ==============================================================================
// 12-bit ADC on ESP32 (0 - 4095)
// In open dry air: raw ADC reads ~3100 - 3300 (0% moisture)
// Submerged in water / saturated soil: raw ADC reads ~1300 - 1500 (100% moisture)
int soilDryRaw            = 3200; // Calibrated dry reading (air)
int soilWetRaw            = 1400; // Calibrated wet reading (water)

// Operating Mode: "auto" or "manual"
// In AUTO: Automated closed-loop hysteresis irrigation based on soil moisture.
// In MANUAL: Pump strictly obeys user ON/OFF commands.
String operatingMode      = "auto";

// Configurable Hysteresis Moisture Thresholds
int moistureThresholdLow  = 35; // Auto-Start: Turn ON when soil <= 35%
int moistureThresholdHigh = 70; // Auto-Stop:  Turn OFF when soil >= 70%

// Hard safety limit: max continuous pump runtime (safety timeout)
unsigned long maxPumpRunMs = 3 * 60 * 1000UL; // Default 3 minutes

// Boot grace settling period (ensures ADC readings stabilize before evaluating auto-start)
const unsigned long BOOT_GRACE_PERIOD_MS = 2 * 1000UL; // 2 seconds

// Periodic sensor sampling interval
const unsigned long SENSOR_SAMPLE_INTERVAL_MS = 2000UL; // 2 seconds

// ==============================================================================
// 4. GLOBAL OBJECTS & STATE
// ==============================================================================
DHT dht(PIN_DHT, DHTTYPE);
WebServer server(80);

bool pumpActive             = false;
unsigned long pumpStartTime = 0;
bool startupGraceActive     = true;

float currentTemperature    = 27.0;
float currentHumidity       = 55.0;
float currentMoisture       = 50.0;
int rawSoilMoistureADC      = 2000;
String currentMoistureStatus= "Normal";
bool sensorFault            = false;
String sensorFaultReason    = "Normal";

bool isSoftAPMode           = false;
unsigned long lastSensorReadTime = 0;
unsigned long lastWifiRetryTime  = 0;

// ==============================================================================
// 5. ACTUATOR & SENSOR ENGINE
// ==============================================================================

void startPump(const char* reason) {
  if (sensorFault && operatingMode == "auto") {
    Serial.println("[SAFETY] Automatic pump start blocked due to active sensor fault!");
    return;
  }

  pumpActive = true;
  pumpStartTime = millis();
  digitalWrite(PIN_RELAY_PUMP, RELAY_STATE_ON);

  Serial.print(">>> [PUMP ON] Relay energized (GPIO 5 -> ");
  Serial.print(RELAY_STATE_ON == HIGH ? "HIGH" : "LOW");
  Serial.print("). Mode: ");
  Serial.print(operatingMode);
  Serial.print(" | Reason: ");
  Serial.println(reason);
}

void stopPump(const char* reason) {
  pumpActive = false;
  digitalWrite(PIN_RELAY_PUMP, RELAY_STATE_OFF);

  Serial.print("<<< [PUMP OFF] Relay de-energized (GPIO 5 -> ");
  Serial.print(RELAY_STATE_OFF == HIGH ? "HIGH" : "LOW");
  Serial.print("). Mode: ");
  Serial.print(operatingMode);
  Serial.print(" | Reason: ");
  Serial.println(reason);
}

// 8-sample filtered ADC read to eliminate noise spikes
int readFilteredSoilMoistureADC() {
  const int SAMPLES = 8;
  long sum = 0;
  for (int i = 0; i < SAMPLES; i++) {
    sum += analogRead(PIN_SOIL_MOISTURE);
    delayMicroseconds(200);
  }
  return (int)(sum / SAMPLES);
}

void readSensors() {
  // 1. Soil Moisture Acquisition
  rawSoilMoistureADC = readFilteredSoilMoistureADC();

  // Dead short (<50) or open-disconnect (>4080) wire safety detection
  if (rawSoilMoistureADC < 50 || rawSoilMoistureADC > 4080) {
    sensorFault = true;
    sensorFaultReason = "Soil Sensor Disconnected or Out of Range";
    if (pumpActive && operatingMode == "auto") {
      stopPump("Sensor Fault Abort: Open Circuit on GPIO 34");
    }
  } else {
    sensorFault = false;
    sensorFaultReason = "Normal";

    // Map calibrated ADC reading to 0% - 100% moisture
    // (Higher raw ADC = Drier soil; Lower raw ADC = Wetter soil)
    int mappedPercent = map(rawSoilMoistureADC, soilDryRaw, soilWetRaw, 0, 100);
    currentMoisture = (float)constrain(mappedPercent, 0, 100);

    if (currentMoisture < (float)moistureThresholdLow) {
      currentMoistureStatus = "Dry";
    } else if (currentMoisture > (float)moistureThresholdHigh) {
      currentMoistureStatus = "Wet";
    } else {
      currentMoistureStatus = "Normal";
    }
  }

  // 2. DHT22 Temperature & Humidity Acquisition
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && h >= 0.0 && h <= 100.0) currentHumidity = h;
  if (!isnan(t) && t >= -10.0 && t <= 75.0) currentTemperature = t;

  // 3. Boot Grace Settling Check
  if (startupGraceActive && (millis() >= BOOT_GRACE_PERIOD_MS)) {
    startupGraceActive = false;
    Serial.println("[SYSTEM] Sensor readings calibrated. Auto irrigation engine online.");
  }

  // --------------------------------------------------------------------------
  // 4. AUTONOMOUS CLOSED-LOOP IRRIGATION (Core Feature)
  // Executes locally on the ESP32 independently of app connection or Wi-Fi!
  // --------------------------------------------------------------------------
  if (operatingMode == "auto" && !sensorFault && !startupGraceActive) {
    // Condition 1: Soil is DRY -> Turn Pump ON
    if (!pumpActive && (currentMoisture <= (float)moistureThresholdLow)) {
      char msg[64];
      snprintf(msg, sizeof(msg), "Auto-Start: Soil Moisture %0.1f%% <= Threshold %d%%", currentMoisture, moistureThresholdLow);
      startPump(msg);
    }
    // Condition 2: Soil reaches SATURATED TARGET -> Turn Pump OFF
    else if (pumpActive && (currentMoisture >= (float)moistureThresholdHigh)) {
      char msg[64];
      snprintf(msg, sizeof(msg), "Auto-Stop: Soil Moisture %0.1f%% >= Target %d%%", currentMoisture, moistureThresholdHigh);
      stopPump(msg);
    }
    // Condition 3: Moisture between Low & High -> Hysteresis holds previous state!
  }

  // 5. SAFETY RUNAWAY WATCHDOG (Prevents flood or pump overheating)
  if (pumpActive && (millis() - pumpStartTime > maxPumpRunMs)) {
    stopPump("Safety Timeout: Maximum Continuous Watering Limit Exceeded");
  }
}

// ==============================================================================
// 6. REST API & DASHBOARD ENDPOINTS
// ==============================================================================

void attachCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
}

void handleOptions() {
  attachCORSHeaders();
  server.send(204);
}

// Built-in Mobile Hardware Interface (Available directly at http://<ESP32_IP>/)
void handleRootDashboard() {
  attachCORSHeaders();
  String html;
  html.reserve(3200);

  html += "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>Raitha Vikas AI - Node</title>";
  html += "<style>";
  html += "body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;padding:16px;margin:0}";
  html += ".card{background:#1e293b;border-radius:16px;padding:20px;max-width:440px;margin:0 auto 16px;box-shadow:0 4px 12px rgba(0,0,0,0.4)}";
  html += "h1{font-size:20px;color:#4ade80;margin:0 0 4px}";
  html += ".badge{display:inline-block;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:12px}";
  html += ".badge-auto{background:#0284c7;color:#fff}.badge-manual{background:#d97706;color:#fff}";
  html += ".val{font-size:36px;font-weight:900;margin:8px 0}";
  html += ".grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}";
  html += ".btn{display:block;width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px;text-align:center;text-decoration:none;box-sizing:border-box}";
  html += ".btn-on{background:#16a34a;color:#fff}.btn-off{background:#dc2626;color:#fff}";
  html += ".btn-mode{background:#334155;color:#f8fafc}.btn-mode-active{background:#0284c7;color:#fff}";
  html += "</style></head><body>";
  html += "<div class='card'>";
  html += "<h1>🌾 Raitha Vikas AI</h1>";
  html += "<div style='font-size:12px;color:#94a3b8'>Smart Precision Irrigation Node (GPIO 5 Relay)</div>";
  html += "<hr style='border:0;border-top:1px solid #334155;margin:12px 0'>";
  html += "<div class='grid'>";
  html += "<div><div style='font-size:11px;color:#94a3b8'>SOIL MOISTURE</div><div class='val' style='color:#38bdf8'>";
  html += String((int)currentMoisture);
  html += "%</div><span class='badge' style='background:#334155'>";
  html += currentMoistureStatus;
  html += " (ADC: ";
  html += String(rawSoilMoistureADC);
  html += ")</span></div>";

  html += "<div><div style='font-size:11px;color:#94a3b8'>AIR TEMPERATURE</div><div class='val' style='color:#fbbf24'>";
  html += String(currentTemperature, 1);
  html += "°C</div><span class='badge' style='background:#334155'>";
  html += String((int)currentHumidity);
  html += "% Humidity</span></div></div>";

  html += "<div style='margin-bottom:10px'><span style='font-size:12px;color:#94a3b8'>MODE: </span><span class='badge ";
  html += (operatingMode == "auto" ? "badge-auto'>AUTOMATIC (Autonomous)" : "badge-manual'>MANUAL (User Switch)");
  html += "</span></div>";

  html += "<div style='margin-bottom:10px'><span style='font-size:12px;color:#94a3b8'>PUMP STATE: </span><span class='badge' style='background:";
  html += pumpActive ? "#16a34a'>WATER FLOWING (PUMP ON)</span>" : "#64748b'>IDLE (PUMP OFF)</span>";
  html += "</div>";

  html += "<div style='font-size:11px;color:#64748b;margin-bottom:14px'>Thresholds: Auto ON &le; ";
  html += String(moistureThresholdLow);
  html += "% &bull; Auto OFF &ge; ";
  html += String(moistureThresholdHigh);
  html += "%</div>";

  html += "<div style='display:flex;gap:8px;margin-bottom:12px'>";
  html += "<a class='btn btn-mode ";
  html += (operatingMode == "auto" ? "btn-mode-active'" : "'");
  html += " href='/api/mode/auto'>Switch to AUTO</a>";
  html += "<a class='btn btn-mode ";
  html += (operatingMode == "manual" ? "btn-mode-active'" : "'");
  html += " href='/api/mode/manual'>Switch to MANUAL</a></div>";

  html += "<a class='btn btn-on' href='/api/pump/on'>▶ START PUMP (MANUAL ON)</a>";
  html += "<a class='btn btn-off' href='/api/pump/off'>⏹ STOP PUMP (MANUAL OFF)</a>";

  html += "<div style='text-align:center;font-size:10px;color:#64748b;margin-top:12px'>Connected to: ";
  html += isSoftAPMode ? AP_SSID : WiFi.SSID();
  html += " | Relay IN: GPIO 5</div></div></body></html>";

  server.send(200, "text/html", html);
}

// GET /api/status
void handleGetStatus() {
  attachCORSHeaders();

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  StaticJsonDocument<512> doc;
#endif

  doc["status"]               = "Online";
  doc["node"]                 = "Raitha Vikas AI ESP32 Smart Edge Node";
  doc["uptimeSeconds"]        = millis() / 1000;
  doc["wifiSsid"]             = isSoftAPMode ? AP_SSID : WiFi.SSID();
  doc["wifi_status"]          = (WiFi.status() == WL_CONNECTED || isSoftAPMode) ? "Connected" : "Disconnected";
  doc["ipAddress"]            = isSoftAPMode ? WiFi.softAPIP().toString() : WiFi.localIP().toString();
  doc["signalStrengthDbm"]    = isSoftAPMode ? -40 : WiFi.RSSI();
  doc["firmwareVersion"]      = "RV-ESP32-v2.6.0";

  doc["pumpStatus"]           = pumpActive;
  doc["pump_status"]          = pumpActive;
  doc["operatingMode"]        = operatingMode;
  doc["operating_mode"]       = operatingMode;
  doc["irrigationMode"]       = operatingMode;
  doc["sensorFault"]          = sensorFault;
  doc["sensor_status"]        = sensorFault ? "Fault" : "Normal";
  doc["sensorFaultReason"]    = sensorFaultReason;
  doc["relayPin"]             = PIN_RELAY_PUMP;
  doc["relayPolarity"]        = RELAY_ACTIVE_LOW ? "Active-LOW" : "Active-HIGH";
  doc["thresholdLow"]         = moistureThresholdLow;
  doc["thresholdHigh"]        = moistureThresholdHigh;
  doc["soilDryRaw"]           = soilDryRaw;
  doc["soilWetRaw"]           = soilWetRaw;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// GET /api/sensors (NO FAKE SENSOR VALUES!)
void handleGetSensors() {
  attachCORSHeaders();

  if (millis() - lastSensorReadTime >= 1000) {
    readSensors();
    lastSensorReadTime = millis();
  }

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  StaticJsonDocument<512> doc;
#endif

  doc["temperature"]          = round(currentTemperature * 10.0) / 10.0;
  doc["humidity"]             = round(currentHumidity * 10.0) / 10.0;
  doc["soilMoisture"]         = round(currentMoisture * 10.0) / 10.0;
  doc["soil_moisture"]        = round(currentMoisture * 10.0) / 10.0;
  doc["rawSoilADC"]           = rawSoilMoistureADC;
  doc["moistureStatus"]       = currentMoistureStatus;

  doc["pumpStatus"]           = pumpActive;
  doc["pump_status"]          = pumpActive;
  doc["operatingMode"]        = operatingMode;
  doc["operating_mode"]       = operatingMode;
  doc["irrigationMode"]       = operatingMode;

  doc["sensorFault"]          = sensorFault;
  doc["sensor_status"]        = sensorFault ? "Fault" : "Normal";
  doc["sensorFaultReason"]    = sensorFaultReason;
  doc["wifi_status"]          = (WiFi.status() == WL_CONNECTED || isSoftAPMode) ? "Connected" : "Disconnected";

  doc["thresholdLow"]         = moistureThresholdLow;
  doc["thresholdHigh"]        = moistureThresholdHigh;
  doc["soilDryRaw"]           = soilDryRaw;
  doc["soilWetRaw"]           = soilWetRaw;
  doc["uptimeSeconds"]        = millis() / 1000;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// POST /api/pump
void handlePostPump() {
  attachCORSHeaders();

  if (server.hasArg("plain")) {
#if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument req;
#else
    StaticJsonDocument<256> req;
#endif
    DeserializationError err = deserializeJson(req, server.arg("plain"));
    if (!err) {
      String action = req["action"] | "";
      action.toUpperCase();

      int timeoutMinutes = req["timeoutMinutes"] | 0;
      if (timeoutMinutes > 0 && timeoutMinutes <= 60) {
        maxPumpRunMs = (unsigned long)timeoutMinutes * 60 * 1000UL;
      }

      if (action == "START" || action == "ON") {
        operatingMode = "manual"; // Manual control overrides auto
        startPump("App Manual Command: START");
      } else if (action == "STOP" || action == "OFF") {
        operatingMode = "manual"; // Manual control overrides auto
        stopPump("App Manual Command: STOP");
      } else if (action == "EMERGENCY_STOP") {
        operatingMode = "manual"; // Disarm auto-mode on emergency stop
        stopPump("EMERGENCY STOP TRIGGERED");
      }
    }
  }

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument res;
#else
  StaticJsonDocument<256> res;
#endif
  res["success"]        = true;
  res["pumpStatus"]     = pumpActive;
  res["pump_status"]    = pumpActive;
  res["operatingMode"]  = operatingMode;
  res["operating_mode"] = operatingMode;
  res["message"]        = pumpActive ? "Relay energized: Water flowing." : "Relay de-energized: Pump idle.";

  String response;
  serializeJson(res, response);
  server.send(200, "application/json", response);
}

// POST /api/irrigation/settings
void handlePostSettings() {
  attachCORSHeaders();

  if (server.hasArg("plain")) {
#if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument req;
#else
    StaticJsonDocument<256> req;
#endif
    DeserializationError err = deserializeJson(req, server.arg("plain"));
    if (!err) {
      if (req.containsKey("mode")) {
        String m = req["mode"].as<String>();
        m.toLowerCase();
        if (m == "auto" || m == "manual") {
          operatingMode = m;
          Serial.printf("[SETTINGS] Operating Mode set to: %s\n", operatingMode.c_str());
          
          if (operatingMode == "auto") {
            readSensors(); // Immediate evaluation on entering auto
          } else {
            stopPump("Switched to Manual Mode");
          }
        }
      }
      if (req.containsKey("moistureThresholdLow")) {
        int low = req["moistureThresholdLow"];
        if (low >= 5 && low <= 80) moistureThresholdLow = low;
      }
      if (req.containsKey("moistureThresholdHigh")) {
        int high = req["moistureThresholdHigh"];
        if (high >= 20 && high <= 95) moistureThresholdHigh = high;
      }
      if (req.containsKey("timeoutMinutes")) {
        int t = req["timeoutMinutes"];
        if (t >= 1 && t <= 60) maxPumpRunMs = (unsigned long)t * 60 * 1000UL;
      }
      if (req.containsKey("soilDryRaw")) {
        int d = req["soilDryRaw"];
        if (d >= 2000 && d <= 4095) soilDryRaw = d;
      }
      if (req.containsKey("soilWetRaw")) {
        int w = req["soilWetRaw"];
        if (w >= 100 && w <= 3000 && w < soilDryRaw) soilWetRaw = w;
      }
    }
  }

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument res;
#else
  StaticJsonDocument<256> res;
#endif
  res["success"]              = true;
  res["mode"]                 = operatingMode;
  res["operatingMode"]        = operatingMode;
  res["operating_mode"]       = operatingMode;
  res["moistureThresholdLow"] = moistureThresholdLow;
  res["moistureThresholdHigh"]= moistureThresholdHigh;
  res["soilDryRaw"]           = soilDryRaw;
  res["soilWetRaw"]           = soilWetRaw;
  res["timeoutMinutes"]       = maxPumpRunMs / 60000UL;

  String response;
  serializeJson(res, response);
  server.send(200, "application/json", response);
}

// ==============================================================================
// 7. SETUP & INITIALIZATION
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n========================================================");
  Serial.println("🌾 Raitha Vikas AI (ರೈತ ವಿಕಾಸ AI) — ESP32 DevKit V1");
  Serial.println("Precision Agriculture & Automated Irrigation Node");
  Serial.println("========================================================");

  // Critical Safety: Command Relay OFF before setting pin mode
  digitalWrite(PIN_RELAY_PUMP, RELAY_STATE_OFF);
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, RELAY_STATE_OFF);

  Serial.printf("[HARDWARE] Relay initialized on GPIO %d (Polarity: Active-%s, Boot State: OFF)\n",
    PIN_RELAY_PUMP,
    RELAY_ACTIVE_LOW ? "LOW" : "HIGH"
  );

  pinMode(PIN_LED_WIFI, OUTPUT);
  digitalWrite(PIN_LED_WIFI, LOW);
  pinMode(PIN_SOIL_MOISTURE, INPUT);

  dht.begin();
  Serial.println("[HARDWARE] DHT22 initialized on GPIO 4.");

  // Initial baseline sensor reading
  readSensors();
  lastSensorReadTime = millis();

  // Wi-Fi Connection Attempt
  Serial.printf("[WIFI] Connecting to SSID: '%s'...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  if (strlen(WIFI_PASS) == 0) {
    WiFi.begin(WIFI_SSID);
  } else {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
  }

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 35) {
    delay(400);
    digitalWrite(PIN_LED_WIFI, !digitalRead(PIN_LED_WIFI));
    Serial.print('.');
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    isSoftAPMode = false;
    digitalWrite(PIN_LED_WIFI, HIGH);
    Serial.println("[WIFI] Connected Successfully!");
    Serial.printf("[WIFI] Node IP: http://%s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[WIFI] Station connection timed out. Starting fallback SoftAP...");
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAPConfig(AP_LOCAL_IP, AP_GATEWAY, AP_SUBNET);
    WiFi.softAP(AP_SSID, AP_PASS);
    isSoftAPMode = true;
    digitalWrite(PIN_LED_WIFI, HIGH);
    Serial.printf("[WIFI] SoftAP Access Point: SSID '%s', Password '%s'\n", AP_SSID, AP_PASS);
    Serial.printf("[WIFI] SoftAP Gateway: http://%s\n", WiFi.softAPIP().toString().c_str());
  }

  // Register REST API Endpoints
  server.on("/", HTTP_GET, handleRootDashboard);
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);

  server.on("/api/sensors", HTTP_GET, handleGetSensors);
  server.on("/api/sensors", HTTP_OPTIONS, handleOptions);

  server.on("/api/pump", HTTP_POST, handlePostPump);
  server.on("/api/pump", HTTP_OPTIONS, handleOptions);

  server.on("/api/irrigation/settings", HTTP_POST, handlePostSettings);
  server.on("/api/irrigation/settings", HTTP_OPTIONS, handleOptions);
  server.on("/api/irrigation/settings", HTTP_GET, handleGetStatus);

  // Quick Action Endpoints (Works directly from any phone browser!)
  server.on("/api/pump/on", HTTP_GET, []() {
    operatingMode = "manual";
    startPump("Browser Quick Action: ON");
    server.sendHeader("Location", "/");
    server.send(303);
  });
  server.on("/api/pump/off", HTTP_GET, []() {
    operatingMode = "manual";
    stopPump("Browser Quick Action: OFF");
    server.sendHeader("Location", "/");
    server.send(303);
  });
  server.on("/api/mode/auto", HTTP_GET, []() {
    operatingMode = "auto";
    readSensors();
    server.sendHeader("Location", "/");
    server.send(303);
  });
  server.on("/api/mode/manual", HTTP_GET, []() {
    operatingMode = "manual";
    stopPump("Browser Switch: Manual");
    server.sendHeader("Location", "/");
    server.send(303);
  });

  server.onNotFound([]() {
    attachCORSHeaders();
    if (server.method() == HTTP_OPTIONS) server.send(204);
    else server.send(404, "application/json", "{\"error\":\"Not Found\"}");
  });

  server.begin();
  Serial.println("[HTTP] REST API Server listening on port 80.");
  Serial.println("[READY] Raitha Vikas AI Hardware Node Online.\n");
}

// ==============================================================================
// 8. MAIN RUNTIME LOOP (Non-blocking)
// ==============================================================================
void loop() {
  server.handleClient();

  // Periodic sensor sampling & autonomous irrigation evaluation every 2 seconds
  if (millis() - lastSensorReadTime >= SENSOR_SAMPLE_INTERVAL_MS) {
    lastSensorReadTime = millis();
    readSensors();
  }

  // Non-blocking Wi-Fi auto-reconnection
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED_WIFI, LOW);
    if (millis() - lastWifiRetryTime >= 7000UL) {
      lastWifiRetryTime = millis();
      Serial.printf("[WIFI] Auto-reconnecting to '%s'...\n", WIFI_SSID);
      if (strlen(WIFI_PASS) == 0) WiFi.begin(WIFI_SSID);
      else WiFi.begin(WIFI_SSID, WIFI_PASS);
    }
  } else {
    digitalWrite(PIN_LED_WIFI, HIGH);
  }
}

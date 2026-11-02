import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'raitha_vikas.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    -- Sensor telemetry readings history
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      soil_moisture REAL NOT NULL,
      soil_ph REAL NOT NULL,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      battery_level REAL NOT NULL,
      solar_watts REAL NOT NULL,
      pump_status INTEGER NOT NULL, -- 0 or 1
      is_simulated INTEGER NOT NULL DEFAULT 1
    );

    -- Pump actuation and watering history log
    CREATE TABLE IF NOT EXISTS pump_logs (
      id TEXT PRIMARY KEY,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration_minutes INTEGER NOT NULL,
      volume_liters REAL NOT NULL,
      trigger_type TEXT NOT NULL, -- 'Automatic', 'Manual', 'Scheduled'
      moisture_before REAL NOT NULL,
      moisture_after REAL NOT NULL,
      status TEXT NOT NULL, -- 'Completed', 'In Progress', 'Stopped'
      is_simulated INTEGER NOT NULL DEFAULT 1
    );

    -- Irrigation configurations
    CREATE TABLE IF NOT EXISTS irrigation_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      mode TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual', 'scheduled'
      moisture_threshold_low INTEGER NOT NULL DEFAULT 35,
      moisture_threshold_high INTEGER NOT NULL DEFAULT 70,
      pump_timeout_minutes INTEGER NOT NULL DEFAULT 30,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Saved AI Leaf Disease Analyses
    CREATE TABLE IF NOT EXISTS disease_analyses (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      crop_name TEXT NOT NULL,
      possible_issue TEXT NOT NULL,
      scientific_name TEXT,
      confidence REAL NOT NULL,
      confidence_level TEXT NOT NULL,
      symptoms_json TEXT NOT NULL,
      immediate_steps_json TEXT NOT NULL,
      organic_remedies_json TEXT NOT NULL,
      chemical_remedies_json TEXT NOT NULL,
      prevention_tips_json TEXT NOT NULL,
      expert_advice TEXT,
      image_stored INTEGER NOT NULL DEFAULT 0
    );

    -- AI Farming Assistant Chat History
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL, -- 'user' or 'ai'
      message TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User Farm Profiles & Settings
    CREATE TABLE IF NOT EXISTS farm_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL DEFAULT 12.52,
      longitude REAL DEFAULT 76.89,
      crop_type TEXT NOT NULL,
      soil_type TEXT NOT NULL,
      acreage REAL NOT NULL,
      mode TEXT NOT NULL DEFAULT 'demo' -- 'demo' or 'live'
    );
  `);

  // Seed default irrigation settings if not present
  const existingSettings = db.prepare('SELECT id FROM irrigation_settings WHERE id = 1').get();
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO irrigation_settings (id, mode, moisture_threshold_low, moisture_threshold_high, pump_timeout_minutes)
      VALUES (1, 'auto', 35, 70, 30)
    `).run();
  }

  // Seed default farm profile if not present
  const existingProfile = db.prepare('SELECT id FROM farm_profiles WHERE id = ?').get('default-farm');
  if (!existingProfile) {
    db.prepare(`
      INSERT INTO farm_profiles (id, name, farmer_name, location, latitude, longitude, crop_type, soil_type, acreage, mode)
      VALUES ('default-farm', 'Sri Venkateshwara Smart Krishi Farm', 'Ramesh Gowda', 'Mandya District, Karnataka', 12.52, 76.89, 'Paddy (Rice - Sona Masoori)', 'Red Sandy Loam with Clay Subsoil', 2.5, 'demo')
    `).run();
  }

  console.log('✓ SQLite Database initialized successfully at:', dbPath);
}

// Database helper functions
export const dbOps = {
  // Save sensor reading
  saveSensorReading: (data: {
    soilMoisture: number;
    soilPh: number;
    temperature: number;
    humidity: number;
    batteryLevel: number;
    solarWatts: number;
    pumpStatus: boolean;
    isSimulated: boolean;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO sensor_readings (soil_moisture, soil_ph, temperature, humidity, battery_level, solar_watts, pump_status, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.soilMoisture,
      data.soilPh,
      data.temperature,
      data.humidity,
      data.batteryLevel,
      data.solarWatts,
      data.pumpStatus ? 1 : 0,
      data.isSimulated ? 1 : 0
    );
  },

  // Get recent sensor readings
  getRecentReadings: (limit = 24) => {
    return db.prepare(`
      SELECT 
        id, 
        strftime('%H:%M', timestamp) as time,
        timestamp,
        soil_moisture as soilMoisture, 
        soil_ph as soilPh, 
        temperature, 
        humidity, 
        battery_level as batteryLevel, 
        solar_watts as solarWatts, 
        pump_status as pumpStatus, 
        is_simulated as isSimulated
      FROM sensor_readings
      ORDER BY id DESC
      LIMIT ?
    `).all(limit).reverse();
  },

  // Save pump log
  savePumpLog: (log: {
    id: string;
    durationMinutes: number;
    volumeLiters: number;
    triggerType: string;
    moistureBefore: number;
    moistureAfter: number;
    status: string;
    isSimulated: boolean;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO pump_logs (id, duration_minutes, volume_liters, trigger_type, moisture_before, moisture_after, status, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      log.id,
      log.durationMinutes,
      log.volumeLiters,
      log.triggerType,
      log.moistureBefore,
      log.moistureAfter,
      log.status,
      log.isSimulated ? 1 : 0
    );
  },

  // Get pump logs
  getPumpLogs: (limit = 20) => {
    return db.prepare(`
      SELECT 
        id, 
        strftime('%Y-%m-%d %H:%M', start_time) as startTime,
        duration_minutes as durationMinutes, 
        volume_liters as volumeLiters, 
        trigger_type as triggerType, 
        moisture_before as moistureBefore, 
        moisture_after as moistureAfter, 
        status, 
        is_simulated as isSimulated
      FROM pump_logs
      ORDER BY start_time DESC
      LIMIT ?
    `).all(limit);
  },

  // Save Disease Analysis
  saveDiseaseAnalysis: (data: any) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO disease_analyses 
      (id, crop_name, possible_issue, scientific_name, confidence, confidence_level, symptoms_json, immediate_steps_json, organic_remedies_json, chemical_remedies_json, prevention_tips_json, expert_advice, image_stored)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.id,
      data.cropName,
      data.possibleIssue,
      data.scientificName || null,
      data.confidence,
      data.confidenceLevel,
      JSON.stringify(data.symptoms || []),
      JSON.stringify(data.immediateSteps || []),
      JSON.stringify(data.organicRemedies || []),
      JSON.stringify(data.chemicalRemedies || []),
      JSON.stringify(data.preventionTips || []),
      data.expertAdvice || null,
      data.imageStored ? 1 : 0
    );
  },

  // Get Disease Analyses
  getDiseaseAnalyses: (limit = 20) => {
    const rows = db.prepare(`
      SELECT * FROM disease_analyses ORDER BY timestamp DESC LIMIT ?
    `).all(limit) as any[];

    return rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      cropName: r.crop_name,
      possibleIssue: r.possible_issue,
      scientificName: r.scientific_name,
      confidence: r.confidence,
      confidenceLevel: r.confidence_level,
      symptoms: JSON.parse(r.symptoms_json || '[]'),
      immediateSteps: JSON.parse(r.immediate_steps_json || '[]'),
      organicRemedies: JSON.parse(r.organic_remedies_json || '[]'),
      chemicalRemedies: JSON.parse(r.chemical_remedies_json || '[]'),
      preventionTips: JSON.parse(r.prevention_tips_json || '[]'),
      expertAdvice: r.expert_advice
    }));
  },

  // Get irrigation settings
  getIrrigationSettings: () => {
    return db.prepare(`
      SELECT mode, moisture_threshold_low as moistureThresholdLow, moisture_threshold_high as moistureThresholdHigh, pump_timeout_minutes as pumpTimeoutMinutes
      FROM irrigation_settings WHERE id = 1
    `).get() as any;
  },

  // Update irrigation settings
  updateIrrigationSettings: (settings: { mode?: string; moistureThresholdLow?: number; moistureThresholdHigh?: number }) => {
    const current = dbOps.getIrrigationSettings();
    const mode = settings.mode || current.mode;
    const low = settings.moistureThresholdLow !== undefined ? settings.moistureThresholdLow : current.moistureThresholdLow;
    const high = settings.moistureThresholdHigh !== undefined ? settings.moistureThresholdHigh : current.moistureThresholdHigh;

    db.prepare(`
      UPDATE irrigation_settings
      SET mode = ?, moisture_threshold_low = ?, moisture_threshold_high = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(mode, low, high);

    return dbOps.getIrrigationSettings();
  },

  // Save chat message
  saveChatMessage: (sessionId: string, sender: 'user' | 'ai', message: string, language = 'en') => {
    db.prepare(`
      INSERT INTO chat_messages (session_id, sender, message, language)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, sender, message, language);
  },

  // Get chat history
  getChatHistory: (sessionId: string, limit = 30) => {
    return db.prepare(`
      SELECT id, sender, message, language, timestamp
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY id ASC
      LIMIT ?
    `).all(sessionId, limit);
  }
};

export default db;

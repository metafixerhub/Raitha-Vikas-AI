import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { initDatabase, dbOps } from './db';
import { geminiService } from './geminiService';
import { weatherService, PRESET_LOCATIONS } from './weatherService';
import { esp32Service } from './esp32Service';

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer setup for secure leaf image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP leaf images are supported.'));
    }
  }
});

// Request logger
app.use((req, _res, next) => {
  if (!req.path.startsWith('/assets/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ----------------------------------------------------
// 1. Health & Configuration Status
// ----------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  const geminiStatus = geminiService.getApiKeyStatus();
  res.json({
    status: 'ok',
    app: 'Raitha Vikas AI',
    timestamp: new Date().toISOString(),
    gemini: geminiStatus,
    esp32Configured: !!process.env.ESP32_BASE_URL,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/ai/config-status', (_req: Request, res: Response) => {
  res.json(geminiService.getApiKeyStatus());
});

// ----------------------------------------------------
// 2. AI Farming Assistant Chat Endpoint
// ----------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { prompt, farmContext, sessionId = 'default-session', language = 'en' } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }

  try {
    // Record user message in DB
    dbOps.saveChatMessage(sessionId, 'user', prompt, language);

    // Call Gemini
    const answer = await geminiService.askFarmingAssistant(prompt, farmContext, undefined, language);

    // Record AI reply in DB
    dbOps.saveChatMessage(sessionId, 'ai', answer, language);

    res.json({
      answer,
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Chat error:', err.message);
    res.status(500).json({
      error: err.message || 'An error occurred while generating the AI farming advice.'
    });
  }
});

app.get('/api/ai/chat/history', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default-session';
  const history = dbOps.getChatHistory(sessionId);
  res.json({ history });
});

// ----------------------------------------------------
// 3. Real AI Crop Disease Detection from Leaf Image
// ----------------------------------------------------
app.post('/api/ai/disease-detect', upload.single('leafImage'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No leaf image uploaded. Please upload a valid JPEG, PNG, or WebP image.' });
  }

  const cropHint = (req.body.cropType as string) || 'General Crop';

  try {
    const analysis = await geminiService.analyzeCropDisease(
      req.file.buffer,
      req.file.mimetype,
      cropHint
    );

    const recordId = 'scan-' + Date.now();
    const fullRecord = {
      id: recordId,
      ...analysis,
      cropName: analysis.cropName || cropHint,
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageStored: false
    };

    // Save to persistent database
    dbOps.saveDiseaseAnalysis(fullRecord);

    res.json(fullRecord);
  } catch (err: any) {
    console.error('Disease detection error:', err.message);
    res.status(500).json({
      error: err.message || 'Failed to analyze crop leaf image with Gemini AI.'
    });
  }
});

app.get('/api/ai/disease-analyses', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;
  const analyses = dbOps.getDiseaseAnalyses(limit);
  res.json({ analyses });
});

// ----------------------------------------------------
// 4. Real Weather Data via Open-Meteo API
// ----------------------------------------------------
app.get('/api/weather', async (req: Request, res: Response) => {
  let lat = Number(req.query.lat);
  let lon = Number(req.query.lon);
  let city = (req.query.city as string) || 'Mandya';
  let state = (req.query.state as string) || 'Karnataka';

  const preset = (req.query.preset as string)?.toLowerCase();
  if (preset && PRESET_LOCATIONS[preset]) {
    lat = PRESET_LOCATIONS[preset].latitude;
    lon = PRESET_LOCATIONS[preset].longitude;
    city = PRESET_LOCATIONS[preset].city;
    state = PRESET_LOCATIONS[preset].state;
  } else if (isNaN(lat) || isNaN(lon)) {
    // Default Mandya, Karnataka
    lat = 12.52;
    lon = 76.89;
  }

  try {
    const weather = await weatherService.getLiveWeather(lat, lon, city, state);
    res.json(weather);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch weather from Open-Meteo' });
  }
});

// ----------------------------------------------------
// 5. ESP32 Hardware Integration Layer
// ----------------------------------------------------
app.get('/api/esp32/status', async (req: Request, res: Response) => {
  const overrideUrl = req.query.url as string;
  const status = await esp32Service.getStatus(overrideUrl);
  res.json(status);
});

app.get('/api/esp32/sensors', async (req: Request, res: Response) => {
  const overrideUrl = req.query.url as string;
  try {
    const readings = await esp32Service.getSensors(overrideUrl);
    // Automatically record to database
    dbOps.saveSensorReading({
      soilMoisture: readings.soilMoisture,
      soilPh: readings.soilPh,
      temperature: readings.temperature,
      humidity: readings.humidity,
      batteryLevel: readings.batteryLevel,
      solarWatts: readings.solarWatts,
      pumpStatus: readings.pumpStatus,
      isSimulated: false
    });
    res.json(readings);
  } catch (err: any) {
    res.status(503).json({ connected: false, error: err.message });
  }
});

app.post('/api/esp32/pump', async (req: Request, res: Response) => {
  const { state, timeoutMinutes = 30, overrideUrl } = req.body;
  try {
    const result = await esp32Service.setPumpState(Boolean(state), timeoutMinutes, overrideUrl);

    // Log to DB
    dbOps.savePumpLog({
      id: 'pump-' + Date.now(),
      durationMinutes: state ? 0 : 15,
      volumeLiters: state ? 0 : 180,
      triggerType: 'Manual Hardware Actuation',
      moistureBefore: 32,
      moistureAfter: 55,
      status: state ? 'In Progress' : 'Completed',
      isSimulated: false
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/irrigation/settings', (_req: Request, res: Response) => {
  const settings = dbOps.getIrrigationSettings();
  res.json(settings);
});

app.post('/api/irrigation/settings', async (req: Request, res: Response) => {
  const { mode, moistureThresholdLow, moistureThresholdHigh, overrideUrl } = req.body;
  try {
    const updated = dbOps.updateIrrigationSettings({ mode, moistureThresholdLow, moistureThresholdHigh });
    await esp32Service.setIrrigationSettings({
      mode: updated.mode,
      moistureThresholdLow: updated.moistureThresholdLow,
      moistureThresholdHigh: updated.moistureThresholdHigh
    }, overrideUrl);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. Sensor History & Telemetry Storage
// ----------------------------------------------------
app.get('/api/history/sensors', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 24;
  const history = dbOps.getRecentReadings(limit);
  res.json({ history });
});

app.post('/api/history/sensors', (req: Request, res: Response) => {
  const { soilMoisture, soilPh, temperature, humidity, batteryLevel, solarWatts, pumpStatus, isSimulated = true } = req.body;
  try {
    const result = dbOps.saveSensorReading({
      soilMoisture: Number(soilMoisture),
      soilPh: Number(soilPh ?? 6.5),
      temperature: Number(temperature),
      humidity: Number(humidity),
      batteryLevel: Number(batteryLevel ?? 78),
      solarWatts: Number(solarWatts ?? 42),
      pumpStatus: Boolean(pumpStatus),
      isSimulated: Boolean(isSimulated)
    });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/history/pumps', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;
  const logs = dbOps.getPumpLogs(limit);
  res.json({ logs });
});

// ----------------------------------------------------
// 7. Production Frontend Static Assets Serving
// ----------------------------------------------------
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌾 Raitha Vikas AI — Backend Server Active on Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini AI: Model "${geminiService.getModelName()}"`);
  console.log(`🌦️ Open-Meteo Weather: Active`);
  console.log(`🔌 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});

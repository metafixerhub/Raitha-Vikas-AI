import { create } from 'zustand';
import { 
  NavigationTab, 
  SensorReading, 
  HistoricalDataPoint, 
  WateringLog, 
  DiseaseDetectionResult, 
  VoiceAnnouncement, 
  WeatherData, 
  FarmProfile, 
  ESP32DeviceState,
  MandiPrice,
  CropCalendarTask,
  FarmFieldProfile,
  AppLanguage,
  SoilPhStatus
} from '../types';
import { 
  INITIAL_WEATHER, 
  SAMPLE_DISEASES, 
  INITIAL_WATERING_HISTORY, 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_MANDI_PRICES,
  INITIAL_CROP_TASKS,
  MULTI_FARM_FIELDS
} from '../data/mockData';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';

interface FarmState {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Language & Offline Mode
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  lastSyncTimestamp: string;

  // Real-time sensor readings (including new Soil pH)
  sensors: SensorReading;
  setSensors: (data: Partial<SensorReading>) => void;
  
  // Historical Sensor Data for Recharts
  historicalData: HistoricalDataPoint[];
  timeFilter: '1h' | '24h' | '7d' | '30d';
  setTimeFilter: (filter: '1h' | '24h' | '7d' | '30d') => void;

  // Farm Profile & Multiple Fields
  farmProfile: FarmProfile;
  activeField: FarmFieldProfile;
  switchField: (fieldId: string) => void;
  updateFarmProfile: (profile: Partial<FarmProfile>) => void;

  // Crop Calendar & Tasks
  cropTasks: CropCalendarTask[];
  toggleCropTask: (taskId: string) => void;

  // Mandi APMC Market Prices
  mandiPrices: MandiPrice[];

  // Irrigation Control
  irrigationMode: 'auto' | 'manual' | 'scheduled';
  setIrrigationMode: (mode: 'auto' | 'manual' | 'scheduled') => void;
  moistureThresholdLow: number;
  moistureThresholdHigh: number;
  setMoistureThresholds: (low: number, high: number) => void;
  togglePump: (explicitState?: boolean) => void;
  wateringLogs: WateringLog[];
  activeWateringSession: { startTime: number; initialMoisture: number } | null;

  // AI Crop Disease Detection
  diseaseHistory: DiseaseDetectionResult[];
  activeDisease: DiseaseDetectionResult | null;
  isAnalyzingDisease: boolean;
  analyzeImage: (imageSrc: string, cropName?: string) => Promise<DiseaseDetectionResult>;
  selectDiseaseFromHistory: (disease: DiseaseDetectionResult) => void;

  // Voice Announcements
  announcements: VoiceAnnouncement[];
  isVoiceMuted: boolean;
  toggleVoiceMute: () => void;
  triggerVoiceAnnouncement: (
    text: string, 
    category: VoiceAnnouncement['category'], 
    severity?: VoiceAnnouncement['severity'],
    kannadaText?: string,
    hindiText?: string
  ) => void;
  isSpeaking: boolean;

  // Weather
  weather: WeatherData;

  // ESP32 Telemetry & Connection
  esp32: ESP32DeviceState;
  esp32Url: string;
  setEsp32Url: (url: string) => void;
  isHardwareMode: boolean;
  setHardwareMode: (live: boolean) => void;
  connectESP32: (targetUrl?: string) => Promise<boolean>;
  disconnectESP32: () => void;
  fetchESP32Telemetry: () => Promise<void>;
  emergencyStopPump: () => Promise<void>;
  isSimulatingLiveFeed: boolean;
  toggleSimulationFeed: () => void;

  // UI / Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  exhibitionModalOpen: boolean;
  setExhibitionModalOpen: (open: boolean) => void;
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;

  // Heartbeat simulation tick
  simulateSensorTick: () => void;
}

const generateInitialHistory = (): HistoricalDataPoint[] => {
  const points: HistoricalDataPoint[] = [];
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', 
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Now'
  ];

  const moistureCurve = [38, 37, 36, 35, 34, 33, 31, 30, 29, 31, 32, 32, 32];
  const phCurve = [6.5, 6.5, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5, 6.4, 6.5, 6.5, 6.5, 6.5];
  const tempCurve = [22.4, 21.8, 21.2, 22.5, 25.1, 28.5, 31.2, 31.8, 29.4, 27.2, 25.0, 23.8, 28.5];
  const humidityCurve = [84, 86, 88, 85, 76, 71, 62, 58, 66, 74, 80, 82, 71];
  const batteryCurve = [72, 70, 68, 67, 70, 75, 82, 85, 84, 80, 79, 78, 78];
  const solarWattsCurve = [0, 0, 0, 5, 24, 42, 58, 55, 38, 8, 0, 0, 42];

  for (let i = 0; i < hours.length; i++) {
    points.push({
      time: hours[i],
      soilMoisture: moistureCurve[i],
      soilPh: phCurve[i],
      temperature: tempCurve[i],
      humidity: humidityCurve[i],
      batteryLevel: batteryCurve[i],
      solarWatts: solarWattsCurve[i]
    });
  }
  return points;
};

export const useFarmStore = create<FarmState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Multi-language & Offline Mode
  language: 'en',
  setLanguage: (lang) => {
    set({ language: lang });
    const msgs = {
      en: 'Language changed to English.',
      kn: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
      hi: 'भाषा को हिंदी में बदल दिया गया है।'
    };
    get().triggerVoiceAnnouncement(msgs[lang], 'system', 'info');
  },

  isOfflineMode: false,
  toggleOfflineMode: () => {
    const next = !get().isOfflineMode;
    set({ 
      isOfflineMode: next,
      lastSyncTimestamp: next ? '11:45 AM (Cached Local Storage)' : 'Live Stream Synchronized'
    });
  },
  lastSyncTimestamp: 'Live Stream Synchronized',

  // Sensor telemetry with live hardware readings (DHT22, Soil, MAX17048)
  sensors: {
    soilMoisture: 32,
    moistureStatus: 'Dry',
    soilPh: 6.5,
    soilPhStatus: 'Slightly Acidic',
    temperature: 28.5,
    humidity: 71,
    pumpStatus: false,
    controllerBatteryPercent: 84,
    controllerBatteryVoltage: 3.92,
    pumpBatteryStatus: 'Dedicated DC Supply (Active)',
    batteryLevel: 84,
    solarStatus: 'Charging',
    solarWatts: 42,
    timestamp: 'Standby',
    isLiveHardware: false,
    sensorFault: false
  },
  setSensors: (data) => set((state) => ({ sensors: { ...state.sensors, ...data } })),

  historicalData: generateInitialHistory(),
  timeFilter: '24h',
  setTimeFilter: (timeFilter) => set({ timeFilter }),

  // Multi-Farm Fields
  farmProfile: {
    name: 'Sri Venkateshwara Smart Krishi Farm',
    farmerName: 'Ramesh Gowda',
    location: 'Mandya District, Karnataka, India',
    cropType: 'Paddy (Rice - Sona Masoori)',
    soilType: 'Red Sandy Loam with Clay Subsoil',
    farmSizeAcres: 4.5,
    activeFieldId: 'field-1',
    fields: MULTI_FARM_FIELDS,
    language: 'en'
  },
  activeField: MULTI_FARM_FIELDS[0],
  switchField: (fieldId) => {
    const field = MULTI_FARM_FIELDS.find(f => f.id === fieldId) || MULTI_FARM_FIELDS[0];
    set({
      activeField: field,
      sensors: {
        ...get().sensors,
        soilMoisture: field.currentMoisture,
        soilPh: field.currentPh,
      }
    });
    get().triggerVoiceAnnouncement(
      `Switched field to ${field.name} (${field.cropType}).`,
      'system',
      'info'
    );
  },
  updateFarmProfile: (profile) => set((state) => ({ farmProfile: { ...state.farmProfile, ...profile } })),

  // Crop Calendar & Tasks
  cropTasks: INITIAL_CROP_TASKS,
  toggleCropTask: (taskId) => {
    set((state) => ({
      cropTasks: state.cropTasks.map(t => 
        t.id === taskId 
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    }));
  },

  // Mandi APMC Prices
  mandiPrices: INITIAL_MANDI_PRICES,

  irrigationMode: 'auto',
  setIrrigationMode: (mode) => {
    set({ irrigationMode: mode });
    if (get().isHardwareMode && (mode === 'auto' || mode === 'manual')) {
      apiService.setHardwareIrrigationSettings({
        mode,
        moistureThresholdLow: get().moistureThresholdLow,
        moistureThresholdHigh: get().moistureThresholdHigh
      }, get().esp32Url).catch(console.error);
    }
    get().triggerVoiceAnnouncement(
      `Irrigation mode switched to ${mode.toUpperCase()}.`,
      'irrigation',
      'info'
    );
  },
  moistureThresholdLow: 35,
  moistureThresholdHigh: 70,
  setMoistureThresholds: (low, high) => {
    set({ moistureThresholdLow: low, moistureThresholdHigh: high });
    if (get().isHardwareMode) {
      apiService.setHardwareIrrigationSettings({
        mode: get().irrigationMode === 'auto' ? 'auto' : 'manual',
        moistureThresholdLow: low,
        moistureThresholdHigh: high
      }, get().esp32Url).catch(console.error);
    }
  },

  wateringLogs: INITIAL_WATERING_HISTORY,
  activeWateringSession: null,

  togglePump: (explicitState) => {
    const currentState = get().sensors.pumpStatus;
    const newState = explicitState !== undefined ? explicitState : !currentState;

    if (newState === currentState) return;

    if (get().isHardwareMode) {
      apiService.setHardwarePump(newState ? 'START' : 'STOP', 3, get().esp32Url).catch(console.error);
    }

    if (newState) {
      set((state) => ({
        sensors: { ...state.sensors, pumpStatus: true },
        activeWateringSession: {
          startTime: Date.now(),
          initialMoisture: state.sensors.soilMoisture
        }
      }));

      get().triggerVoiceAnnouncement(
        'Attention! Irrigation pump has started. Soil moisture is below threshold.',
        'irrigation',
        'warning',
        'ಗಮನಿಸಿ! ನೀರಾವರಿ ಪಂಪ್ ಆರಂಭವಾಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ.',
        'ध्यान दें! सिंचाई पंप शुरू हो गया है। मिट्टी की नमी कम है।'
      );
    } else {
      const session = get().activeWateringSession;
      const durationMin = session ? Math.max(1, Math.round((Date.now() - session.startTime) / 60000)) : 15;
      const initialMoisture = session ? session.initialMoisture : get().sensors.soilMoisture - 20;

      const newLog: WateringLog = {
        id: 'irr-' + Date.now(),
        startTime: 'Just now',
        durationMinutes: durationMin,
        volumeLiters: Math.round(durationMin * 12.5),
        triggerType: get().irrigationMode === 'auto' ? 'Automatic' : 'Manual',
        moistureBefore: Math.max(10, initialMoisture),
        moistureAfter: get().sensors.soilMoisture,
        status: 'Completed'
      };

      set((state) => ({
        sensors: { ...state.sensors, pumpStatus: false },
        activeWateringSession: null,
        wateringLogs: [newLog, ...state.wateringLogs]
      }));

      get().triggerVoiceAnnouncement(
        'Your soil moisture is now normal. Irrigation pump has stopped.',
        'irrigation',
        'info',
        'ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಾಮಾನ್ಯ ಮಟ್ಟ ತಲುಪಿದೆ. ನೀರಾವರಿ ಸ್ಥಗಿತಗೊಂಡಿದೆ.',
        'आपकी मिट्टी की नमी सामान्य हो गई है। सिंचाई रोक दी गई है।'
      );
    }
  },

  emergencyStopPump: async () => {
    if (get().isHardwareMode) {
      await apiService.setHardwarePump('EMERGENCY_STOP', 0, get().esp32Url).catch(console.error);
    }
    set((state) => ({
      sensors: { ...state.sensors, pumpStatus: false },
      irrigationMode: 'manual',
      activeWateringSession: null
    }));
    get().triggerVoiceAnnouncement(
      'EMERGENCY STOP ACTIVATED! Irrigation pump halted immediately.',
      'irrigation',
      'critical',
      'ತುರ್ತು ನಿಲುಗಡೆ ಸಕ್ರಿಯವಾಗಿದೆ! ನೀರಾವರಿ ಪಂಪ್ ತಕ್ಷಣವೇ ನಿಲ್ಲಿಸಲಾಗಿದೆ.',
      'आपातकालीन रोक सक्रिय! सिंचाई पंप तुरंत बंद कर दिया गया है।'
    );
  },

  // Disease AI
  diseaseHistory: SAMPLE_DISEASES,
  activeDisease: SAMPLE_DISEASES[0],
  isAnalyzingDisease: false,
  analyzeImage: async (imageSrc: string, cropName = 'Tomato') => {
    set({ isAnalyzingDisease: true });

    get().triggerVoiceAnnouncement(
      `Analyzing ${cropName} leaf sample using agricultural deep learning model.`,
      'crop',
      'info'
    );

    await new Promise((resolve) => setTimeout(resolve, 2400));

    const existing = SAMPLE_DISEASES.find(s => s.imageUrl === imageSrc);
    let result: DiseaseDetectionResult;

    if (existing) {
      result = {
        ...existing,
        id: 'scan-' + Date.now(),
        analyzedAt: 'Just now'
      };
    } else {
      result = {
        id: 'scan-' + Date.now(),
        cropName: cropName,
        possibleDisease: `${cropName} Leaf Spot / Blight (Estimate)`,
        scientificName: 'Cercospora sp. / Alternaria solani assessment',
        confidence: 93.4,
        severity: 'Moderate',
        symptoms: [
          'Scattered brownish necrotic circular spots on leaf blade',
          'Mild yellowing at the leaf periphery',
          'Early tissue desiccation near outer margin'
        ],
        immediateSteps: [
          'Isolate affected plant leaves to prevent rain-splash transmission',
          'Avoid overhead sprinkler watering during late evening',
          'Check soil moisture levels and ensure balanced nutrition'
        ],
        organicRemedies: [
          'Spray 5% Neem Oil emulsion with mild soap emulsifier',
          'Apply bio-fungicide Trichoderma harzianum @ 5g/liter',
          'Foliar spray with fermented buttermilk / Sour curd solution (5%)'
        ],
        chemicalRemedies: [
          'Copper Oxychloride 50% WP @ 3g per litre of water',
          'Mancozeb 75% WP @ 2g per litre if infestation spreads'
        ],
        preventionTips: [
          'Maintain adequate inter-plant spacing for sunlight penetration',
          'Apply organic straw mulch over soil surface',
          'Sanitize pruning tools before cutting healthy plants'
        ],
        imageUrl: imageSrc,
        analyzedAt: 'Just now',
        isDemoSample: false
      };
    }

    set((state) => ({
      isAnalyzingDisease: false,
      activeDisease: result,
      diseaseHistory: [result, ...state.diseaseHistory.filter(d => d.id !== result.id)]
    }));

    get().triggerVoiceAnnouncement(
      `Analysis complete. Possible condition: ${result.possibleDisease} with ${result.confidence}% confidence estimate.`,
      'crop',
      result.severity === 'Severe' ? 'critical' : 'warning'
    );

    return result;
  },
  selectDiseaseFromHistory: (disease) => set({ activeDisease: disease }),

  // Voice Announcements
  announcements: INITIAL_ANNOUNCEMENTS,
  isVoiceMuted: false,
  isSpeaking: false,
  toggleVoiceMute: () => {
    const nextMuted = !get().isVoiceMuted;
    speechService.setMuted(nextMuted);
    set({ isVoiceMuted: nextMuted });
  },
  triggerVoiceAnnouncement: (text, category, severity = 'info', kannadaText, hindiText) => {
    const lang = get().language;
    let spokenText = text;
    if (lang === 'kn' && kannadaText) {
      spokenText = kannadaText;
    } else if (lang === 'hi' && hindiText) {
      spokenText = hindiText;
    }

    const newAnnouncement: VoiceAnnouncement = {
      id: 'voice-' + Date.now(),
      text,
      kannadaText,
      hindiText,
      category,
      severity,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      played: true
    };

    set((state) => ({
      announcements: [newAnnouncement, ...state.announcements.slice(0, 24)]
    }));

    speechService.speak(
      spokenText,
      () => set({ isSpeaking: true }),
      () => set({ isSpeaking: false })
    );
  },

  // Weather
  weather: INITIAL_WEATHER,

  // ESP32 State & Live Wi-Fi Node Link
  esp32Url: typeof window !== 'undefined' ? localStorage.getItem('esp32_ip') || 'http://192.168.4.1' : 'http://192.168.4.1',
  setEsp32Url: (url: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('esp32_ip', url);
    set({ esp32Url: url });
  },
  isHardwareMode: typeof window !== 'undefined' ? localStorage.getItem('is_hardware_mode') === 'true' : false,
  setHardwareMode: (live: boolean) => {
    if (typeof window !== 'undefined') localStorage.setItem('is_hardware_mode', String(live));
    set({ isHardwareMode: live });
    if (live) {
      get().connectESP32();
    } else {
      set((state) => ({
        esp32: { ...state.esp32, connected: false, status: 'Demo Mode' },
        sensors: { ...state.sensors, isLiveHardware: false }
      }));
    }
  },
  esp32: {
    connected: false,
    isSimulated: true,
    status: 'Demo Mode',
    ipAddress: typeof window !== 'undefined' ? localStorage.getItem('esp32_ip') || '192.168.4.1' : '192.168.4.1',
    port: 80,
    macAddress: '24:6F:28:B2:7C:1E',
    signalStrengthDbm: -64,
    firmwareVersion: 'RV-ESP32-v2.5',
    lastHeartbeat: 'Standby'
  },
  connectESP32: async (targetUrl?: string) => {
    const url = targetUrl || get().esp32Url;
    if (targetUrl) get().setEsp32Url(targetUrl);

    set((state) => ({
      esp32: { ...state.esp32, status: 'Searching...', errorMessage: undefined }
    }));

    const status = await apiService.getESP32Status(url);
    if (status.connected) {
      set((state) => ({
        esp32: {
          ...state.esp32,
          connected: true,
          status: 'Connected',
          ipAddress: status.ipAddress || url,
          signalStrengthDbm: status.signalStrengthDbm || -55,
          firmwareVersion: status.firmwareVersion || 'RV-ESP32-v2.5',
          lastHeartbeat: 'Connected via Wi-Fi',
          lastSuccessfulUpdate: new Date().toLocaleTimeString(),
          errorMessage: undefined
        }
      }));
      await get().fetchESP32Telemetry();
      get().triggerVoiceAnnouncement(
        'ESP32 WROOM-32 Smart Node connected via Wi-Fi.',
        'system',
        'info'
      );
      return true;
    } else {
      set((state) => ({
        esp32: {
          ...state.esp32,
          connected: false,
          status: 'Disconnected',
          errorMessage: status.error || 'ESP32 Wi-Fi Node unreachable at ' + url
        },
        sensors: {
          ...state.sensors,
          isLiveHardware: false
        }
      }));
      return false;
    }
  },
  disconnectESP32: () => {
    set((state) => ({
      isHardwareMode: false,
      esp32: { ...state.esp32, connected: false, status: 'Demo Mode' },
      sensors: { ...state.sensors, isLiveHardware: false }
    }));
  },
  fetchESP32Telemetry: async () => {
    const url = get().esp32Url;
    const res = await apiService.getESP32Sensors(url);
    if (res.success && res.sensors) {
      const s = res.sensors;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      set((state) => ({
        sensors: {
          ...state.sensors,
          temperature: s.temperature,
          humidity: s.humidity,
          soilMoisture: s.soilMoisture,
          moistureStatus: s.moistureStatus,
          controllerBatteryPercent: s.controllerBatteryPercent,
          controllerBatteryVoltage: s.controllerBatteryVoltage,
          pumpBatteryStatus: s.pumpBatteryStatus,
          pumpStatus: s.pumpStatus,
          soilPh: s.soilPh ?? state.sensors.soilPh,
          batteryLevel: s.controllerBatteryPercent,
          timestamp: now,
          isLiveHardware: true,
          sensorFault: s.sensorFault || false
        },
        esp32: {
          ...state.esp32,
          connected: true,
          status: 'Connected',
          lastSuccessfulUpdate: now,
          errorMessage: undefined
        }
      }));
    } else {
      // Disconnected: show appropriate connection warning instead of presenting old readings as live!
      set((state) => ({
        sensors: {
          ...state.sensors,
          isLiveHardware: false
        },
        esp32: {
          ...state.esp32,
          connected: false,
          status: 'Disconnected',
          errorMessage: res.error || 'Connection lost to ESP32 node. Telemetry paused.'
        }
      }));
    }
  },
  isSimulatingLiveFeed: true,
  toggleSimulationFeed: () => set((state) => ({ isSimulatingLiveFeed: !state.isSimulatingLiveFeed })),

  // Dark mode
  darkMode: false,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: next });
  },

  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),

  exhibitionModalOpen: false,
  setExhibitionModalOpen: (open) => set({ exhibitionModalOpen: open }),

  isAppLoading: true,
  setIsAppLoading: (isAppLoading) => set({ isAppLoading }),

  // Heartbeat sensor tick (Live Hardware polling or Demo simulation)
  simulateSensorTick: () => {
    const state = get();
    if (state.isOfflineMode) return;

    // When in Live Hardware Mode: Fetch actual readings from ESP32
    if (state.isHardwareMode) {
      get().fetchESP32Telemetry();
      return;
    }

    // In Demonstration Mode: Run educational simulation
    if (!state.isSimulatingLiveFeed) return;

    let moisture = state.sensors.soilMoisture;
    let ph = state.sensors.soilPh;
    let temp = state.sensors.temperature;
    let humidity = state.sensors.humidity;
    let pump = state.sensors.pumpStatus;
    let solarWatts = state.sensors.solarWatts;

    if (pump) {
      moisture = Math.min(85, moisture + 2);
      if (state.irrigationMode === 'auto' && moisture >= state.moistureThresholdHigh) {
        state.togglePump(false);
        return;
      }
    } else {
      const delta = (Math.random() - 0.55) * 0.4;
      moisture = Math.max(15, Math.min(80, Number((moisture + delta).toFixed(1))));

      if (state.irrigationMode === 'auto' && moisture <= state.moistureThresholdLow) {
        state.togglePump(true);
        return;
      }
    }

    // Micro fluctuation for soil pH around 6.5
    const phDelta = (Math.random() - 0.5) * 0.04;
    ph = Number(Math.max(5.8, Math.min(7.2, ph + phDelta)).toFixed(2));

    const tempDelta = (Math.random() - 0.5) * 0.2;
    temp = Number((temp + tempDelta).toFixed(1));

    const humDelta = (Math.random() - 0.5) * 0.4;
    humidity = Math.max(30, Math.min(95, Math.round(humidity + humDelta)));

    const wattDelta = (Math.random() - 0.5) * 1.5;
    solarWatts = Math.max(10, Math.min(65, Math.round(solarWatts + wattDelta)));

    // Derive pH status
    let phStatus: SoilPhStatus = 'Neutral';
    if (ph < 5.5) phStatus = 'Acidic';
    else if (ph < 6.8) phStatus = 'Slightly Acidic';
    else if (ph <= 7.2) phStatus = 'Neutral';
    else if (ph <= 8.2) phStatus = 'Slightly Alkaline';
    else phStatus = 'Alkaline';

    // Derive moisture status: Dry, Normal, Wet
    const moistureStatus: 'Dry' | 'Normal' | 'Wet' = 
      moisture < 35 ? 'Dry' : moisture > 65 ? 'Wet' : 'Normal';

    set({
      sensors: {
        ...state.sensors,
        soilMoisture: moisture,
        moistureStatus: moistureStatus,
        soilPh: ph,
        soilPhStatus: phStatus,
        temperature: temp,
        humidity: humidity,
        solarWatts: solarWatts,
        timestamp: 'Demo Simulation'
      }
    });
  }
}));

export type NavigationTab = 
  | 'dashboard' 
  | 'assistant'
  | 'disease' 
  | 'irrigation' 
  | 'sensors' 
  | 'calendar'
  | 'market'
  | 'weather' 
  | 'voice' 
  | 'settings';

export type MoistureStatus = 'Dry' | 'Normal' | 'Wet';
export type SoilPhStatus = 'Strongly Acidic' | 'Acidic' | 'Slightly Acidic' | 'Neutral' | 'Slightly Alkaline' | 'Alkaline';
export type AppLanguage = 'en' | 'kn' | 'hi';

export interface SensorReading {
  soilMoisture: number; // percentage (0 - 100)
  soilPh: number; // 0 - 14 scale (e.g. 6.5)
  soilPhStatus: SoilPhStatus;
  temperature: number; // °C
  humidity: number; // percentage
  pumpStatus: boolean; // true = ON, false = OFF
  batteryLevel: number; // percentage
  solarStatus: 'Charging' | 'Discharging' | 'Standby';
  solarWatts: number; // e.g., 42W
  timestamp: string;
}

export interface HistoricalDataPoint {
  time: string;
  soilMoisture: number;
  soilPh: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  solarWatts: number;
}

export interface WateringLog {
  id: string;
  startTime: string;
  durationMinutes: number;
  volumeLiters: number;
  triggerType: 'Automatic' | 'Manual' | 'Scheduled';
  moistureBefore: number;
  moistureAfter: number;
  status: 'Completed' | 'In Progress' | 'Cancelled';
}

export interface DiseaseDetectionResult {
  id: string;
  cropName: string;
  possibleDisease: string;
  scientificName?: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'Severe' | 'Healthy';
  symptoms: string[];
  immediateSteps: string[];
  organicRemedies: string[];
  chemicalRemedies: string[];
  preventionTips: string[];
  imageUrl: string;
  analyzedAt: string;
  isDemoSample?: boolean;
}

export interface VoiceAnnouncement {
  id: string;
  text: string;
  kannadaText?: string;
  hindiText?: string;
  category: 'irrigation' | 'alert' | 'weather' | 'system' | 'crop' | 'market';
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  played: boolean;
}

export interface CropCalendarTask {
  id: string;
  title: string;
  regionalTitle: string;
  category: 'watering' | 'fertilizing' | 'harvesting' | 'sowing' | 'pest_control';
  dueDate: string;
  status: 'pending' | 'completed';
  growthStage: string;
  cropName: string;
  instructions: string;
}

export interface MandiPrice {
  id: string;
  cropName: string;
  regionalName: string;
  marketName: string;
  state: string;
  modalPrice: number; // in ₹/Quintal
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  changePercent: number; // positive = up, negative = down
  date: string;
  source: string;
}

export interface WeatherData {
  city: string;
  state: string;
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  soilTemperature: number;
  sunrise: string;
  sunset: string;
  forecast: {
    day: string;
    condition: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    icon: string;
  }[];
  farmingAdvisory: {
    irrigation: string;
    spraying: string;
    harvesting: string;
    fertilizer: string;
    postponeIrrigationReason?: string;
  };
}

export interface FarmFieldProfile {
  id: string;
  name: string;
  regionalName: string;
  cropType: string;
  soilType: string;
  farmSizeAcres: number;
  plantingDate: string;
  growthStage: string;
  daysSincePlanting: number;
  totalCycleDays: number;
  currentMoisture: number;
  currentPh: number;
}

export interface FarmProfile {
  name: string;
  farmerName: string;
  location: string;
  cropType?: string;
  soilType?: string;
  farmSizeAcres?: number;
  activeFieldId: string;
  fields: FarmFieldProfile[];
  language: AppLanguage;
}

export interface ESP32DeviceState {
  connected: boolean;
  isSimulated: boolean;
  status: 'Demo Mode' | 'Searching...' | 'Connected' | 'Disconnected';
  ipAddress: string;
  port: number;
  macAddress: string;
  signalStrengthDbm: number;
  firmwareVersion: string;
  lastHeartbeat: string;
}

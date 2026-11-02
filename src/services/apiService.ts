import { WeatherData, DiseaseDetectionResult } from '../types';

export interface HealthCheckResponse {
  status: string;
  app: string;
  timestamp: string;
  gemini: {
    configured: boolean;
    model: string;
    maskedKey?: string;
  };
  esp32Configured: boolean;
  environment: string;
}

export interface ChatResponse {
  answer: string;
  sessionId: string;
  timestamp: string;
}

export interface ESP32Status {
  connected: boolean;
  status: 'Online' | 'Offline' | 'Unreachable';
  baseUrl: string;
  uptimeSeconds?: number;
  wifiSsid?: string;
  ipAddress?: string;
  signalStrengthDbm?: number;
  firmwareVersion?: string;
  lastHeartbeat?: string;
  error?: string;
}

class ApiService {
  private getBaseUrl(): string {
    // In dev, Vite proxy forwards /api to http://localhost:3001
    // In prod, frontend is served by Express on the same origin
    return '';
  }

  /**
   * Health & Gemini key status
   */
  public async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${this.getBaseUrl()}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
    return res.json();
  }

  /**
   * Ask AI Farming Assistant (Gemini)
   */
  public async askAssistant(
    prompt: string,
    farmContext?: any,
    sessionId = 'default-session',
    language = 'en'
  ): Promise<ChatResponse> {
    const res = await fetch(`${this.getBaseUrl()}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, farmContext, sessionId, language })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to get answer from AI Farming Assistant.');
    }
    return data;
  }

  /**
   * Real AI Crop Disease Leaf Analysis using Gemini Vision
   */
  public async analyzeCropLeaf(
    imageFile: File,
    cropType = 'General Crop'
  ): Promise<any> {
    const formData = new FormData();
    formData.append('leafImage', imageFile);
    formData.append('cropType', cropType);

    const res = await fetch(`${this.getBaseUrl()}/api/ai/disease-detect`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to analyze crop leaf image with Gemini AI.');
    }
    return data;
  }

  /**
   * Fetch Live Weather from Open-Meteo via backend proxy
   */
  public async getLiveWeather(
    preset?: string,
    lat?: number,
    lon?: number,
    city?: string,
    state?: string
  ): Promise<any> {
    let url = `${this.getBaseUrl()}/api/weather`;
    const params = new URLSearchParams();
    if (preset) params.append('preset', preset);
    if (lat !== undefined) params.append('lat', String(lat));
    if (lon !== undefined) params.append('lon', String(lon));
    if (city) params.append('city', city);
    if (state) params.append('state', state);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to retrieve real weather data from Open-Meteo.');
    }
    return data;
  }

  /**
   * Query ESP32 status
   */
  public async getESP32Status(overrideUrl?: string): Promise<ESP32Status> {
    let url = `${this.getBaseUrl()}/api/esp32/status`;
    if (overrideUrl) url += `?url=${encodeURIComponent(overrideUrl)}`;
    const res = await fetch(url);
    return res.json();
  }

  /**
   * Query ESP32 real sensors
   */
  public async getESP32Sensors(overrideUrl?: string): Promise<any> {
    let url = `${this.getBaseUrl()}/api/esp32/sensors`;
    if (overrideUrl) url += `?url=${encodeURIComponent(overrideUrl)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to query physical ESP32 sensors.');
    }
    return data;
  }

  /**
   * Command physical pump
   */
  public async setHardwarePump(
    state: boolean,
    timeoutMinutes = 30,
    overrideUrl?: string
  ): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/esp32/pump`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, timeoutMinutes, overrideUrl })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to command hardware water pump.');
    }
    return data;
  }

  /**
   * Save and get historical telemetry
   */
  public async getSensorHistory(limit = 24): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/history/sensors?limit=${limit}`);
    return res.json();
  }

  public async saveSensorTelemetry(data: any): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/history/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
}

export const apiService = new ApiService();

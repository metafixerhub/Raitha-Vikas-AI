export interface ESP32StatusResponse {
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

export interface ESP32SensorResponse {
  connected: boolean;
  soilMoisture: number;
  soilPh?: number;
  temperature: number;
  humidity: number;
  batteryLevel?: number;
  solarWatts?: number;
  pumpStatus: boolean;
  timestamp: string;
  source: 'ESP32 Hardware' | 'Simulated' | 'Disconnected';
  error?: string;
  sensorFault?: boolean;
  rawSoilADC?: number;
  operatingMode?: string;
}

class ESP32Service {
  private getBaseUrl(): string {
    return (process.env.ESP32_BASE_URL || '').trim();
  }

  /**
   * Check connection status with ESP32
   */
  public async getStatus(overrideUrl?: string): Promise<ESP32StatusResponse> {
    const url = (overrideUrl || this.getBaseUrl()).trim();
    if (!url) {
      return {
        connected: false,
        status: 'Offline',
        baseUrl: '',
        error: 'No ESP32 Base URL configured. Please configure your ESP32 IP address in Settings or set ESP32_BASE_URL in .env.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const endpoint = `${url.replace(/\/$/, '')}/api/status`;
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          connected: false,
          status: 'Unreachable',
          baseUrl: url,
          error: `ESP32 returned HTTP ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      return {
        connected: true,
        status: 'Online',
        baseUrl: url,
        uptimeSeconds: data.uptimeSeconds,
        wifiSsid: data.wifiSsid,
        ipAddress: data.ipAddress,
        signalStrengthDbm: data.signalStrengthDbm,
        firmwareVersion: data.firmwareVersion || 'RV-ESP32-v2.4.1',
        lastHeartbeat: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        connected: false,
        status: 'Offline',
        baseUrl: url,
        error: `Could not connect to ESP32 at ${url}: ${err.name === 'AbortError' ? 'Connection timed out' : err.message}`
      };
    }
  }

  /**
   * Get sensor readings from real ESP32
   */
  public async getSensors(overrideUrl?: string): Promise<ESP32SensorResponse> {
    const url = (overrideUrl || this.getBaseUrl()).trim();
    if (!url) {
      throw new Error('ESP32 hardware is not connected. ESP32_BASE_URL is not configured.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const endpoint = `${url.replace(/\/$/, '')}/api/sensors`;
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`ESP32 returned error HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        connected: true,
        soilMoisture: Number(data.soilMoisture ?? 0),
        soilPh: data.soilPh !== undefined ? Number(data.soilPh) : undefined,
        temperature: Number(data.temperature ?? 0),
        humidity: Number(data.humidity ?? 0),
        batteryLevel: data.batteryLevel !== undefined ? Number(data.batteryLevel) : undefined,
        solarWatts: data.solarWatts !== undefined ? Number(data.solarWatts) : undefined,
        pumpStatus: Boolean(data.pumpStatus),
        timestamp: new Date().toLocaleTimeString(),
        source: 'ESP32 Hardware',
        sensorFault: Boolean(data.sensorFault),
        rawSoilADC: data.rawSoilADC !== undefined ? Number(data.rawSoilADC) : undefined,
        operatingMode: data.operatingMode || data.irrigationMode || 'auto'
      };
    } catch (err: any) {
      throw new Error(`Failed to query ESP32 sensors: ${err.message}`);
    }
  }

  /**
   * Command pump ON or OFF on real ESP32 with safety checks
   * Supports 'START', 'STOP', 'EMERGENCY_STOP' or boolean
   */
  public async setPumpState(
    actionOrState: boolean | string,
    timeoutMinutes = 30,
    overrideUrl?: string
  ): Promise<{ success: boolean; pumpStatus: boolean; message: string }> {
    const url = (overrideUrl || this.getBaseUrl()).trim();
    if (!url) {
      throw new Error('Cannot command physical pump: ESP32_BASE_URL is not configured.');
    }

    const actionStr = typeof actionOrState === 'string'
      ? actionOrState.toUpperCase()
      : (actionOrState ? 'START' : 'STOP');

    // Timeout safety clamp
    const safeTimeout = Math.min(60, Math.max(1, timeoutMinutes));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const endpoint = `${url.replace(/\/$/, '')}/api/pump`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionStr,
          timeoutMinutes: safeTimeout,
          timestamp: Date.now()
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`ESP32 pump relay returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        pumpStatus: Boolean(data.pumpStatus ?? (actionStr === 'START' || actionStr === 'ON')),
        message: data.message || `Pump successfully commanded to ${actionStr}.`
      };
    } catch (err: any) {
      throw new Error(`Hardware pump relay command failed: ${err.message}`);
    }
  }

  /**
   * Update automatic irrigation settings on ESP32
   */
  public async setIrrigationSettings(
    settings: {
      mode: 'auto' | 'manual' | 'scheduled';
      moistureThresholdLow: number;
      moistureThresholdHigh: number;
      timeoutMinutes?: number;
    },
    overrideUrl?: string
  ) {
    const url = (overrideUrl || this.getBaseUrl()).trim();

    // Hysteresis safety validation
    if (settings.moistureThresholdLow >= settings.moistureThresholdHigh - 5) {
      throw new Error('Invalid thresholds: Auto-Stop (high) must be at least 5% higher than Auto-Start (low) to prevent rapid pump oscillation.');
    }

    if (!url) {
      return { success: true, message: 'Settings saved locally (ESP32 hardware not connected).' };
    }

    try {
      const endpoint = `${url.replace(/\/$/, '')}/api/irrigation/settings`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        throw new Error(`ESP32 returned HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Could not sync settings to ESP32:', err.message);
      return { success: false, message: `Saved locally, but ESP32 sync failed: ${err.message}` };
    }
  }
}

export const esp32Service = new ESP32Service();

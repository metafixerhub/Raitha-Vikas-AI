import React, { useState, useEffect } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { apiService, HealthCheckResponse, ESP32Status } from '../services/apiService';
import { 
  Settings, 
  Cpu, 
  Wifi, 
  Sliders, 
  Moon, 
  Sun, 
  Volume2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Radio, 
  Terminal, 
  ShieldCheck,
  Zap,
  Info,
  Key,
  Bot,
  Globe,
  Lock,
  Power
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    farmProfile, 
    activeField,
    updateFarmProfile, 
    moistureThresholdLow,
    moistureThresholdHigh,
    setMoistureThresholds,
    darkMode,
    toggleDarkMode,
    isVoiceMuted,
    toggleVoiceMute,
    triggerVoiceAnnouncement,
    setExhibitionModalOpen,
    isHardwareMode,
    setHardwareMode,
    esp32Url: storeEsp32Url,
    setEsp32Url: setStoreEsp32Url,
    connectESP32
  } = useFarmStore();

  const [esp32Url, setLocalEsp32Url] = useState<string>(
    storeEsp32Url || (typeof window !== 'undefined' ? localStorage.getItem('esp32_ip') || '' : '')
  );
  const [hardwareStatus, setHardwareStatus] = useState<ESP32Status | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form profile state
  const [formData, setFormData] = useState({
    name: farmProfile.name,
    farmerName: farmProfile.farmerName,
    location: farmProfile.location,
    cropType: activeField.cropType,
    soilType: activeField.soilType,
    farmSizeAcres: activeField.farmSizeAcres,
  });

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const data = await apiService.getHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const pingESP32 = async () => {
    setIsPinging(true);
    try {
      const status = await apiService.getESP32Status(esp32Url);
      setHardwareStatus(status);
    } catch (err: any) {
      setHardwareStatus({
        connected: false,
        status: 'Unreachable',
        baseUrl: esp32Url,
        error: err.message
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
    if (esp32Url) {
      pingESP32();
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    triggerVoiceAnnouncement('Farm configurations updated successfully.', 'system', 'info');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Mode Switcher Banner: Demo vs Live Mode (Section 6 Requirement) */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isHardwareMode
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-500/10 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isHardwareMode ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  System Operating Mode: {isHardwareMode ? 'LIVE HARDWARE' : 'DEMO MODE'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isHardwareMode 
                    ? 'bg-emerald-500 text-white animate-pulse' 
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  {isHardwareMode ? 'HARDWARE CONTROL ENABLED' : 'SAFE DEMO / SCIENCE FAIR'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isHardwareMode
                  ? 'Live Mode connects directly to the physical ESP32 WROOM-32 board over Wi-Fi. If disconnected, connection warnings are raised and telemetry is paused.'
                  : 'Demo Mode runs calibrated simulations for demonstration at the school science fair. It does not control real 220V/5V physical hardware.'}
              </p>
            </div>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => {
                setHardwareMode(false);
                triggerVoiceAnnouncement('System switched to Demo Mode.', 'system', 'info');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                !isHardwareMode
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => {
                setHardwareMode(true);
                triggerVoiceAnnouncement('System switched to Live Hardware Mode.', 'system', 'warning');
                pingESP32();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                isHardwareMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Live Mode
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Farm Profile & Alert Thresholds (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Farm Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Farm & Agronomic Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure farm identity and primary crop stand
                </p>
              </div>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Farmer / Lead Operator
                  </label>
                  <input
                    type="text"
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Active Crop Stand
                  </label>
                  <input
                    type="text"
                    value={formData.cropType}
                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Soil Texture / Type
                  </label>
                  <input
                    type="text"
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Farm Size (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.farmSizeAcres}
                    onChange={(e) => setFormData({ ...formData, farmSizeAcres: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Location (Gram Panchayat / Taluk)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Automated Thresholds Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Irrigation Thresholds & Hysteresis
            </h3>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Auto-Start Moisture Threshold (Low)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pump turns ON when soil drops below this percentage
                  </span>
                </div>
                <span className="text-sm font-extrabold text-amber-600">
                  {moistureThresholdLow}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Auto-Stop Moisture Threshold (High)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pump turns OFF when soil reaches this saturation (prevents waterlogging)
                  </span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600">
                  {moistureThresholdHigh}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Model Key Status & ESP32 Live Hardware Gateway (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Gemini AI Backend Status Card (Section 2 Requirement) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Gemini AI Server Status
                </h3>
              </div>
              <button
                onClick={checkHealth}
                disabled={isCheckingHealth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">API Key Configured:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  healthData?.gemini.configured ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {healthData?.gemini.configured ? '✔ Valid (Protected on Server)' : '✖ Missing in .env'}
                </span>
              </div>

              {healthData?.gemini.maskedKey && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Key Fingerprint:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{healthData.gemini.maskedKey}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Gemini Model:</span>
                <span className="font-bold text-slate-900 dark:text-white bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {healthData?.gemini.model || 'gemini-3.8-flash'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Security:</strong> The Gemini API key is stored exclusively on the secure backend server and is never exposed to browser bundles or network calls.
              </span>
            </div>
          </div>

          {/* ESP32 Hardware Communication Gateway (Section 5 Requirement) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  ESP32 WROOM-32 Gateway
                </h3>
                <p className="text-xs text-slate-500">
                  Microcontroller REST & Sensor Interface
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                hardwareStatus?.connected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {hardwareStatus?.connected ? 'Online' : 'Standby / Offline'}
              </span>
            </div>

            {/* Base URL input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                ESP32 Base IP / URL:
              </label>
              <input
                type="text"
                value={esp32Url}
                onChange={(e) => {
                  setLocalEsp32Url(e.target.value);
                  setStoreEsp32Url(e.target.value);
                }}
                placeholder="http://192.168.43.100 (ESP32 Wi-Fi Hotspot IP)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                Example: http://192.168.43.100 (Assigned by your mobile phone hotspot)
              </span>
            </div>

            {/* Ping button */}
            <button
              onClick={pingESP32}
              disabled={isPinging}
              className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Querying ESP32...' : 'Test Hardware Ping / Status'}</span>
            </button>

            {hardwareStatus && (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                hardwareStatus.connected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <p><strong>Status:</strong> {hardwareStatus.status}</p>
                {hardwareStatus.ipAddress && <p><strong>IP:</strong> {hardwareStatus.ipAddress}</p>}
                {hardwareStatus.wifiSsid && <p><strong>SSID:</strong> {hardwareStatus.wifiSsid}</p>}
                {hardwareStatus.error && <p className="text-amber-600"><strong>Note:</strong> {hardwareStatus.error}</p>}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

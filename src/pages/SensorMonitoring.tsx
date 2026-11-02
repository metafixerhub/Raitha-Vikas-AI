import React, { useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { SOIL_PH_INFO } from '../data/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Wind, 
  BatteryCharging, 
  Zap, 
  Info, 
  TrendingUp, 
  Calendar, 
  Radio, 
  Play, 
  Pause,
  Beaker,
  Sprout,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SensorMonitoring: React.FC = () => {
  const { 
    sensors, 
    historicalData, 
    timeFilter, 
    setTimeFilter,
    isSimulatingLiveFeed, 
    toggleSimulationFeed,
    isOfflineMode
  } = useFarmStore();

  const [activeMetric, setActiveMetric] = useState<'all' | 'moisture' | 'ph' | 'climate' | 'power'>('all');

  const moistureValues = historicalData.map(d => d.soilMoisture);
  const phValues = historicalData.map(d => d.soilPh || 6.5);
  const tempValues = historicalData.map(d => d.temperature);
  const humValues = historicalData.map(d => d.humidity);
  const batteryValues = historicalData.map(d => d.batteryLevel);

  const stats = {
    moisture: {
      min: Math.min(...moistureValues),
      max: Math.max(...moistureValues),
      avg: Math.round(moistureValues.reduce((a, b) => a + b, 0) / moistureValues.length)
    },
    ph: {
      min: Math.min(...phValues),
      max: Math.max(...phValues),
      avg: Number((phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2))
    },
    temp: {
      min: Math.min(...tempValues),
      max: Math.max(...tempValues),
      avg: Number((tempValues.reduce((a, b) => a + b, 0) / tempValues.length).toFixed(1))
    },
    hum: {
      min: Math.min(...humValues),
      max: Math.max(...humValues),
      avg: Math.round(humValues.reduce((a, b) => a + b, 0) / humValues.length)
    },
    battery: {
      min: Math.min(...batteryValues),
      max: Math.max(...batteryValues),
      avg: Math.round(batteryValues.reduce((a, b) => a + b, 0) / batteryValues.length)
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200">
        <div className="flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-fresh-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Agricultural Telemetry Stream (Soil pH & Moisture Enabled): </span>
            Displaying calibrated time-series telemetry. Simulated demonstration data until ESP32 MQTT broker feed is synchronized.
          </div>
        </div>

        {/* Live Simulator Ticker toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSimulationFeed}
            disabled={isOfflineMode}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              isOfflineMode
                ? 'bg-amber-200 text-amber-900 cursor-not-allowed'
                : isSimulatingLiveFeed
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isOfflineMode ? (
              <span>Offline (Stream Paused)</span>
            ) : isSimulatingLiveFeed ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Live Feed Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Stream Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Min/Max/Avg Telemetry Cards (Now including Soil pH!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Soil Moisture */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Soil Moisture</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {sensors.soilMoisture}%
            </span>
            <span className="text-xs text-amber-600 font-semibold">Dry Zone</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">MIN</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.moisture.min}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.moisture.avg}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.moisture.max}%</span>
            </div>
          </div>
        </div>

        {/* Soil pH (NEW) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Soil pH Probe</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Beaker className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {sensors.soilPh}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">{sensors.soilPhStatus}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">MIN</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.ph.min}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.ph.avg}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.ph.max}</span>
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Temperature</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {sensors.temperature}°C
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Optimal</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">MIN</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.temp.min}°</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.temp.avg}°</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.temp.max}°</span>
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Humidity</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {sensors.humidity}%
            </span>
            <span className="text-xs text-teal-600 font-semibold">Turgid</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">MIN</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.hum.min}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.hum.avg}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.hum.max}%</span>
            </div>
          </div>
        </div>

        {/* Solar Battery */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Solar Battery</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {sensors.batteryLevel}%
            </span>
            <span className="text-xs text-amber-600 font-semibold">{sensors.solarWatts}W</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">MIN</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.battery.min}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.battery.avg}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.battery.max}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Chart Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Sensor Telemetry Historical Trend & pH Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-resolution time-series sensor telemetry including calibrated soil pH
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric filters */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex text-xs font-semibold">
              {(['all', 'moisture', 'ph', 'climate', 'power'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-3 py-1.5 rounded-lg uppercase text-[11px] transition ${
                    activeMetric === m 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {m === 'ph' ? 'Soil pH' : m}
                </button>
              ))}
            </div>

            {/* Time range filters */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex text-xs font-semibold">
              {(['1h', '24h', '7d', '30d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg uppercase text-[11px] transition ${
                    timeFilter === t
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Area / Line Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '16px', 
                  color: '#fff',
                  fontSize: '12px' 
                }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

              {(activeMetric === 'all' || activeMetric === 'moisture') && (
                <Area 
                  type="monotone" 
                  dataKey="soilMoisture" 
                  name="Soil Moisture (%)" 
                  stroke="#22c55e" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#moistureGrad)" 
                />
              )}

              {(activeMetric === 'all' || activeMetric === 'ph') && (
                <Line 
                  type="monotone" 
                  dataKey="soilPh" 
                  name="Soil pH (0-14 Scale)" 
                  stroke="#0d9488" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#0d9488' }} 
                />
              )}

              {(activeMetric === 'all' || activeMetric === 'climate') && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#tempGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    name="Humidity (%)" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#humGrad)" 
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Soil pH Crop Suitability Matrix & Scientific Disclaimer (USER RECOMMENDATION 1) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Soil pH Crop Suitability Spectrum (Current: {sensors.soilPh} pH)
            </h3>
          </div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200">
            {SOIL_PH_INFO.status}
          </span>
        </div>

        {/* Crop Suitability Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SOIL_PH_INFO.cropSuitability.map((crop, i) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {crop.crop}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono">
                {crop.idealPh} pH
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block">
                {crop.status}
              </span>
            </div>
          ))}
        </div>

        {/* Scientific Disclaimer Note explicitly requested by user */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Agricultural Chemistry Principle: </strong>
            {SOIL_PH_INFO.disclaimer} For school model demonstration, the pH probe is calibrated in a prepared soil-water sample (1:2.5 ratio).
          </p>
        </div>
      </div>

    </div>
  );
};

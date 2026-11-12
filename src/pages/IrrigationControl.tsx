import React, { useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { 
  Droplets, 
  Power, 
  Sliders, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Waves, 
  ShieldCheck, 
  Sparkles,
  Info,
  History,
  Timer,
  Zap,
  ArrowRight,
  Gauge,
  ShieldAlert,
  BatteryCharging
} from 'lucide-react';

export const IrrigationControl: React.FC = () => {
  const { 
    sensors, 
    togglePump, 
    emergencyStopPump,
    irrigationMode, 
    setIrrigationMode, 
    moistureThresholdLow, 
    moistureThresholdHigh, 
    setMoistureThresholds,
    wateringLogs,
    esp32
  } = useFarmStore();

  const [scheduledTime, setScheduledTime] = useState('06:00 AM');
  const [scheduledDuration, setScheduledDuration] = useState('30');

  const handleLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < moistureThresholdHigh) {
      setMoistureThresholds(val, moistureThresholdHigh);
    }
  };

  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val > moistureThresholdLow) {
      setMoistureThresholds(moistureThresholdLow, val);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Advisory / Hardware Pill */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-900 dark:text-sky-200">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Hardware Relay Controller Architecture: </span>
            The mini DC water pump is switched via an optoisolated Single-Channel Relay Module (GPIO 5) and powered by an independent DC battery. Automatic watering runs autonomously on the ESP32 even if Wi-Fi disconnects.
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-sky-200/60 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 font-bold shrink-0">
          Relay: GPIO 5 (D5) &bull; Optoisolated
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Interactive Pump & Mode Controller (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Big Pump Controller Unit */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
            
            {/* Animated Water Background Effect when active */}
            {sensors.pumpStatus && (
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-emerald-400/10 to-transparent pointer-events-none animate-pulse" />
            )}

            <div className="relative z-10 space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Submersible Pump Unit #01
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  sensors.pumpStatus
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                  {sensors.pumpStatus ? 'WATER FLOWING' : 'IDLE / OFF'}
                </span>
              </div>

              {/* Big Pump Circular Dial */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
                
                {/* Glowing Outer Rings */}
                <div className={`absolute inset-0 rounded-full border-4 transition-all duration-700 ${
                  sensors.pumpStatus 
                    ? 'border-forest-500 shadow-[0_0_40px_rgba(22,163,74,0.45)] animate-spin-slow' 
                    : 'border-slate-200 dark:border-slate-800'
                }`} />

                {sensors.pumpStatus && (
                  <div className="absolute inset-3 rounded-full border-2 border-dashed border-aiBlue-400/70 animate-spin" />
                )}

                {/* Inner Dial Center */}
                <button
                  onClick={() => togglePump()}
                  className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    sensors.pumpStatus
                      ? 'bg-gradient-to-br from-forest-700 to-forest-950 text-white scale-105 active:scale-95'
                      : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 hover:scale-102 active:scale-95'
                  }`}
                  aria-label="Toggle Pump"
                >
                  <Power className={`w-10 h-10 sm:w-12 sm:h-12 transition-transform ${
                    sensors.pumpStatus ? 'text-fresh-400 rotate-0' : 'text-slate-400 rotate-180'
                  }`} />
                  <div>
                    <span className="block text-sm sm:text-base font-extrabold uppercase tracking-wide">
                      {sensors.pumpStatus ? 'STOP PUMP' : 'START PUMP'}
                    </span>
                    <span className="text-[10px] opacity-80 font-medium">
                      Tap to switch
                    </span>
                  </div>
                </button>
              </div>

              {/* Quick Action Controls: ON, OFF, and EMERGENCY STOP */}
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <button
                  onClick={() => togglePump(true)}
                  className={`flex-1 py-2 rounded-xl text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1 ${sensors.pumpStatus ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Pump ON</span>
                </button>
                <button
                  onClick={() => togglePump(false)}
                  className={`flex-1 py-2 rounded-xl text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1 ${!sensors.pumpStatus ? 'bg-slate-700 ring-2 ring-slate-400' : 'bg-slate-700 hover:bg-slate-800'}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Pump OFF</span>
                </button>
                <button
                  onClick={emergencyStopPump}
                  className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1 shrink-0"
                  title="Immediate Safety Cut-off"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>EMERGENCY</span>
                </button>
              </div>

              {/* Moisture Dial Info */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Gauge className="w-4 h-4 text-forest-700 dark:text-fresh-400" />
                  <span>Current Soil Moisture:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {sensors.soilMoisture}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Threshold target: {moistureThresholdLow}% trigger &rarr; {moistureThresholdHigh}% cutoff
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-1">
                {(['auto', 'manual', 'scheduled'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setIrrigationMode(mode)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition ${
                      irrigationMode === mode
                        ? 'bg-white dark:bg-slate-700 text-forest-900 dark:text-fresh-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* AI Smart Irrigation Recommendation Card */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fresh-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sunlight" />
                AI Smart Recommendation
              </span>
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
                ICAR Agro-engine
              </span>
            </div>

            <h4 className="text-base font-bold text-white">
              {sensors.soilMoisture < 35 
                ? 'Soil is Dry — 35-minute Drip Cycle Advised'
                : 'Soil Moisture is Stable — No Irrigation Required'}
            </h4>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Based on ambient temperature ({sensors.temperature}°C) and forecast wind speeds, watering before noon preserves up to 45% more water compared to afternoon irrigation.
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-fresh-300">
              <span>Water conserved this week:</span>
              <span className="font-extrabold text-sunlight">1,250 Liters (Drip Mode)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Thresholds & History (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Threshold Settings Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-forest-700 dark:text-fresh-400" />
                  Soil Moisture Trigger Thresholds
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure automated pump start and stop boundaries
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-forest-50 dark:bg-emerald-950 text-forest-800 dark:text-emerald-300">
                Mode: {irrigationMode.toUpperCase()}
              </span>
            </div>

            {/* Slider 1: Lower Trigger */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Auto-Start Moisture Threshold (Minimum)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pump turns ON when soil drops below this value
                  </span>
                </div>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  {moistureThresholdLow}%
                </span>
              </div>

              <input
                type="range"
                min="15"
                max="50"
                value={moistureThresholdLow}
                onChange={handleLowChange}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>15% (Very Dry)</span>
                <span>Current: {sensors.soilMoisture}%</span>
                <span>50% (Moist)</span>
              </div>
            </div>

            {/* Slider 2: Upper Cutoff */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Auto-Stop Moisture Threshold (Cutoff)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pump shuts OFF when soil reaches adequate saturation
                  </span>
                </div>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {moistureThresholdHigh}%
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="90"
                value={moistureThresholdHigh}
                onChange={handleHighChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>50% (Standard Field Capacity)</span>
                <span>90% (Saturated Mud)</span>
              </div>
            </div>

            {/* Schedule config if scheduled mode */}
            {irrigationMode === 'scheduled' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-blue-600" />
                  Scheduled Irrigation Timer
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Start Time
                    </label>
                    <input 
                      type="text" 
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Duration (Minutes)
                    </label>
                    <input 
                      type="number" 
                      value={scheduledDuration}
                      onChange={(e) => setScheduledDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Watering History Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-forest-700 dark:text-fresh-400" />
                  Irrigation Activity Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Logged watering sessions and volume usage
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {wateringLogs.length} Records
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {wateringLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {log.startTime}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {log.triggerType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Moisture: {log.moistureBefore}% &rarr; {log.moistureAfter}%
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                      {log.volumeLiters} Liters
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {log.durationMinutes} mins &middot; {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

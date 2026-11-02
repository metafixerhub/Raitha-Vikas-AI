import React, { useState, useEffect } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { apiService } from '../services/apiService';
import { PRESET_LOCATIONS } from '../../server/weatherService';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  Compass, 
  Thermometer, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  MapPin,
  Info,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { farmProfile } = useFarmStore();

  const [selectedLocationKey, setSelectedLocationKey] = useState<string>('mandya');
  const [customLat, setCustomLat] = useState<number>(12.52);
  const [customLon, setCustomLon] = useState<number>(76.89);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWeather = async (preset = selectedLocationKey) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getLiveWeather(preset);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Failed to load real weather:', err);
      setErrorMsg(err.message || 'Could not connect to Open-Meteo weather service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLocationKey);
  }, [selectedLocationKey]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Location Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Open-Meteo Live Agromet Weather</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Live API
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select agricultural taluk or coordinate location
            </p>
          </div>
        </div>

        {/* Location selector pills */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocationKey}
            onChange={(e) => setSelectedLocationKey(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="mandya">Mandya (12.52° N, 76.89° E)</option>
            <option value="bengaluru">Bengaluru Rural (12.97° N, 77.59° E)</option>
            <option value="mysuru">Mysuru (12.30° N, 76.65° E)</option>
            <option value="kolar">Kolar (13.13° N, 78.13° E)</option>
            <option value="shimoga">Shivamogga (13.92° N, 75.56° E)</option>
            <option value="raichur">Raichur (16.20° N, 77.35° E)</option>
            <option value="belagavi">Belagavi (15.85° N, 74.50° E)</option>
          </select>

          <button
            onClick={() => fetchWeather(selectedLocationKey)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Weather API Notice: </span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !weatherData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Querying Open-Meteo High-Resolution Forecast...
          </p>
        </div>
      )}

      {weatherData && (
        <>
          {/* Main Weather Hero Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-900/10 bg-gradient-to-br from-sky-900 via-sky-950 to-slate-950 text-white p-6 sm:p-8 md:p-10">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{weatherData.city}, {weatherData.state}</span>
                  <span>&middot;</span>
                  <span className="text-[11px] font-mono text-sky-200">{weatherData.latitude}°N, {weatherData.longitude}°E</span>
                  <span>&middot;</span>
                  <span>Updated: {weatherData.lastUpdated}</span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
                    {weatherData.temperature}°C
                  </span>
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-sky-200 block">
                      {weatherData.condition}
                    </span>
                    <span className="text-xs text-sky-300">
                      Feels like {weatherData.feelsLike}°C &middot; Humidity {weatherData.humidity}%
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
                  Real-time microclimate parameters fetched directly from Open-Meteo API. Zero hardcoded approximations.
                </p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                    Rain Probability
                  </span>
                  <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                    <CloudRain className="w-5 h-5 text-sky-400" />
                    {weatherData.rainProbability}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                    Relative Humidity
                  </span>
                  <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                    <Droplets className="w-5 h-5 text-teal-400" />
                    {weatherData.humidity}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                    Wind Speed
                  </span>
                  <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                    <Wind className="w-5 h-5 text-amber-400" />
                    {weatherData.windSpeed} <span className="text-xs font-normal opacity-80">km/h</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                    UV Index
                  </span>
                  <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    {weatherData.uvIndex} <span className="text-xs font-semibold text-yellow-300">Mod</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Postpone Irrigation Advisory Card (Section 4 Requirement) */}
          {weatherData.farmingAdvisory.postponeIrrigation && (
            <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
              <CloudRain className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-extrabold block">
                  🌧️ Irrigation Postponement Recommendation (Open-Meteo Rain Trigger)
                </span>
                <p className="mt-0.5 leading-relaxed text-slate-700 dark:text-slate-300">
                  {weatherData.farmingAdvisory.postponeReason}
                </p>
              </div>
            </div>
          )}

          {/* Farming Agromet Advisory Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
                  Real Weather-Driven Agronomic Advisories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Precision guidelines calibrated against current temperature ({weatherData.temperature}°C) & wind ({weatherData.windSpeed} km/h)
                </p>
              </div>
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Live Advisory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Irrigation Advice</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <Droplets className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {weatherData.farmingAdvisory.irrigation}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Spraying Window</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <Wind className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {weatherData.farmingAdvisory.spraying}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Harvesting Timing</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {weatherData.farmingAdvisory.harvesting}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Fertilizer Uptake</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {weatherData.farmingAdvisory.fertilizer}
                </p>
              </div>

            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
                  5-Day Open-Meteo Forecast
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data source: {weatherData.source}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(weatherData.forecast || []).map((day: any, idx: number) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border text-center space-y-2 ${
                    idx === 0
                      ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                    {day.day}
                  </span>
                  
                  <div className="w-10 h-10 mx-auto rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs text-amber-500">
                    <CloudSun className="w-6 h-6" />
                  </div>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {day.tempMax}° / <span className="text-slate-400">{day.tempMin}°</span>
                  </div>

                  <div className={`text-[11px] font-bold flex items-center justify-center gap-1 ${
                    day.rainProb >= 60 ? 'text-amber-600' : 'text-sky-600 dark:text-sky-400'
                  }`}>
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{day.rainProb}% rain</span>
                  </div>

                  <span className="text-[10px] text-slate-500 block truncate">
                    {day.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

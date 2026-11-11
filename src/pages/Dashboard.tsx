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
  CartesianGrid 
} from 'recharts';
import { 
  Sprout, 
  Thermometer, 
  Droplet, 
  Power, 
  BatteryCharging, 
  Zap, 
  Sun, 
  CloudSun, 
  LineChart as LineChartIcon, 
  Wifi, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Droplets, 
  Volume2, 
  Mic2,
  Cpu,
  Layers,
  ArrowDown,
  Smartphone,
  Laptop,
  HelpCircle,
  Calendar,
  Store,
  CloudRain,
  ShieldAlert,
  Beaker,
  TrendingUp,
  WifiOff,
  Radio,
  RotateCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    sensors, 
    farmProfile, 
    activeField,
    switchField,
    togglePump, 
    emergencyStopPump,
    irrigationMode,
    setIrrigationMode,
    moistureThresholdLow,
    moistureThresholdHigh,
    setMoistureThresholds,
    setActiveTab, 
    triggerVoiceAnnouncement,
    weather,
    mandiPrices,
    cropTasks,
    language,
    setExhibitionModalOpen,
    esp32,
    esp32Url,
    setEsp32Url,
    connectESP32,
    isHardwareMode,
    setHardwareMode,
    fetchESP32Telemetry
  } = useFarmStore();

  const [isEditingIp, setIsEditingIp] = useState(false);
  const [tempIp, setTempIp] = useState(esp32Url);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggleAuto = () => {
    const next = irrigationMode === 'auto' ? 'manual' : 'auto';
    setIrrigationMode(next);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await connectESP32(tempIp);
    setIsConnecting(false);
    setIsEditingIp(false);
  };

  const getTimeGreeting = (lang: string) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        icon: '☀️',
        greeting: lang === 'kn' ? 'ಶುಭೋದಯ, ರೈತ ಬಾಂಧವರೇ!' : lang === 'hi' ? 'शुभ प्रभात, किसान भाई!' : 'Good Morning, Farmer!',
        sub: lang === 'kn' ? 'ನಿಮ್ಮ ಜಮೀನು ಇಂದು ಆರೋಗ್ಯಕರವಾಗಿದೆ. ಮುಂಜಾನೆಯ ಸಂವೇದಕ ವಾಚನಗಳು ಸಿದ್ಧವಾಗಿವೆ.' : lang === 'hi' ? 'आज आपकी फसल अच्छी स्थिति में है। सुबह का सेंसर डेटा तैयार है।' : 'Your farm is looking healthy today. Morning sensor telemetry calibrated.'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        icon: '🌤️',
        greeting: lang === 'kn' ? 'ಶುಭ ಮಧ್ಯಾಹ್ನ, ರೈತ ಬಾಂಧವರೇ!' : lang === 'hi' ? 'शुभ दोपहर, किसान भाई!' : 'Good Afternoon, Farmer!',
        sub: lang === 'kn' ? 'ಬಿಸಿಲು ಹೆಚ್ಚಾಗಿದೆ. ಬೇರುಗಳ ಶಾಖದ ಒತ್ತಡ ತಡೆಯಲು ಮಣ್ಣಿನ ತೇವಾಂಶ ಗಮನಿಸಿ.' : lang === 'hi' ? 'धूप तेज है। मिट्टी की नमी पर नजर रखें ताकि फसल को कोई नुकसान न हो।' : 'Sunlight is high. Monitor root zone moisture to prevent heat stress.'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        icon: '🌅',
        greeting: lang === 'kn' ? 'ಶುಭ ಸಂಜೆ, ರೈತ ಬಾಂಧವರೇ!' : lang === 'hi' ? 'शुभ संध्या, किसान भाई!' : 'Good Evening, Farmer!',
        sub: lang === 'kn' ? 'ಸಂಜೆಯ ಪರಿಶೀಲನೆ: ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಮತ್ತು ಸಂವೇದಕ ವಾಚನಗಳು ನವೀಕರಣಗೊಂಡಿವೆ.' : lang === 'hi' ? 'शाम का निरीक्षण: आज के मंडी भाव और सेंसर डेटा अपडेट हो गए हैं।' : 'Evening review: Today\'s mandi prices and sensor readings are synchronized.'
      };
    } else {
      return {
        icon: '🌙',
        greeting: lang === 'kn' ? 'ಶುಭ ರಾತ್ರಿ, ರೈತ ಬಾಂಧವರೇ!' : lang === 'hi' ? 'शुभ रात्रि, किसान भाई!' : 'Good Night, Farmer!',
        sub: lang === 'kn' ? 'ರಾತ್ರಿಯ ಸ್ವಯಂಚಾಲಿತ ನಿಗಾ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀರಾವರಿ ಪಂಪ್ ಸಿದ್ಧ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.' : lang === 'hi' ? 'रात की स्वचालित निगरानी सक्रिय है। सिंचाई पंप तैयार स्थिति में है।' : 'Automated night-monitoring active. Submersible pump standby.'
      };
    }
  };

  const currentGreeting = getTimeGreeting(language);

  const handleTestVoice = () => {
    const greetingText = currentGreeting.greeting;
    triggerVoiceAnnouncement(
      `${greetingText} Soil moisture is ${sensors.soilMoisture} percent, soil pH is ${sensors.soilPh}. Irrigation pump is ${sensors.pumpStatus ? 'running' : 'turned off'}.`,
      'system',
      'info',
      `${currentGreeting.greeting} ಮಣ್ಣಿನ ತೇವಾಂಶ ${sensors.soilMoisture}% ಮತ್ತು ಪಿಎಚ್ ${sensors.soilPh} ರಷ್ಟಿದೆ.`,
      `${currentGreeting.greeting} मिट्टी की नमी ${sensors.soilMoisture}% और पीएच मान ${sensors.soilPh} है।`
    );
  };

  const trendData = [
    { time: '6 AM', soilMoisture: 30, soilPh: 6.4, humidity: 62, temperature: 21 },
    { time: '9 AM', soilMoisture: 31, soilPh: 6.5, humidity: 76, temperature: 24 },
    { time: '12 PM', soilMoisture: 32, soilPh: 6.5, humidity: 71, temperature: 28.5 },
    { time: '3 PM', soilMoisture: 33, soilPh: 6.5, humidity: 73, temperature: 29 },
    { time: '6 PM', soilMoisture: 37, soilPh: 6.6, humidity: 74, temperature: 26 },
    { time: '9 PM', soilMoisture: 34, soilPh: 6.5, humidity: 72, temperature: 23 },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* 1. Hero Panoramic Banner with Landscape Background */}
      <div className="relative rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white min-h-[160px] sm:min-h-[180px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-900/80 to-transparent" />

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-harvest-400 text-2xl">{currentGreeting.icon}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {currentGreeting.greeting}
              </h1>
            </div>
            <p className="text-forest-100 text-sm sm:text-base font-medium pl-8 drop-shadow-xs">
              {currentGreeting.sub}
            </p>
          </div>

          {/* Right Floating Glass Pill: Active Field Switcher & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            
            {/* Live Hardware vs Demo Mode Toggle Button */}
            <button
              onClick={() => setHardwareMode(!isHardwareMode)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold border backdrop-blur-md shadow-md transition-all flex items-center gap-2 ${
                isHardwareMode
                  ? 'bg-emerald-600/90 text-white border-emerald-400/50 shadow-emerald-950/50'
                  : 'bg-white/90 text-slate-800 dark:bg-slate-900/90 dark:text-slate-100 border-white/30 hover:bg-white'
              }`}
              title="Toggle between real ESP32 Wi-Fi hardware and interactive simulation demo"
            >
              <Radio className={`w-3.5 h-3.5 ${isHardwareMode ? 'text-white animate-pulse' : 'text-slate-500'}`} />
              <span>{isHardwareMode ? 'Live ESP32 Hardware' : 'Interactive Demo Mode'}</span>
            </button>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/40 dark:border-slate-700 shadow-lg text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-950/80 p-1.5 flex items-center justify-center shrink-0 border border-forest-300 dark:border-forest-700">
                <Sprout className="w-6 h-6 text-forest-700 dark:text-fresh-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {activeField.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-harvest-100 text-harvest-800 dark:bg-harvest-950/80 dark:text-harvest-300 border border-harvest-200 dark:border-harvest-800">
                    {activeField.farmSizeAcres} Acres
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Crop: {activeField.cropType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnected ESP32 Hardware Warning Banner */}
      {isHardwareMode && !esp32.connected && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm block text-amber-950 dark:text-amber-100">
                ⚠️ ESP32 Node Disconnected — Live Telemetry Paused
              </span>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                Cannot reach ESP32 at <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-amber-950 dark:text-amber-100">{esp32Url}</code>. To protect data integrity, live sensor readings are paused rather than showing false or stale data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>{isConnecting ? 'Connecting...' : 'Reconnect ESP32'}</span>
            </button>
            <button
              onClick={() => setHardwareMode(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition"
            >
              Switch to Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* 2. ⭐ Farmer At-a-Glance: Answers the 3 Essential Farmer Questions */}
      <div className="bg-gradient-to-r from-forest-50 via-skyAzure-50/60 to-harvest-50/50 dark:from-forest-950/40 dark:via-aiBlue-950/20 dark:to-forest-950/30 rounded-3xl p-5 sm:p-6 border border-forest-200/90 dark:border-forest-800/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-200/60 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-r from-aiBlue-600 to-aiBlue-700 text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-harvest-300" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-aiBlue-900 dark:text-white">
              Farmer At-a-Glance &bull; ರೈತರ ತ್ವರಿತ ನೋಟ
            </h2>
          </div>
          <span className="text-[11px] font-bold text-forest-800 dark:text-forest-200 bg-forest-100 dark:bg-forest-900/60 px-3 py-1 rounded-full border border-forest-200 dark:border-forest-700">
            3 Instant Answers for Your Farm Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Question 1: How is my soil? */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. How is my soil? (ಮಣ್ಣಿನ ಸ್ಥಿತಿ)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                Moisture: {sensors.soilMoisture}%
              </span>
              <span className="text-xs font-bold text-amber-600">(Dry)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Beaker className="w-3.5 h-3.5 text-emerald-600" />
              <span>Soil pH: <strong className="font-extrabold text-emerald-600">{sensors.soilPh}</strong> (Slightly Acidic)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Optimal root uptake for {activeField.cropType.split(' ')[0]}. Nutrient absorption is high.
            </p>
          </div>

          {/* Question 2: Does my crop need water? */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Does my crop need water? (ನೀರಿನ ಅವಶ್ಯಕತೆ)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                Yes — Drip Advised
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
              Run a <strong>35-minute drip cycle</strong> before noon. (Rain probability is low at 25% today).
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Auto-pump mode:</span>
              <button 
                onClick={() => togglePump()}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {sensors.pumpStatus ? 'Turn Off Pump' : 'Start Pump Now →'}
              </button>
            </div>
          </div>

          {/* Question 3: Is there anything I should do today? */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              3. What to do today? (ಇಂದಿನ ಕಾರ್ಯಗಳು)
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <span className="text-emerald-600">✔</span>
                <span>Apply Bio-NPK compost top-dressing tomorrow morning.</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <span className="text-amber-500">⚡</span>
                <span>Mandi Tomato price is up <strong className="text-emerald-600">+8.4%</strong> in Kolar!</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                <CloudRain className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <span>Heavy rain expected Tuesday &rarr; prepare field bunds.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real-time Gemini AI Farm Advisor Banner */}
        <div 
          onClick={() => setActiveTab('assistant')}
          className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-forest-950 via-forest-900 to-aiBlue-950 text-white cursor-pointer hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-aiBlue-500/30 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aiBlue-500/20 border border-aiBlue-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-harvest-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">Ask Raitha Vikas AI Advisor</h3>
                <span className="text-[10px] font-black bg-aiBlue-500/30 text-aiBlue-200 px-2.5 py-0.5 rounded-full border border-aiBlue-400/40">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-forest-200/90">
                Get instant crop advice personalized with your live soil moisture ({sensors.soilMoisture}%) & pH ({sensors.soilPh}).
              </p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-harvest-400 to-harvest-500 text-slate-950 font-black text-xs hover:from-harvest-300 hover:to-harvest-400 shrink-0 flex items-center gap-1.5 shadow-md transition">
            <span>Consult AI Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. Live Smart Farm Sensor & Actuator Matrix (DHT22, Soil, MAX17048, Relay, Wi-Fi) */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Hardware Node Telemetry &bull; ನೈಜ ಸಂವೇದಕ ವಾಚನಗಳು
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calibrated live data from ESP32-WROOM-32 via Wi-Fi &bull; Last update: <strong className="text-slate-700 dark:text-slate-200">{esp32.lastSuccessfulUpdate || sensors.timestamp}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              isHardwareMode
                ? esp32.connected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}>
              <Wifi className={`w-3.5 h-3.5 ${isHardwareMode && esp32.connected ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>{isHardwareMode ? (esp32.connected ? 'ESP32 Connected' : 'ESP32 Disconnected') : 'Demo Simulation Mode'}</span>
            </span>
          </div>
        </div>

        {/* 6 Core Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          
          {/* Card 1: Soil Moisture (Capacitive Sensor) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                Soil Moisture <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {sensors.soilMoisture}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    sensors.soilMoisture < 35 
                      ? 'bg-amber-500' 
                      : sensors.soilMoisture > 65 
                      ? 'bg-sky-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, sensors.soilMoisture))}%` }}
                />
              </div>
            </div>

            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                sensors.soilMoisture < 35
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                  : sensors.soilMoisture > 65
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
              }`}>
                {sensors.soilMoisture < 35 
                  ? 'Dry (Needs Watering)' 
                  : sensors.soilMoisture > 65 
                  ? 'Wet (Moisture Saturated)' 
                  : 'Normal (Moisture Optimal)'}
              </span>
            </div>
          </div>

          {/* Card 2: Temperature (DHT22 Sensor) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Temperature (DHT22)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {sensors.temperature} °C
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, (sensors.temperature / 50) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                sensors.temperature > 32 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}>
                {sensors.temperature > 32 ? 'Heat Warning (>32°C)' : 'Normal Thermal Range'}
              </span>
            </div>
          </div>

          {/* Card 3: Air Humidity (DHT22 Sensor) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Air Humidity (DHT22)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {sensors.humidity}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, sensors.humidity))}%` }}
                />
              </div>
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                {sensors.humidity < 40 ? 'Dry Air (<40%)' : sensors.humidity > 75 ? 'Humid (>75%)' : 'Optimal Humidity'}
              </span>
            </div>
          </div>

          {/* Card 4: Controller & Pump Battery (MAX17048 Fuel Gauge) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-fresh-400 flex items-center justify-center">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Battery (MAX17048)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isHardwareMode && !esp32.connected ? 'Offline' : `${sensors.controllerBatteryPercent}%`}
                </span>
                {(!isHardwareMode || esp32.connected) && (
                  <span className="text-xs font-bold text-slate-400">
                    ({sensors.controllerBatteryVoltage}V)
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-forest-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, sensors.controllerBatteryPercent))}%` }}
                />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate">
                ⚡ Pump: Separate DC Battery
              </span>
            </div>
          </div>

          {/* Card 5: Irrigation Pump Relay Unit */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                sensors.pumpStatus 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 animate-pulse ring-2 ring-emerald-500/30' 
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Power className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Pump (5V Relay)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block">
                  {sensors.pumpStatus ? 'ON (Flowing)' : 'OFF (Idle)'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Mode: {irrigationMode === 'auto' ? 'Automatic' : 'Manual'}
                </span>
              </div>
              <button
                onClick={() => togglePump()}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  sensors.pumpStatus ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle Pump ON/OFF"
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  sensors.pumpStatus ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => togglePump(true)}
                disabled={sensors.pumpStatus}
                className="flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700 transition"
              >
                ON
              </button>
              <button
                onClick={() => togglePump(false)}
                disabled={!sensors.pumpStatus}
                className="flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-300 transition"
              >
                OFF
              </button>
              <button
                onClick={emergencyStopPump}
                className="py-1 px-1.5 rounded-lg text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white transition shadow-2xs"
                title="Immediate Emergency Shutoff"
              >
                EMERGENCY
              </button>
            </div>
          </div>

          {/* Card 6: ESP32 Wi-Fi Node Connection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                esp32.connected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' 
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
              }`}>
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                ESP32 Wi-Fi Node
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${esp32.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {esp32.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-1">
                {esp32Url.replace(/^https?:\/\//, '')}
              </p>
            </div>

            <div className="flex items-center justify-between gap-1">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-1 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
              >
                <RotateCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
                <span>{isConnecting ? 'Connecting...' : 'Test Wi-Fi Link'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Dedicated Pump Control & Safety Console */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest-900 text-white">
                <Sliders className="w-4 h-4 text-harvest-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Pump Control System & Safety Console &bull; ನೀರಾವರಿ ನಿಯಂತ್ರಣ
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dual-mode controller (Automatic & Manual) with hysteresis threshold safety logic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIrrigationMode('auto')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  irrigationMode === 'auto'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Automatic Mode</span>
              </button>

              <button
                onClick={() => setIrrigationMode('manual')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  irrigationMode === 'manual'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>Manual Mode</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Left: Quick Manual Actuation Buttons (5 Cols) */}
            <div className="md:col-span-5 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                onClick={() => togglePump(true)}
                disabled={sensors.pumpStatus}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs disabled:opacity-50 transition flex items-center justify-center gap-1.5"
              >
                <Power className="w-4 h-4" />
                <span>PUMP ON</span>
              </button>

              <button
                onClick={() => togglePump(false)}
                disabled={!sensors.pumpStatus}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs disabled:opacity-50 transition flex items-center justify-center gap-1.5"
              >
                <Power className="w-4 h-4" />
                <span>PUMP OFF</span>
              </button>

              <button
                onClick={emergencyStopPump}
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
                title="Immediate Safety Lockout"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>EMERGENCY STOP</span>
              </button>
            </div>

            {/* Right: Hysteresis Thresholds & Runaway Watchdog (7 Cols) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                  <span>Hysteresis Low Threshold:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">{moistureThresholdLow}%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  In Auto Mode, relay switches ON when soil moisture falls below {moistureThresholdLow}%.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                  <span>Hysteresis High Threshold:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{moistureThresholdHigh}%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Relay switches OFF when moisture reaches {moistureThresholdHigh}% (prevents relay chattering).
                </p>
              </div>
            </div>

          </div>

          {/* Safety & Standalone Edge Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>5V Optoisolated Relay:</strong> No direct motor current drawn through ESP32 GPIO.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/50 flex items-center gap-2 text-sky-900 dark:text-sky-200">
              <Zap className="w-4 h-4 text-sky-600 shrink-0" />
              <span><strong>Isolated Pump Battery:</strong> Dedicated DC battery prevents controller brownout resets.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-forest-50/80 dark:bg-forest-950/30 border border-forest-200/60 dark:border-forest-800/50 flex items-center gap-2 text-forest-900 dark:text-forest-200">
              <Cpu className="w-4 h-4 text-forest-700 dark:text-fresh-400 shrink-0" />
              <span><strong>Local Edge Autonomy:</strong> Auto watering executes locally on ESP32 if Wi-Fi disconnects.</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Middle Section: Farm Health Overview & Sensor Trends & ESP32 Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card A: Farm Health Overview (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Farm Health Overview
                </h3>
              </div>
              <Info className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-4 rounded-2xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 shadow-inner">
                <img 
                  src="https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=400&q=80" 
                  alt="Crop Health" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="col-span-8 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Crop Health
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ✔ Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span>🪴</span> Soil Condition
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Moderate ({sensors.soilMoisture}%) &bull; pH {sensors.soilPh}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-500" /> Irrigation
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                    Irrigation Recommended
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CloudSun className="w-3.5 h-3.5 text-yellow-500" /> Weather
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Partly Cloudy, 28.5 °C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestion Box */}
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <span className="text-amber-500 text-sm mt-0.5">💡</span>
            <div>
              <span className="font-bold">AI Suggestion: </span>
              <span>Start irrigation for 10–15 minutes. Soil moisture is low (32%). pH is suitable at 6.5.</span>
            </div>
          </div>
        </div>

        {/* Card B: Sensor Trends (Last 24 Hours) (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Sensor Trends (Last 24 Hours)
              </h3>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Soil Moisture
              </span>
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Humidity
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Temperature (°C)
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="humidityArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '11px' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#0284c7" 
                  strokeWidth={2} 
                  fill="url(#humidityArea)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="soilMoisture" 
                  stroke="#16a34a" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#16a34a' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ea580c" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#ea580c' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card C: "How App & Sensors Communicate?" (3 Cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              How App & Sensors Communicate?
            </h3>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-center">
            
            {/* Top 3 Component Badges */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex flex-col items-center">
                <span className="text-emerald-600 text-xs mb-0.5">🌱</span>
                <span className="leading-tight">Sensors</span>
                <span className="text-[8px] text-slate-400 font-normal">(DHT22 + Soil)</span>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex flex-col items-center">
                <span className="text-forest-600 text-xs mb-0.5">🔋</span>
                <span className="leading-tight">MAX17048</span>
                <span className="text-[8px] text-slate-400 font-normal">(18650 Fuel Gauge)</span>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex flex-col items-center">
                <span className="text-sky-500 text-xs mb-0.5">💧</span>
                <span className="leading-tight">5V Relay</span>
                <span className="text-[8px] text-slate-400 font-normal">(Pump DC Battery)</span>
              </div>
            </div>

            <div className="flex justify-around text-emerald-500 -my-1">
              <ArrowDown className="w-3.5 h-3.5" />
              <ArrowDown className="w-3.5 h-3.5" />
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-mono font-bold leading-tight text-emerald-300">
                  ESP32-WROOM-32
                </p>
                <p className="text-[8px] text-slate-400 font-sans">
                  (Edge Autonomous Controller)
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 -my-0.5">
              <Wifi className="w-4 h-4 animate-pulse" />
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Mobile Hotspot Wi-Fi (REST / WebSocket)
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600">
                <Laptop className="w-3.5 h-3.5" />
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                Raitha Vikas AI App
              </span>
            </div>
          </div>

          <button
            onClick={() => setExhibitionModalOpen(true)}
            className="w-full text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline pt-1"
          >
            Science Model Rig Matrix &rarr;
          </button>
        </div>

      </div>

      {/* 5. Rain Warning & Postpone Irrigation Advisory Card */}
      {weather.farmingAdvisory.postponeIrrigationReason && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start justify-between gap-3 text-xs text-sky-900 dark:text-sky-200">
          <div className="flex items-start gap-2.5">
            <CloudRain className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-sm block">
                Rain Forecast Warning & Irrigation Postponement Advisory
              </span>
              <p className="mt-0.5 text-sky-800 dark:text-sky-300 leading-relaxed">
                {weather.farmingAdvisory.postponeIrrigationReason}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('weather')}
            className="text-xs font-bold text-sky-700 dark:text-sky-300 underline shrink-0"
          >
            Check 5-Day Outlook
          </button>
        </div>
      )}

      {/* 6. Bottom Row: 4 Feature Navigation Cards matching reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Crop Disease AI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Crop Disease AI
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload leaf photo and detect possible disease with AI
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=150&q=80" 
                alt="Leaf scan" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setActiveTab('disease')}
              className="px-3.5 py-2 rounded-xl bg-[#0B4D26] hover:bg-[#083A1C] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
            >
              <span>Analyze Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Irrigation Control */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Irrigation Control
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Control your farm pump manually or automatically based on soil moisture.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=150&q=80" 
                alt="Irrigation" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setActiveTab('irrigation')}
              className="px-3.5 py-2 rounded-xl bg-[#0B4D26] hover:bg-[#083A1C] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
            >
              <span>Manage Pump</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Mandi Market Prices (NEW FEATURE) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Mandi Market Rates
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check daily APMC modal prices for Mandya, Kolar, and Bengaluru.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold">PADDY (MANDYA)</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                ₹{mandiPrices[0].modalPrice} <span className="text-[10px] text-emerald-600 font-bold">+2.8%</span>
              </span>
            </div>
            <button
              onClick={() => setActiveTab('market')}
              className="px-3 py-2 rounded-xl bg-[#92400E] hover:bg-[#78350F] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
            >
              <span>View Mandi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Voice Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Voice Announcements
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multilingual alerts in Kannada, Hindi, & English through AI voice.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0 border border-purple-200 dark:border-purple-800">
              <Mic2 className="w-6 h-6 animate-pulse" />
            </div>
            <button
              onClick={handleTestVoice}
              className="px-3.5 py-2 rounded-xl bg-[#581C87] hover:bg-[#4A1570] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
            >
              <span>Test Voice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

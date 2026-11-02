import React from 'react';
import { useFarmStore } from '../../store/useFarmStore';
import { 
  Menu, 
  Wifi, 
  WifiOff,
  Bell, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon,
  Globe,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { AppLanguage } from '../../types';

export const Header: React.FC = () => {
  const { 
    farmProfile, 
    activeField,
    switchField,
    isVoiceMuted, 
    toggleVoiceMute, 
    darkMode, 
    toggleDarkMode,
    notificationsOpen,
    setNotificationsOpen,
    setActiveTab,
    isSpeaking,
    language,
    setLanguage,
    isOfflineMode,
    toggleOfflineMode,
    setExhibitionModalOpen
  } = useFarmStore();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* Offline Mode Alert Ribbon if active */}
      {isOfflineMode && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Dashboard Active — Displaying latest cached sensor telemetry from local storage. Sensor stream paused until internet reconnects.</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger & Brand Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-skyAzure-50 dark:from-slate-900 dark:to-forest-950 p-1 flex items-center justify-center shrink-0 border border-forest-300/80 dark:border-forest-700 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Raitha Vikas AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-aiBlue-900 dark:text-white leading-tight">
                    Raitha Vikas
                  </h1>
                  <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-aiBlue-600 to-aiBlue-700 text-white font-black text-[11px] shadow-xs tracking-wider flex items-center gap-0.5">
                    <span>AI</span>
                    <span className="text-harvest-300 text-[10px]">✨</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-forest-700 dark:text-forest-300 -mt-0.5">
                  {language === 'kn' ? 'ರೈತ ವಿಕಾಸ್ • ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ' : language === 'hi' ? 'रैत विकास • स्मार्ट कृषि सहायक' : 'Smart Farming for a Better Tomorrow'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Language, Offline Toggle, Exhibition Guide, Device Status, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
              {(['en', 'kn', 'hi'] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg transition uppercase text-[10px] font-black ${
                    language === lang
                      ? 'bg-forest-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* Offline Mode Toggle Button */}
            <button
              onClick={toggleOfflineMode}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                isOfflineMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="Test offline behavior"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{isOfflineMode ? 'Offline Mode' : 'Online'}</span>
            </button>

            {/* Science Fair Matrix Modal Button */}
            <button
              onClick={() => setExhibitionModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50 dark:bg-forest-950/40 border border-forest-300 dark:border-forest-700 text-xs font-bold text-forest-900 dark:text-forest-200 hover:bg-forest-100 transition"
              title="Science Fair Model Matrix"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700 dark:text-fresh-400" />
              <span>Model Rig</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                3
              </span>
            </button>

            {/* Voice Audio Toggle */}
            <button
              onClick={toggleVoiceMute}
              className={`p-2 rounded-xl border transition ${
                isVoiceMuted 
                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900' 
                  : isSpeaking
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title={isVoiceMuted ? 'Voice Muted' : 'Voice Active'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Field Selector Dropdown Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-inner overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80" 
                  alt="Farm Manager"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="hidden xl:block text-left">
                <select
                  value={activeField.id}
                  onChange={(e) => switchField(e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {farmProfile.fields.map((f) => (
                    <option key={f.id} value={f.id} className="dark:bg-slate-800">
                      {f.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {farmProfile.farmerName} (Lead)
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

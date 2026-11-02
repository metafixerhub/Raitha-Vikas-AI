import React from 'react';
import { useFarmStore } from '../../store/useFarmStore';
import { NavigationTab } from '../../types';
import { 
  Home, 
  Bot,
  Sprout, 
  Droplet, 
  LineChart, 
  Calendar,
  Store,
  CloudSun, 
  Volume2, 
  Settings, 
  Wifi, 
  CheckCircle2,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  regionalLabel: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    sensors,
    language,
    setExhibitionModalOpen
  } = useFarmStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', regionalLabel: 'ಮುಖಪುಟ', icon: Home },
    { id: 'assistant', label: 'AI Farm Advisor', regionalLabel: 'ಕೃಷಿ AI ಸಲಹೆಗಾರ', icon: Bot, badge: 'Gemini' },
    { id: 'disease', label: 'Crop Disease AI', regionalLabel: 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ', icon: Sprout, badge: 'AI' },
    { id: 'irrigation', label: 'Irrigation Control', regionalLabel: 'ನೀರಾವರಿ ನಿಯಂತ್ರಣ', icon: Droplet, badge: sensors.pumpStatus ? 'ON' : undefined },
    { id: 'sensors', label: 'Sensor Monitoring', regionalLabel: 'ಸಂವೇದಕಗಳು (pH+)', icon: LineChart },
    { id: 'calendar', label: 'Crop Calendar', regionalLabel: 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್', icon: Calendar, badge: 'Tasks' },
    { id: 'market', label: 'Mandi Market Prices', regionalLabel: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', icon: Store, badge: 'Live' },
    { id: 'weather', label: 'Weather & Advisory', regionalLabel: 'ಹವಾಮಾನ', icon: CloudSun },
    { id: 'voice', label: 'Voice Announcements', regionalLabel: 'ಧ್ವನಿ ಪ್ರಕಟಣೆ', icon: Volume2 },
    { id: 'settings', label: 'Settings', regionalLabel: 'ಸಂಯೋಜನೆಗಳು', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#082615] dark:bg-[#051a0e] text-white shrink-0 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors select-none border-r border-forest-900/60">
      
      {/* Top Branding & Navigation */}
      <div className="space-y-4">
        
        {/* Logo and Tagline */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1.5 rounded-2xl bg-forest-950/40 border border-forest-800/40 hover:border-forest-700/60 cursor-pointer group transition"
        >
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Raitha Vikas AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Raitha Vikas
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-aiBlue-500 to-aiBlue-600 text-white font-black text-[10px] shadow-xs tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-forest-300 font-semibold leading-tight mt-0.5">
              {language === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ' : language === 'hi' ? 'स्मार्ट कृषि सहायक' : 'Smart Farming for Tomorrow'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-700 to-forest-600 text-white shadow-lg shadow-forest-950/50 border border-forest-500/50'
                    : 'text-forest-100/75 hover:bg-forest-900/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-harvest-400' : 'text-forest-300/80'}`} />
                  <div>
                    <span className="tracking-tight block leading-tight">{item.label}</span>
                    <span className={`text-[10px] block font-normal ${isActive ? 'text-forest-100' : 'text-forest-400/60'}`}>
                      {item.regionalLabel}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-harvest-400 text-slate-950 shadow-xs' 
                      : item.badge === 'ON' 
                      ? 'bg-fresh-400 text-slate-950 animate-pulse' 
                      : 'bg-forest-900 text-harvest-300 border border-harvest-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Device Status Card & Exhibition Matrix Trigger */}
      <div className="space-y-2 pt-2">
        <div className="p-3.5 rounded-2xl bg-[#061e11] border border-forest-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-fresh-400" />
              <span className="text-xs font-bold text-white tracking-wide">Farm Node Status</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fresh-500/20 text-fresh-300 border border-fresh-500/40">
              Online
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-forest-200/90 pl-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-fresh-400 animate-pulse" />
              <span>ESP32 Node (Field A)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-harvest-400" />
              <span>Soil pH & Moisture Calibrated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-aiBlue-400" />
              <span>Gemini AI Agronomy Live</span>
            </div>
          </div>
        </div>

        {/* Science Fair Matrix Trigger Button */}
        <button
          onClick={() => setExhibitionModalOpen(true)}
          className="w-full p-2.5 rounded-xl bg-forest-900/60 hover:bg-forest-900 border border-forest-700/50 text-forest-100 hover:text-white font-bold text-[11px] flex items-center justify-center gap-2 transition shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-harvest-400" />
          <span>Exhibition Hardware Matrix</span>
        </button>
      </div>

    </aside>
  );
};

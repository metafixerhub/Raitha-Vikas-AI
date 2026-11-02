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
  Volume2
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, sensors } = useFarmStore();

  const mobileTabs = [
    { id: 'dashboard' as NavigationTab, label: 'Home', icon: Home },
    { id: 'assistant' as NavigationTab, label: 'Ask AI', icon: Bot },
    { id: 'disease' as NavigationTab, label: 'Crop AI', icon: Sprout },
    { 
      id: 'irrigation' as NavigationTab, 
      label: 'Pump', 
      icon: Droplet,
      indicator: sensors.pumpStatus 
    },
    { id: 'sensors' as NavigationTab, label: 'Sensors', icon: LineChart },
    { id: 'market' as NavigationTab, label: 'Mandi', icon: Store },
    { id: 'voice' as NavigationTab, label: 'Voice', icon: Volume2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-7 h-16 items-center px-1">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 relative transition-colors ${
                isActive 
                  ? 'text-forest-800 dark:text-forest-400 font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-115 stroke-[2.5] text-forest-700 dark:text-forest-400' : ''}`} />
                {tab.indicator && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fresh-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fresh-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-1 tracking-tight truncate w-full text-center ${
                isActive ? 'font-black' : 'font-medium'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-forest-700 dark:bg-harvest-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

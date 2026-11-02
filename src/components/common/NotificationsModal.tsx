import React from 'react';
import { useFarmStore } from '../../store/useFarmStore';
import { 
  X, 
  Bell, 
  Volume2, 
  Droplets, 
  AlertTriangle, 
  CloudSun, 
  Cpu, 
  Clock,
  CheckCircle2
} from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const { 
    notificationsOpen, 
    setNotificationsOpen, 
    announcements, 
    triggerVoiceAnnouncement 
  } = useFarmStore();

  if (!notificationsOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'crop':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'weather':
        return <CloudSun className="w-4 h-4 text-yellow-500" />;
      default:
        return <Cpu className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Farm Alerts & Announcements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time automated farm event log
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new alerts. Your farm is running smoothly.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm shrink-0 mt-0.5">
                    {getCategoryIcon(announcement.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {announcement.category}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {announcement.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {announcement.text}
                    </p>
                  </div>
                </div>

                {/* Speak button */}
                <button
                  onClick={() => triggerVoiceAnnouncement(announcement.text, announcement.category, announcement.severity)}
                  className="p-2 rounded-xl text-forest-700 dark:text-fresh-400 hover:bg-forest-100 dark:hover:bg-emerald-950 transition shrink-0 opacity-80 hover:opacity-100"
                  title="Play announcement via speech synthesizer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Voice synthesis powered by Web Speech API &middot; Ready for ESP32 I2S DAC
          </p>
        </div>
      </div>
    </div>
  );
};

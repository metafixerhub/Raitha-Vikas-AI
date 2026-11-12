import React, { useEffect, useState } from 'react';
import { useFarmStore } from '../../store/useFarmStore';
import { Sparkles, Sprout, Wifi } from 'lucide-react';

interface LoadingScreenProps {
  onFinished?: () => void;
  minDurationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onFinished, 
  minDurationMs = 2600 
}) => {
  const { isAppLoading, setIsAppLoading, language } = useFarmStore();
  const [progress, setProgress] = useState(12);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const statuses = [
    {
      en: 'Initializing Raitha Vikas AI Core...',
      kn: 'ರೈತ ವಿಕಾಸ್ AI ವ್ಯವಸ್ಥೆಯನ್ನು ಆರಂಭಿಸಲಾಗುತ್ತಿದೆ...',
      hi: 'रैत विकास AI सिस्टम प्रारंभ हो रहा है...'
    },
    {
      en: 'Connecting to ESP32 Farm Sensors (Moisture, pH, Temp)...',
      kn: 'ESP32 ಸಂವೇದಕಗಳ ಸಂಪರ್ಕ ಸಾಧಿಸಲಾಗುತ್ತಿದೆ (ತೇವಾಂಶ, pH)...',
      hi: 'ESP32 खेत सेंसर से कनेक्ट हो रहा है (नमी, pH)...'
    },
    {
      en: 'Fetching live Mandi market commodity prices...',
      kn: 'ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಎಪಿಎಂಸಿ ದರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      hi: 'लाइव मंडी भाव प्राप्त किए जा रहे हैं...'
    },
    {
      en: 'Calibrating Raitha Vikas Agronomy Intelligence...',
      kn: 'ರೈತ ವಿಕಾಸ ಕೃಷಿ AI ಸಹಾಯಕ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...',
      hi: 'रैत विकास कृषि AI सहायक तैयार हो रहा है...'
    },
    {
      en: 'Farm Dashboard Ready!',
      kn: 'ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ!',
      hi: 'कृषि डैशबोर्ड तैयार है!'
    }
  ];

  useEffect(() => {
    if (!isAppLoading) return;

    // Progress bar ticker
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 14) + 8;
        return Math.min(prev + step, 98);
      });
    }, 280);

    // Status message ticker
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 550);

    // Fade-out timer
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);
      const dismissTimer = setTimeout(() => {
        setIsAppLoading(false);
        onFinished?.();
      }, 650);
      return () => clearTimeout(dismissTimer);
    }, minDurationMs);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(completeTimer);
    };
  }, [isAppLoading, minDurationMs, onFinished, setIsAppLoading]);

  if (!isAppLoading) return null;

  const currentStatus = statuses[statusIndex] || statuses[0];
  const statusText = 
    language === 'kn' ? currentStatus.kn : language === 'hi' ? currentStatus.hi : currentStatus.en;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a100c] text-white select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading application"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(13,110,38,0.28)_0%,_rgba(11,21,15,0.85)_50%,_#070d09_100%)] pointer-events-none" />

      {/* Center Card with Logo Animation */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        
        {/* Animated Reveal GIF Container */}
        <div className="relative w-72 sm:w-84 md:w-96 aspect-video rounded-3xl overflow-hidden bg-black/60 shadow-[0_0_50px_rgba(22,163,74,0.35)] border border-forest-500/30 flex items-center justify-center mb-6">
          <img 
            src="/loading.gif" 
            alt="Raitha Vikas AI Loading..." 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
        </div>

        {/* Brand Title */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Raitha Vikas
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-aiBlue-600 to-aiBlue-700 text-white font-extrabold text-xs shadow-md tracking-wider flex items-center gap-1">
              <span>AI</span>
              <Sparkles className="w-3 h-3 text-harvest-300" />
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-forest-300/90 tracking-wide">
            {language === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ' : language === 'hi' ? 'स्मार्ट कृषि सहायक' : 'Smart Farming for a Better Tomorrow'}
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-3">
          <div className="w-full bg-forest-950/80 rounded-full h-2.5 overflow-hidden border border-forest-800/60 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-forest-500 via-fresh-400 to-harvest-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,197,94,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-forest-200/80 px-1">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-fresh-400 animate-ping" />
              <span className="truncate">{statusText}</span>
            </span>
            <span className="font-mono text-harvest-300 font-bold ml-2">
              {progress}%
            </span>
          </div>
        </div>

        {/* Subtle hardware badge */}
        <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-950/60 border border-forest-800/40 text-[10px] text-forest-300/70">
          <Wifi className="w-3 h-3 text-fresh-400" />
          <span>ESP32 Agri-Telemetry &bull; Precision Agronomy Model</span>
        </div>

      </div>
    </div>
  );
};

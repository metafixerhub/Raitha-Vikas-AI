import React, { useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { speechService } from '../services/speechService';
import { 
  Mic2, 
  Volume2, 
  VolumeX, 
  Play, 
  Sparkles, 
  History, 
  Settings2, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Sun, 
  Thermometer,
  Info,
  Globe,
  Beaker,
  CloudRain
} from 'lucide-react';
import { AppLanguage } from '../types';

export const VoiceAssistant: React.FC = () => {
  const { 
    announcements, 
    isVoiceMuted, 
    toggleVoiceMute, 
    triggerVoiceAnnouncement, 
    isSpeaking,
    sensors,
    farmProfile,
    language,
    setLanguage
  } = useFarmStore();

  const [customText, setCustomText] = useState('');
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(0.95);

  const presetAnnouncements = [
    {
      title: 'Low Soil Moisture & Irrigation Trigger',
      text: 'Attention! Soil moisture is low at 32 percent. Irrigation is starting.',
      kannadaText: 'ಗಮನಿಸಿ! ಮಣ್ಣಿನ ತೇವಾಂಶ ೩೨% ಕ್ಕೆ ಇಳಿದಿದೆ. ನೀರಾವರಿ ಪಂಪ್ ಆರಂಭವಾಗುತ್ತಿದೆ.',
      hindiText: 'ध्यान दें! मिट्टी की नमी 32% पर आ गई है। सिंचाई पंप शुरू हो रहा है।',
      icon: Droplets,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60',
      category: 'irrigation' as const,
      severity: 'warning' as const
    },
    {
      title: 'Irrigation Cutoff Reached',
      text: 'Your soil moisture is now normal. Irrigation pump has stopped.',
      kannadaText: 'ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಾಮಾನ್ಯ ಮಟ್ಟ ತಲುಪಿದೆ. ನೀರಾವರಿ ಪಂಪ್ ಸ್ಥಗಿತಗೊಂಡಿದೆ.',
      hindiText: 'आपकी मिट्टी की नमी अब सामान्य हो गई है। सिंचाई पंप बंद कर दिया गया है।',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
      category: 'irrigation' as const,
      severity: 'info' as const
    },
    {
      title: 'Soil pH Telemetry Assessment',
      text: `Soil pH is measured at ${sensors.soilPh}, slightly acidic. Well suited for paddy and tomato stands.`,
      kannadaText: `ಮಣ್ಣಿನ ಪಿಎಚ್ ${sensors.soilPh} ರಷ್ಟಿದೆ, ಸ್ವಲ್ಪ ಆಮ್ಲೀಯ. ಭತ್ತ ಮತ್ತು ತರಕಾರಿ ಬೆಳೆಗೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.`,
      hindiText: `मिट्टी का पीएच ${sensors.soilPh} मापा गया है। धान और टमाटर की फसल के लिए यह बहुत अच्छा है।`,
      icon: Beaker,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60',
      category: 'system' as const,
      severity: 'info' as const
    },
    {
      title: 'Rain Warning & Postpone Irrigation',
      text: 'Weather Alert: Heavy rain forecast for Tuesday. Postpone excessive irrigation to avoid waterlogging.',
      kannadaText: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಮಂಗಳವಾರ ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಹೆಚ್ಚಿನ ನೀರಾವರಿ ಮುಂದೂಡಿ.',
      hindiText: 'मौसम चेतावनी: मंगलवार को भारी बारिश की संभावना है। अधिक सिंचाई स्थगित करें।',
      icon: CloudRain,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
      category: 'weather' as const,
      severity: 'warning' as const
    },
    {
      title: 'APMC Mandi Price Surge',
      text: 'Mandi report: Tomato modal price jumped 8 percent in Kolar APMC today to 1850 rupees per quintal.',
      kannadaText: 'ಮಾರುಕಟ್ಟೆ ವರದಿ: ಕೋಲಾರ ಎಪಿಎಂಸಿಯಲ್ಲಿ ಇಂದು ಟೊಮೆಟೊ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ೧,೮೫೦ ರೂ ಗೆ ತಲುಪಿದೆ.',
      hindiText: 'मंडी भाव: आज कोलार मंडी में टमाटर का भाव 8% बढ़कर 1850 रुपये प्रति क्विंटल हो गया है।',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60',
      category: 'market' as const,
      severity: 'info' as const
    }
  ];

  const handleSpeakPreset = (preset: typeof presetAnnouncements[0]) => {
    triggerVoiceAnnouncement(
      preset.text, 
      preset.category, 
      preset.severity, 
      preset.kannadaText, 
      preset.hindiText
    );
  };

  const handleCustomSpeak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    triggerVoiceAnnouncement(customText, 'alert', 'info');
    setCustomText('');
  };

  const handlePitchRateChange = (newPitch: number, newRate: number) => {
    setPitch(newPitch);
    setRate(newRate);
    speechService.setPitchRate(newPitch, newRate);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Multilingual Local Speech Engine (Kannada, Hindi, English): </span>
            Voice alerts synthesize through HTML5 SpeechSynthesis. For physical exhibition booths, announcements connect to the <strong>ESP32 I2S MAX98357A 3W horn speaker</strong>.
          </div>
        </div>
        
        {/* Language selector in voice page */}
        <div className="flex items-center gap-1 bg-amber-200/50 dark:bg-amber-900/40 p-1 rounded-xl text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 mx-1" />
          {(['en', 'kn', 'hi'] as AppLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-black transition ${
                language === lang
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-amber-900 dark:text-amber-200'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Console & Presets (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visualizer Card */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-fresh-400 flex items-center gap-1.5">
                  <Mic2 className="w-3.5 h-3.5" />
                  Local Language Voice Assistant ({language === 'kn' ? 'ಕನ್ನಡ' : language === 'hi' ? 'हिंदी' : 'English'})
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Automated Farm Audio Broadcaster
                </h3>
              </div>

              <button
                onClick={toggleVoiceMute}
                className={`p-3 rounded-2xl border transition-all ${
                  isVoiceMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title={isVoiceMuted ? 'Unmute Voice Assistant' : 'Mute Voice Assistant'}
              >
                {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-fresh-400" />}
              </button>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="h-24 rounded-2xl bg-forest-950/80 border border-white/10 flex items-center justify-center gap-1.5 px-6 relative z-10">
              {[40, 65, 80, 45, 90, 70, 30, 85, 95, 60, 40, 75, 90, 50, 70, 30, 60, 80, 50, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isSpeaking ? 'bg-fresh-400 animate-pulse' : 'bg-white/20'
                  }`}
                  style={{
                    height: isSpeaking ? `${Math.max(15, Math.round(h * Math.random()))}%` : '15%',
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-200 relative z-10">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-fresh-400 animate-ping' : 'bg-slate-400'}`} />
                {isVoiceMuted 
                  ? 'Voice Engine Muted' 
                  : isSpeaking 
                  ? 'Speaking Announcement...' 
                  : `Voice Standby (${language.toUpperCase()} Engine Ready)`}
              </span>

              <button
                onClick={() => handleSpeakPreset(presetAnnouncements[0])}
                className="px-3.5 py-1.5 rounded-xl bg-fresh-500 hover:bg-fresh-400 text-slate-950 font-bold transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Announcement</span>
              </button>
            </div>
          </div>

          {/* Quick Multilingual Announcement Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
                Demonstration Announcements ({language === 'kn' ? 'ಕನ್ನಡ ಧ್ವನಿ' : language === 'hi' ? 'हिंदी वाणी' : 'English Voice'})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any prompt to broadcast the real-time audio announcement
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {presetAnnouncements.map((preset, index) => {
                const Icon = preset.icon;
                const displayText = language === 'kn' && preset.kannadaText 
                  ? preset.kannadaText 
                  : language === 'hi' && preset.hindiText 
                  ? preset.hindiText 
                  : preset.text;

                return (
                  <button
                    key={index}
                    onClick={() => handleSpeakPreset(preset)}
                    className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${preset.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-700 dark:group-hover:text-fresh-400 transition-colors">
                          {preset.title}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          "{displayText}"
                        </p>
                      </div>
                    </div>

                    <span className="p-2 rounded-xl text-emerald-700 dark:text-fresh-400 group-hover:bg-emerald-100 dark:group-hover:bg-slate-700 transition shrink-0">
                      <Play className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Announcement Broadcaster */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
              Custom Text-to-Speech Broadcaster
            </h3>
            
            <form onSubmit={handleCustomSpeak} className="space-y-3">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type any advisory in English, ಕನ್ನಡ, or हिंदी to broadcast aloud..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Transmitted instantly to browser SpeechSynthesis voice engine
                </span>

                <button
                  type="submit"
                  disabled={!customText.trim() || isSpeaking}
                  className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Audio Tuning & Announcement History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Voice Tuning */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
              Voice Synthesizer Tuning
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Voice Pitch</span>
                <span>{pitch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.1"
                value={pitch}
                onChange={(e) => handlePitchRateChange(Number(e.target.value), rate)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Speech Speed</span>
                <span>{rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={rate}
                onChange={(e) => handlePitchRateChange(pitch, Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-100 dark:border-slate-800">
              <p>&bull; Active Language: {language.toUpperCase()} (Kannada, Hindi, English)</p>
              <p>&bull; Target Audio Module: ESP32 I2S MAX98357A (Mono 3W Speaker)</p>
            </div>
          </div>

          {/* Announcement Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
                Broadcast Audit History
              </h3>
              <span className="text-xs text-slate-400">
                {announcements.length} Logs
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {ann.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {ann.text}
                    </p>
                  </div>

                  <button
                    onClick={() => triggerVoiceAnnouncement(ann.text, ann.category, ann.severity, ann.kannadaText, ann.hindiText)}
                    className="p-1.5 rounded-lg text-emerald-700 dark:text-fresh-400 hover:bg-emerald-50 dark:hover:bg-slate-800 shrink-0"
                    title="Replay"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

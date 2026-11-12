import React from 'react';
import { useFarmStore } from '../../store/useFarmStore';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Droplets, 
  Sun, 
  Volume2, 
  ScanLine, 
  Store, 
  CloudSun,
  Zap 
} from 'lucide-react';

export const ExhibitionGuideModal: React.FC = () => {
  const { exhibitionModalOpen, setExhibitionModalOpen } = useFarmStore();

  if (!exhibitionModalOpen) return null;

  const hardwareFeatures = [
    { name: 'Capacitive Soil Moisture Sensor', status: 'Real Corrosion-Resistant Probe (ADC1 GPIO 34)', icon: Droplets, color: 'text-blue-500' },
    { name: 'DHT22 Temp & Humidity Sensor', status: 'Real Digital Environmental Sensor (GPIO 4)', icon: Activity, color: 'text-amber-500' },
    { name: 'Optoisolated Relay Module', status: 'Real Mini DC Pump Actuation (GPIO 5 / D5)', icon: ShieldCheck, color: 'text-emerald-500' },
    { name: 'Autonomous Irrigation Engine', status: 'On-Chip Hysteresis Closed-Loop & Safety Watchdog', icon: Zap, color: 'text-yellow-500' },
    { name: 'Dedicated DC Pump Supply', status: 'Independent Battery for Motor to Prevent Controller Brownouts', icon: Sparkles, color: 'text-sky-500' },
    { name: '18650 Li-ion Pack + JX-887Y', status: '3.7V BMS Protected Cell + 5V 2A Boost Power Rail', icon: Layers, color: 'text-teal-500' },
  ];

  const softwareFeatures = [
    { name: 'AI Crop Disease Detection', status: 'Demonstration Computer Vision Inference (ResNet-50)', icon: ScanLine, color: 'text-emerald-500' },
    { name: 'Weather Forecast & Rain Alerts', status: 'Modeled Agromet IMD Microclimate Telemetry', icon: CloudSun, color: 'text-sky-500' },
    { name: 'APMC Mandi Market Prices', status: 'Agmarknet Karnataka APMC Market Price Engine', icon: Store, color: 'text-amber-500' },
    { name: 'Crop Calendar & Growth Stages', status: 'Agronomic Lifecycle Schedule & Task Engine', icon: Layers, color: 'text-teal-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-forest-900 text-white">
              <ShieldCheck className="w-5 h-5 text-fresh-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Science Exhibition Transparency Matrix
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Honest breakdown for judges: Physical Hardware vs. Software Simulations
              </p>
            </div>
          </div>
          <button
            onClick={() => setExhibitionModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Section 1: Real Physical Hardware in Booth */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Physical Hardware Components (Tested & Active in Booth)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                Active Physical Rig
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {hardwareFeatures.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 ${h.color} shrink-0 mt-0.5`} />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        {h.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {h.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Software Demonstration & Future Integrations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Software Inference & Advisory Modules (Demonstration Ready)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-[10px]">
                AI & Cloud Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {softwareFeatures.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 ${s.color} shrink-0 mt-0.5`} />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scientific Disclaimer Card */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5 text-amber-900 dark:text-amber-200">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-amber-600" />
              Agronomic Integrity Note for Judges
            </span>
            <p className="text-[11px] leading-relaxed">
              We explicitly separate measured telemetry from AI estimates. pH readings demonstrate soil acidity (6.5), but fertilizer requirements always require NPK nutrient profiling. AI leaf diagnosis outputs "Possible Disease Assessments" for farmer guidance rather than clinical agricultural guarantees.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={() => setExhibitionModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-sm transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

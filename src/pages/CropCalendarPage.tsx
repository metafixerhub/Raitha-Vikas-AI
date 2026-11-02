import React, { useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Sprout, 
  Droplets, 
  Sparkles, 
  Bug, 
  Scissors, 
  AlertCircle,
  ChevronRight,
  Layers
} from 'lucide-react';

export const CropCalendarPage: React.FC = () => {
  const { 
    cropTasks, 
    toggleCropTask, 
    activeField, 
    switchField, 
    farmProfile 
  } = useFarmStore();

  const [activeCategory, setActiveCategory] = useState<'all' | 'watering' | 'fertilizing' | 'pest_control' | 'harvesting'>('all');

  const filteredTasks = activeCategory === 'all' 
    ? cropTasks 
    : cropTasks.filter(t => t.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'watering':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'fertilizing':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'pest_control':
        return <Bug className="w-4 h-4 text-rose-500" />;
      case 'harvesting':
        return <Scissors className="w-4 h-4 text-amber-500" />;
      default:
        return <Sprout className="w-4 h-4 text-emerald-500" />;
    }
  };

  const progressPercent = Math.min(100, Math.round((activeField.daysSincePlanting / activeField.totalCycleDays) * 100));

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Field Switcher Pill Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Crop Calendar & Agronomic Reminders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Field-by-field crop cycle schedule and upcoming farm tasks
          </p>
        </div>

        {/* Switch field pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto text-xs font-semibold">
          {farmProfile.fields.map((f) => (
            <button
              key={f.id}
              onClick={() => switchField(f.id)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                activeField.id === f.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.name.split(' ')[0]} ({f.cropType.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Active Crop Growth Progress Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-400" />
              Active Crop Stage &bull; {activeField.name}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              {activeField.cropType}
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Planting Date: {activeField.plantingDate} &middot; Soil Type: {activeField.soilType}
            </p>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">
              Current Stage
            </span>
            <span className="text-sm font-black text-white">
              {activeField.growthStage}
            </span>
          </div>
        </div>

        {/* Growth Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-emerald-200">
            <span>Day {activeField.daysSincePlanting} of {activeField.totalCycleDays} Days</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-emerald-950/80 rounded-full h-3 border border-emerald-700/60 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-fresh-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-emerald-300/70 font-medium pt-1">
            <span>Sowing / Nursery</span>
            <span>Tillering & Vegetative</span>
            <span>Flowering & Pod</span>
            <span>Maturity & Harvest</span>
          </div>
        </div>
      </div>

      {/* Task Filters & Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Upcoming Farm Tasks & Recommendations
          </h3>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
            {(['all', 'watering', 'fertilizing', 'pest_control', 'harvesting'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition capitalize ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Task cards */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleCropTask(task.id)}
              className={`group p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.status === 'completed'
                  ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                  : 'bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 border-slate-200/90 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`p-1.5 rounded-xl border mt-0.5 transition ${
                    task.status === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getCategoryIcon(task.category)}
                    </span>
                    <span className={`text-sm font-bold ${
                      task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {task.cropName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                    {task.instructions}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 pl-7 font-medium">
                    {task.regionalTitle}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 pl-7 sm:pl-0">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  {task.dueDate}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  {task.growthStage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

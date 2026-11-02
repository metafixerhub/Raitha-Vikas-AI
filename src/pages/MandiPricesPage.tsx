import React, { useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  MapPin, 
  Calendar, 
  Info, 
  Search, 
  Filter, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const MandiPricesPage: React.FC = () => {
  const { mandiPrices } = useFarmStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrices = mandiPrices.filter(p => 
    p.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.marketName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.regionalName.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200">
        <div className="flex items-start gap-2.5">
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Agmarknet Karnataka Mandi Telemetry: </span>
            Displaying live agricultural commodity prices from nearby regulated markets (APMCs). Demo data modeled on Karnataka State Agricultural Marketing Board bulletins.
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold shrink-0">
          Source: Agmarknet APMC
        </span>
      </div>

      {/* Header and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Karnataka APMC Mandi Market Prices (ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time daily modal price, min/max range, and day-on-day price momentum
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop or APMC market..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Mandi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrices.map((price) => (
          <div 
            key={price.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Market Badge & Date */}
              <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {price.marketName}
                </span>
                <span>{price.date}</span>
              </div>

              {/* Crop Name */}
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {price.cropName}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                {price.regionalName}
              </p>

              {/* Modal Price (Big) */}
              <div className="pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Modal Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      ₹{price.modalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {price.priceUnit.replace('₹ / ', '')}
                    </span>
                  </div>
                </div>

                {/* Day Change Pill */}
                <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                  price.changePercent >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {price.changePercent >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{price.changePercent >= 0 ? `+${price.changePercent}%` : `${price.changePercent}%`}</span>
                </span>
              </div>
            </div>

            {/* Min / Max Range */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">MIN PRICE</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">
                    ₹{price.minPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">MAX PRICE</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">
                    ₹{price.maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 truncate">
                Verified via {price.source}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
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
  Sparkles,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { MandiPrice } from '../types';

export const MandiPricesPage: React.FC = () => {
  const { mandiPrices, language } = useFarmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-desc' | 'price-asc' | 'change-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = [
    { id: 'All', label: 'All Crops', kn: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು' },
    { id: 'Grains & Cereals', label: 'Grains & Cereals', kn: 'ಧಾನ್ಯಗಳು & ಸಿರಿಧಾನ್ಯ' },
    { id: 'Vegetables', label: 'Vegetables', kn: 'ತರಕಾರಿಗಳು' },
    { id: 'Plantation & Cash Crops', label: 'Cash & Plantation', kn: 'ವಾಣಿಜ್ಯ & ತೋಟಗಾರಿಕೆ' },
    { id: 'Spices', label: 'Spices', kn: 'ಸಾಂಬಾರ ಪದಾರ್ಥಗಳು' },
    { id: 'Pulses & Oilseeds', label: 'Pulses & Oilseeds', kn: 'ಕಾಳುಗಳು & ಎಣ್ಣೆಕಾಳು' },
    { id: 'Fruits', label: 'Fruits', kn: 'ಹಣ್ಣುಗಳು' }
  ];

  const filteredPrices = useMemo(() => {
    return mandiPrices
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const s = searchTerm.toLowerCase().trim();
        if (!s) return matchesCategory;

        const matchesQuery = 
          p.cropName.toLowerCase().includes(s) ||
          p.regionalName.toLowerCase().includes(s) ||
          p.marketName.toLowerCase().includes(s) ||
          p.state.toLowerCase().includes(s) ||
          (p.category && p.category.toLowerCase().includes(s));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-desc') return b.modalPrice - a.modalPrice;
        if (sortBy === 'price-asc') return a.modalPrice - b.modalPrice;
        if (sortBy === 'change-desc') return b.changePercent - a.changePercent;
        return 0;
      });
  }, [mandiPrices, searchTerm, selectedCategory, sortBy]);

  // Statistics
  const totalCommodities = mandiPrices.length;
  const gainersCount = mandiPrices.filter(p => p.changePercent > 0).length;
  const losersCount = mandiPrices.filter(p => p.changePercent < 0).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Advisory Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-forest-50 via-skyAzure-50 to-harvest-50/60 dark:from-forest-950/40 dark:via-aiBlue-950/20 dark:to-forest-950/30 border border-forest-200/90 dark:border-forest-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-forest-950 dark:text-forest-200 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Store className="w-4 h-4 text-forest-700 dark:text-fresh-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-forest-900 dark:text-white">
              Agmarknet Karnataka Mandi APMC Price Library: 
            </span>{' '}
            Live modal rates, price ranges, and day-to-day momentum from major regulated market committees across Karnataka.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-harvest-100 text-harvest-900 dark:bg-harvest-950/80 dark:text-harvest-300 font-bold border border-harvest-200 dark:border-harvest-800">
            {totalCommodities} Active Commodities
          </span>
        </div>
      </div>

      {/* Main Header & Search Control Hub */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-forest-700 text-white">
                <Store className="w-5 h-5 text-harvest-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                APMC Mandi Price Library &bull; ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಗ್ರಂಥಾಲಯ
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search by crop name in English or Kannada (ಉದಾಹರಣೆಗೆ: Tomato, ಭತ್ತ, ಅಡಿಕೆ, Byadgi Chilli, ರಾಗಿ)
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === 'kn'
                    ? 'ಬೆಳೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ (ಉದಾ: ಭತ್ತ, ಅಡಿಕೆ, Tomato)...'
                    : 'Search crop or APMC (e.g. Tomato, ಭತ್ತ, Arecanut)...'
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-inner"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-forest-700 dark:text-fresh-400 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-slate-700 text-forest-700 dark:text-fresh-400 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table Spreadsheet View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Scrollable Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === cat.id
                    ? 'bg-forest-800 text-white border-forest-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{language === 'kn' ? cat.kn : cat.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="default">Default APMC Order</option>
              <option value="price-desc">Highest Modal Rate</option>
              <option value="price-asc">Lowest Modal Rate</option>
              <option value="change-desc">Top Gainers (+%)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-extrabold">{filteredPrices.length}</strong> commodities
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-fresh-400">
            <TrendingUp className="w-3.5 h-3.5" /> {gainersCount} Gainers
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <TrendingDown className="w-3.5 h-3.5" /> {losersCount} Declining
          </span>
        </div>
      </div>

      {/* Content View: Grid or Table */}
      {filteredPrices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No crops found matching "{searchTerm}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with common names such as "Tomato", "Paddy", "Arecanut", "ಭತ್ತ", or select "All Crops".
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="px-4 py-2 rounded-xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-600 transition"
          >
            Clear Filters & Reset
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPrices.map((price) => (
            <div 
              key={price.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-forest-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Market & Category */}
                <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 dark:text-fresh-400 shrink-0" />
                    <span className="truncate">{price.marketName}</span>
                  </span>
                  {price.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {price.category.split(' ')[0]}
                    </span>
                  )}
                </div>

                {/* Crop Name in English & Kannada */}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight group-hover:text-forest-700 dark:group-hover:text-fresh-400 transition-colors">
                  {price.cropName}
                </h3>
                <p className="text-xs text-forest-800 dark:text-forest-300 font-bold mt-0.5">
                  {price.regionalName}
                </p>

                {/* Modal Price */}
                <div className="pt-4 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800/80 mt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Modal Rate (ದರ)
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        ₹{price.modalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        / {price.priceUnit.replace('₹ / ', '')}
                      </span>
                    </div>
                  </div>

                  {/* Day Change Pill */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-2xs ${
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

              {/* Min & Max Range Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
                <span>Min: <strong>₹{price.minPrice.toLocaleString('en-IN')}</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Max: <strong>₹{price.maxPrice.toLocaleString('en-IN')}</strong></span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE SPREADSHEET VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Commodity / ಬೆಳೆ</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">APMC Market</th>
                  <th className="py-3 px-4 text-right">Min Rate</th>
                  <th className="py-3 px-4 text-right">Modal Rate</th>
                  <th className="py-3 px-4 text-right">Max Rate</th>
                  <th className="py-3 px-4 text-center">Day Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {price.cropName}
                      </div>
                      <div className="text-forest-700 dark:text-forest-300 font-bold text-[11px]">
                        {price.regionalName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {price.category || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-forest-700 dark:text-fresh-400" />
                        <span>{price.marketName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{price.state}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ₹{price.minPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      ₹{price.modalPrice.toLocaleString('en-IN')}
                      <span className="text-[10px] font-normal text-slate-400 block">
                        {price.priceUnit.replace('₹ / ', '')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ₹{price.maxPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                        price.changePercent >= 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {price.changePercent >= 0 ? '+' : ''}{price.changePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

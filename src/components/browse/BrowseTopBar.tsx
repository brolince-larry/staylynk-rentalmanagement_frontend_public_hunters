import { useRef } from 'react';
import { useStore, useFilters } from '../../stores/listingStore';
import { SlidersHorizontal, Search } from 'lucide-react';
import { PROPERTY_TYPE_OPTIONS } from '../../constants/propertyTypes';

const PRICE_STEPS = [5_000, 10_000, 15_000, 20_000, 30_000, 40_000, 50_000, 75_000, 100_000, 200_000];

export function BrowseTopBar() {
  const filters    = useFilters();
  const setFilters = useStore(s => s.setFilters);
  const searchRef  = useRef<HTMLInputElement>(null);

  const currentType = filters.house_type ?? filters.property_type ?? '';
  const currentMin  = filters.budget_min ?? filters.min_price ?? 5_000;
  const currentMax  = filters.budget_max ?? filters.max_price ?? 50_000;

  const applySearch = () => {
    const value = searchRef.current?.value.trim() ?? '';
    setFilters({ search: value || undefined, location: value || undefined });
  };

  const selectBase = 'h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-bold text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-white/[0.08] dark:bg-[#1a1a2c] dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20 select-caret';
  const labelBase  = 'px-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-white/40';

  return (
    <div className="sticky top-16 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/[0.07] dark:bg-[#0d0d14]/95">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-end gap-3 px-4 py-4 sm:px-6 lg:px-8">

        {/* Search */}
        <form
          className="flex h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 dark:border-white/[0.08] dark:bg-[#1a1a2c] dark:focus-within:border-violet-500 dark:focus-within:ring-violet-500/20"
          onSubmit={e => { e.preventDefault(); applySearch(); }}
        >
          <Search size={16} className="shrink-0 text-slate-400 dark:text-white/30" />
          <input
            key={`${filters.search ?? ''}-${filters.location ?? ''}`}
            ref={searchRef}
            type="search"
            placeholder="Location, area or property"
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/30"
            defaultValue={filters.search ?? filters.location ?? ''}
            onBlur={applySearch}
            aria-label="Search"
          />
        </form>

        {/* Property type */}
        <div className="flex min-w-40 flex-col gap-1">
          <label className={labelBase}>Property Type</label>
          <select
            className={selectBase}
            value={currentType}
            onChange={e => setFilters({ house_type: e.target.value || undefined, property_type: undefined })}
            aria-label="Property type"
          >
            {PROPERTY_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Min price */}
        <div className="flex min-w-36 flex-col gap-1">
          <label className={labelBase}>Min Price</label>
          <select
            className={selectBase}
            value={currentMin}
            onChange={e => setFilters({ budget_min: Number(e.target.value), min_price: Number(e.target.value) })}
            aria-label="Minimum price"
          >
            {PRICE_STEPS.map(p => <option key={p} value={p}>KSh {p.toLocaleString()}</option>)}
          </select>
        </div>

        {/* Max price */}
        <div className="flex min-w-36 flex-col gap-1">
          <label className={labelBase}>Max Price</label>
          <select
            className={selectBase}
            value={currentMax}
            onChange={e => setFilters({ budget_max: Number(e.target.value), max_price: Number(e.target.value) })}
            aria-label="Maximum price"
          >
            {PRICE_STEPS.map(p => <option key={p} value={p}>KSh {p >= 50_000 ? `${(p / 1_000).toFixed(0)}K+` : p.toLocaleString()}</option>)}
          </select>
        </div>

        {/* More filters */}
        <button
          className="flex h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-violet-500/40 dark:hover:text-violet-300"
          onClick={() => useStore.getState().toggleMobileFilters()}
        >
          More Filters
          <SlidersHorizontal size={15} />
        </button>

        {/* Save search */}
        <button className="flex h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-violet-600 px-5 text-sm font-black text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500">
          <Search size={15} />
          Save Search
        </button>
      </div>
    </div>
  );
}

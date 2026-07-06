import { useRef, type ReactNode } from 'react';
import { useStore, useFilters, useActiveFilterCount } from '../../stores/listingStore';
import { FilterCountSkeleton } from '../../components/shared/Skeletons';
import type { Facets, SearchFilters } from '../../types';
import { toArray } from '../../utils/collection';
import { PROPERTY_CATEGORY_OPTIONS } from '../../constants/propertyTypes';

const AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'Security', 'Water Available',
  'Furnished', 'Generator', 'CCTV', 'Gym', 'Swimming Pool',
];

export function BrowseFilters({
  facets,
  facetsLoading,
}: {
  facets?: Facets;
  facetsLoading?: boolean;
}) {
  const filters      = useFilters();
  const setFilters   = useStore(s => s.setFilters);
  const resetFilters = useStore(s => s.resetFilters);
  const activeCount  = useActiveFilterCount();
  const areaSearchRef = useRef<HTMLInputElement>(null);

  const set = (p: Partial<SearchFilters>) => setFilters(p);

  const budgetMax = Number(filters.budget_max ?? filters.max_price ?? facets?.price_ranges?.max ?? 50_000);
  const budgetMin = Number(filters.budget_min ?? filters.min_price ?? facets?.price_ranges?.min ?? 5_000);
  const priceMax  = facets?.price_ranges?.max ?? 200_000;
  const priceMin  = facets?.price_ranges?.min ?? 1_000;

  const currentType  = filters.house_type ?? filters.property_type ?? '';
  const currentBeds  = filters.bedrooms;
  const currentBaths = filters.bathrooms;

  const applyAreaSearch = () =>
    set({ search: areaSearchRef.current?.value.trim() || undefined });

  const categoryCounts = new Map(
    toArray(facets?.categories).map(c => [c.type, c.count]),
  );

  const pillActive   = 'border-violet-600 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-500/15 dark:text-violet-300';
  const pillInactive = 'border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/65 dark:hover:border-violet-500/50 dark:hover:text-violet-300';

  return (
    <aside
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#141421]"
      aria-label="Property filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-white/[0.05]">
        <span className="text-sm font-black text-slate-950 dark:text-white">Filters</span>
        {activeCount > 0 && (
          <button
            className="text-xs font-black text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            onClick={resetFilters}
          >
            Reset all
          </button>
        )}
      </div>

      {/* Location */}
      <Section label="Location">
        <div className="mb-3 flex items-center justify-between text-sm font-black text-slate-950 dark:text-white">
          <span>{filters.city ?? 'Nairobi, Kenya'}</span>
          <button className="text-xs font-black text-violet-600 hover:underline dark:text-violet-400">
            Change
          </button>
        </div>
        <form
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-slate-400 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 dark:border-white/[0.08] dark:text-white/30 dark:focus-within:border-violet-500 dark:focus-within:ring-violet-500/20"
          onSubmit={e => { e.preventDefault(); applyAreaSearch(); }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            key={filters.search ?? ''}
            ref={areaSearchRef}
            type="search"
            placeholder="Search area or suburb"
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/30"
            defaultValue={filters.search ?? ''}
            onBlur={applyAreaSearch}
            aria-label="Search area"
          />
        </form>
      </Section>

      {/* Property type */}
      <Section label="Property Type">
        <div className="space-y-0.5">
          <TypeRow
            checked={!currentType}
            onChange={() => set({ house_type: undefined, property_type: undefined })}
            label="All Types"
            count={facets?.total}
            loading={facetsLoading}
          />
          {PROPERTY_CATEGORY_OPTIONS.map(t => (
            <TypeRow
              key={t.value}
              checked={currentType === t.value}
              onChange={c => set({ house_type: c ? t.value : undefined, property_type: undefined })}
              label={t.label}
              count={categoryCounts.get(t.value)}
              loading={facetsLoading}
            />
          ))}
        </div>
      </Section>

      {/* Price Range */}
      <Section label="Price Range (KSh)">
        <p className="mb-3 text-sm font-black text-slate-950 dark:text-white">
          {budgetMin.toLocaleString()} – {budgetMax >= 50_000 ? '50,000+' : budgetMax.toLocaleString()}
        </p>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={500}
          value={budgetMax}
          onChange={e => set({ budget_max: Number(e.target.value), max_price: Number(e.target.value) })}
          className="w-full accent-violet-600"
          aria-label="Maximum price"
        />
      </Section>

      {/* Bedrooms */}
      <Section label="Bedrooms">
        <div className="flex flex-wrap gap-1.5">
          {(['Any', '1', '2', '3', '4+'] as const).map(v => {
            const val    = v === 'Any' ? undefined : v === '4+' ? 4 : Number(v);
            const active = v === 'Any' ? !currentBeds : currentBeds === val;
            return (
              <button
                key={v}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${active ? pillActive : pillInactive}`}
                onClick={() => set({ bedrooms: val })}
              >
                {v}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Bathrooms */}
      <Section label="Bathrooms">
        <div className="flex flex-wrap gap-1.5">
          {(['Any', '1', '2', '3+'] as const).map(v => {
            const val    = v === 'Any' ? undefined : v === '3+' ? 3 : Number(v);
            const active = v === 'Any' ? !currentBaths : currentBaths === val;
            return (
              <button
                key={v}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${active ? pillActive : pillInactive}`}
                onClick={() => set({ bathrooms: val })}
              >
                {v}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Amenities */}
      <Section label="Amenities">
        <div className="space-y-0.5">
          {AMENITY_OPTIONS.map(amenity => {
            const checked  = (filters.amenities ?? []).includes(amenity);
            const apiCount = facets?.amenities?.[amenity.toLowerCase()];
            return (
              <label key={amenity} className="flex cursor-pointer items-center gap-2.5 py-1.5 group">
                <input
                  type="checkbox"
                  checked={checked}
                  className="h-3.5 w-3.5 cursor-pointer accent-violet-600"
                  onChange={e => {
                    const cur = filters.amenities ?? [];
                    set({
                      amenities: e.target.checked
                        ? [...cur, amenity]
                        : cur.filter(a => a !== amenity),
                    });
                  }}
                />
                <span className="flex-1 text-sm font-medium text-slate-700 transition group-hover:text-slate-950 dark:text-white/60 dark:group-hover:text-white">
                  {amenity}
                </span>
                {facetsLoading
                  ? <FilterCountSkeleton />
                  : apiCount !== undefined && (
                    <span className="text-xs font-medium text-slate-400 dark:text-white/25">{apiCount}</span>
                  )
                }
              </label>
            );
          })}
        </div>
        <button className="mt-2 text-xs font-black text-violet-600 hover:underline dark:text-violet-400">
          Show more ∨
        </button>
      </Section>

      {/* Verified only */}
      <div className="px-4 py-4">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-violet-600"
            checked={!!filters.verified_only}
            onChange={e => set({ verified_only: e.target.checked || undefined })}
          />
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">Verified Landlords Only</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">Trusted listings with verified ownership</p>
          </div>
        </label>
      </div>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 dark:border-white/[0.05]">
      <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-white/35">
        {label}
      </h3>
      {children}
    </div>
  );
}

function TypeRow({
  checked, onChange, label, count, loading,
}: {
  checked: boolean;
  onChange: (c: boolean) => void;
  label: string;
  count?: number;
  loading?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 group">
      <input
        type="checkbox"
        checked={checked}
        className="h-3.5 w-3.5 cursor-pointer accent-violet-600"
        onChange={e => onChange(e.target.checked)}
      />
      <span className="flex-1 text-sm font-medium text-slate-700 transition group-hover:text-slate-950 dark:text-white/60 dark:group-hover:text-white">
        {label}
      </span>
      {loading
        ? <FilterCountSkeleton />
        : count !== undefined && (
          <span className="text-xs font-medium text-slate-400 dark:text-white/25">
            {count.toLocaleString()}
          </span>
        )
      }
    </label>
  );
}

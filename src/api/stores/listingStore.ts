import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { SearchFilters, VacancyUpdatedEvent } from '../../types';

// ─── Filter defaults ──────────────────────────────────────────────────────────
const DEFAULT_FILTERS: SearchFilters = { sort: 'smart', per_page: 15 };

// Count user-set filters (excluding pagination/sort)
const PAGINATION_KEYS = new Set(['sort', 'per_page', 'page']);
const countActive = (f: SearchFilters): number =>
  Object.entries(f).filter(
    ([k, v]) => !PAGINATION_KEYS.has(k) && v !== undefined && v !== null && v !== ''
  ).length;

const cleanFilters = (filters: SearchFilters): SearchFilters =>
  Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as SearchFilters;

const sameFilters = (a: SearchFilters, b: SearchFilters): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(key => {
    const left = a[key as keyof SearchFilters];
    const right = b[key as keyof SearchFilters];
    return Array.isArray(left) && Array.isArray(right)
      ? left.length === right.length && left.every((value, index) => value === right[index])
      : left === right;
  });
};

// ─── Store shape ──────────────────────────────────────────────────────────────
interface Store {
  filters:           SearchFilters;
  activeFilterCount: number;
  showMobileFilters: boolean;

  // Real-time vacancy: uuid → {available_units, is_available}
  vacancyMap: Map<string, { available_units: number; is_available: boolean }>;

  // Actions
  setFilters:          (patch: Partial<SearchFilters>) => void;
  resetFilters:        () => void;
  toggleMobileFilters: () => void;
  applyVacancyUpdate:  (e: VacancyUpdatedEvent) => void;
  markListingRemoved:  (uuid: string) => void;
}

export const useStore = create<Store>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      filters:           DEFAULT_FILTERS,
      activeFilterCount: 0,
      showMobileFilters: false,
      vacancyMap:        new Map(),

      setFilters: patch => {
        const current = get().filters;
        const merged = cleanFilters({ ...current, ...patch, page: patch.page ?? 1 });
        if (sameFilters(current, merged)) return;
        set(
          { filters: merged, activeFilterCount: countActive(merged) },
          false,
          'setFilters'
        );
      },

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS, activeFilterCount: 0 }, false, 'resetFilters'),

      toggleMobileFilters: () =>
        set({ showMobileFilters: !get().showMobileFilters }, false, 'toggleMobileFilters'),

      applyVacancyUpdate: e => {
        const m = new Map(get().vacancyMap);
        m.set(e.id, { available_units: e.available_units, is_available: e.is_available });
        set({ vacancyMap: m }, false, 'vacancyUpdate');
      },

      markListingRemoved: uuid => {
        const m = new Map(get().vacancyMap);
        m.set(uuid, { available_units: 0, is_available: false });
        set({ vacancyMap: m }, false, 'listingRemoved');
      },
    })),
    { name: 'StayLynk' }
  )
);

// ─── Convenience selectors ────────────────────────────────────────────────────
export const useFilters           = () => useStore(s => s.filters);
export const useActiveFilterCount = () => useStore(s => s.activeFilterCount);
export const useVacancyFor        = (uuid: string) =>
  useStore(s => s.vacancyMap.get(uuid));

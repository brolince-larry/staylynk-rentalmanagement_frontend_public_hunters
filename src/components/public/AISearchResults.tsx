import { useState, type ReactNode } from 'react';
import type { AiPropertyResult, AiSearchIntent } from '../../types';
import { AIPropertyCard } from './AIPropertyCard';
import { BarChart2, BedDouble, Car, MapPin, MapPinned, Wifi, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AISearchResults({
  properties,
  suggestions,
  intent,
  mapUrl,
  onSuggestion,
  onPropertyClick,
}: {
  properties?: AiPropertyResult[];
  suggestions?: string[];
  intent?: AiSearchIntent;
  mapUrl?: string | null;
  onSuggestion?: (suggestion: string) => void;
  onPropertyClick?: (property: AiPropertyResult) => void;
}) {
  const [showComparison, setShowComparison] = useState(false);

  const hasProperties = !!properties?.length;
  const hasSuggestions = !!suggestions?.length;
  const intentChips = intentToChips(intent);
  const hasIntent = intentChips.length > 0;
  const hasMapUrl = !!mapUrl;
  const top3 = (properties ?? []).slice(0, 3);
  const canCompare = top3.length >= 2;

  if (!hasProperties && !hasSuggestions && !hasIntent && !hasMapUrl) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-white/10">
      {hasIntent && (
        <div className="flex flex-wrap gap-1.5">
          {intentChips.map(chip => (
            <span key={chip} className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200/60 dark:bg-sky-400/[0.12] dark:text-sky-100 dark:ring-sky-200/10">
              {chip}
            </span>
          ))}
        </div>
      )}

      {hasProperties ? (
        <>
          <p className="text-xs font-black uppercase text-violet-600 dark:text-violet-200">Matching properties</p>
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {properties.slice(0, 5).map(property => (
              <motion.div
                key={property.uuid ?? property.slug}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show:  { opacity: 1, y: 0 },
                }}
              >
                <AIPropertyCard property={property} onPropertyClick={onPropertyClick} />
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : !hasSuggestions && !hasMapUrl ? (
        <p className="text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
          I could not find matching houses yet. Try increasing your budget, changing the location, or removing one amenity.
        </p>
      ) : null}

      {hasMapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-sky-300/50 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100 dark:border-sky-300/20 dark:bg-sky-400/[0.12] dark:text-sky-100 dark:hover:border-sky-200/50 dark:hover:bg-sky-400/[0.18]"
        >
          <MapPinned className="shrink-0" size={14} />
          <span className="truncate">View on Google Maps</span>
        </a>
      )}

      {/* Compare chip + panel */}
      {canCompare && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowComparison(s => !s)}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700 transition hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-400/[0.10] dark:text-violet-300 dark:hover:bg-violet-400/[0.18]"
          >
            <BarChart2 size={11} />
            {showComparison ? 'Hide comparison' : `Compare top ${top3.length} options`}
          </button>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ComparisonPanel properties={top3} onClose={() => setShowComparison(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {hasSuggestions && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestions.slice(0, 4).map(suggestion => (
            onSuggestion ? (
              <motion.span
                key={suggestion}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button
                  type="button"
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-[11px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.12] dark:hover:text-white"
                  onClick={() => onSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              </motion.span>
            ) : (
              <span key={suggestion} className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">
                {suggestion}
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comparison panel ─────────────────────────────────────────────────────────

function ComparisonPanel({ properties, onClose }: { properties: AiPropertyResult[]; onClose: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-violet-50/60 dark:border-violet-400/20 dark:bg-violet-500/[0.06]">
      <div className="flex items-center justify-between border-b border-violet-200/40 px-3 py-2.5 dark:border-violet-400/15">
        <span className="text-[11px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
          Side-by-side comparison
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close comparison"
          className="rounded-full p-0.5 text-violet-400 transition hover:bg-violet-200/40 hover:text-violet-700 dark:hover:bg-violet-400/20"
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-violet-200/30 dark:border-violet-400/10">
              <th className="w-24 px-3 py-2 font-black text-slate-500 dark:text-white/35" />
              {properties.map((p, i) => (
                <th key={p.uuid} className="px-2 py-2 font-black text-violet-700 dark:text-violet-300">
                  #{i + 1} {p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-200/20 dark:divide-violet-400/10">
            <CompareRow label="Price" properties={properties} render={p => formatPrice(p)} />
            <CompareRow
              label="Location"
              properties={properties}
              render={p => [p.neighbourhood, p.city].filter(Boolean).join(', ') || '—'}
              icon={<MapPin size={9} />}
            />
            <CompareRow
              label="Available"
              properties={properties}
              render={p => p.available_units != null ? `${p.available_units} unit${p.available_units !== 1 ? 's' : ''}` : '—'}
            />
            <CompareRow
              label="Type"
              properties={properties}
              render={p => p.house_types?.join(', ') || '—'}
              icon={<BedDouble size={9} />}
            />
            <CompareRow
              label="Amenities"
              properties={properties}
              render={p => (p.amenities?.slice(0, 3).join(', ')) || '—'}
              icon={<Wifi size={9} />}
            />
            <CompareRow
              label="Parking"
              properties={properties}
              render={p => p.parking_available ? '✓' : '—'}
              icon={<Car size={9} />}
            />
            {/* Map link row */}
            <tr>
              <td className="px-3 py-2 font-semibold text-slate-400 dark:text-white/30">Map</td>
              {properties.map(p => (
                <td key={p.uuid} className="px-2 py-2">
                  {p.map_url ? (
                    <a
                      href={p.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-bold text-sky-600 underline-offset-2 hover:underline dark:text-sky-300"
                    >
                      <MapPin size={9} /> Open
                    </a>
                  ) : (
                    <span className="text-slate-300 dark:text-white/20">—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  properties,
  render,
  icon,
}: {
  label: string;
  properties: AiPropertyResult[];
  render: (p: AiPropertyResult) => string;
  icon?: ReactNode;
}) {
  return (
    <tr>
      <td className="px-3 py-2 font-semibold text-slate-400 dark:text-white/30">
        <span className="flex items-center gap-1">{icon}{label}</span>
      </td>
      {properties.map(p => (
        <td key={p.uuid} className="px-2 py-2 font-bold text-slate-700 dark:text-white/80">
          {render(p)}
        </td>
      ))}
    </tr>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: AiPropertyResult) {
  const currency = p.currency ?? 'KES';
  if (p.rent_min && p.rent_max && p.rent_min !== p.rent_max) {
    return `${currency} ${p.rent_min.toLocaleString()}–${p.rent_max.toLocaleString()}/mo`;
  }
  const amount = p.rent_min ?? p.rent_max;
  return amount ? `${currency} ${amount.toLocaleString()}/mo` : 'POA';
}

function intentToChips(intent: AiSearchIntent | undefined) {
  if (!intent) return [];
  const chips: string[] = [];
  if (typeof intent.budget_max === 'number') chips.push(`Under ${formatMoney(intent.budget_max)}`);
  if (typeof intent.budget_min === 'number') chips.push(`From ${formatMoney(intent.budget_min)}`);
  chips.push(...(intent.locations ?? []));
  chips.push(...(intent.counties ?? []));
  chips.push(...(intent.property_types ?? []));
  chips.push(...(intent.nearby ?? []).map(item => `Near ${item}`));
  chips.push(...(intent.amenities ?? []));
  chips.push(...(intent.environment ?? []));
  if (intent.price_sensitivity) chips.push(intent.price_sensitivity);
  if (intent.style) chips.push(intent.style);
  if (intent.map_query) chips.push(intent.map_query);
  return [...new Set(chips.filter(Boolean))].slice(0, 8);
}

function formatMoney(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

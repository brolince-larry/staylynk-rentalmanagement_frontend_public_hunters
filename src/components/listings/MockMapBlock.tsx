import { useState } from 'react';
import type { ListingLocation, NearbyItem } from '../../types';

interface MockMapBlockProps {
  title: string;
  coverPhoto?: string | null;
  location: ListingLocation;
  nearbyItems?: NearbyItem[];
}

function mapsEmbedUrl(propertyName: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(propertyName)}&z=17&output=embed`;
}

function viewOnMapsUrl(propertyName: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyName)}`;
}

function directionsUrl(propertyName: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(propertyName)}&travelmode=transit`;
}

function nearbyUrl(propertyName: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`amenities near ${propertyName}`)}`;
}

function nearbyItemUrl(item: NearbyItem, propertyName: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${item.name} near ${propertyName}`)}`;
}

// ── Icon helper ──────────────────────────────────────────────────────────────

function nearbyTypeIcon(type: string): string {
  const t = type.toLowerCase();
  if (/transport|bus|matatu|transit|commute/.test(t)) return '🚌';
  if (/school|university|college|education/.test(t)) return '🏫';
  if (/hospital|clinic|health|medical/.test(t)) return '🏥';
  if (/police|security|station/.test(t)) return '🚔';
  if (/shop|mall|market|supermarket/.test(t)) return '🛍';
  if (/park|garden|recreation/.test(t)) return '🌳';
  if (/restaurant|food|cafe/.test(t)) return '🍽';
  if (/bank|atm|finance/.test(t)) return '🏦';
  if (/church|mosque|temple|worship/.test(t)) return '⛪';
  return '📍';
}

// ── Component ────────────────────────────────────────────────────────────────

export function MockMapBlock({ title, coverPhoto, location, nearbyItems = [] }: MockMapBlockProps) {
  const [showCard, setShowCard] = useState(true);

  const propertyName   = title || location.property_name || 'Property';
  const embedUrl       = mapsEmbedUrl(propertyName);
  const onMapsUrl      = viewOnMapsUrl(propertyName);
  const directionsHref = directionsUrl(propertyName);
  const nearbyHref     = nearbyUrl(propertyName);

  return (
    <div>
      {/* ── Map iframe ────────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden rounded-xl border border-white/[0.06] sm:h-80">
        <iframe
          title="Property location map"
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* ── Google Maps-style property card overlay ── */}
        {showCard && (
          <div className="absolute bottom-12 left-3 right-3 sm:right-auto sm:w-64 rounded-2xl overflow-hidden border border-white/[0.12] bg-[#09090f]/90 shadow-2xl backdrop-blur-md">
            {coverPhoto ? (
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={coverPhoto}
                  alt={propertyName}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setShowCard(false)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative flex h-20 items-center justify-center bg-gradient-to-br from-violet-900/60 to-slate-900">
                <svg className="h-9 w-9 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowCard(false)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            <div className="px-3 py-2.5">
              <p className="truncate text-[13px] font-black text-white leading-tight">{propertyName}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/45">
                {[location.neighbourhood, location.city].filter(Boolean).join(', ')}
              </p>
              <a
                href={onMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-violet-500"
              >
                Open in Google Maps
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 8L8 2M8 2H3M8 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        )}

        {!showCard && (
          <button
            type="button"
            onClick={() => setShowCard(true)}
            className="absolute bottom-12 left-3 flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-[#09090f]/80 px-3 py-1.5 text-[11px] font-bold text-white/70 backdrop-blur-sm transition hover:border-violet-500/40 hover:text-violet-200"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" />
            </svg>
            {propertyName}
          </button>
        )}

        {/* Nearby amenity chips — scrollable row pinned to bottom */}
        {nearbyItems.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09090f]/95 via-[#09090f]/50 to-transparent px-3 pb-3 pt-12">
            <div className="pointer-events-auto flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
              {nearbyItems.slice(0, 10).map((item, i) => (
                <a
                  key={`${item.type}-${i}`}
                  href={nearbyItemUrl(item, propertyName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.10] bg-[#09090f]/80 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm transition-colors hover:border-violet-500/40 hover:text-violet-200"
                >
                  <span className="text-[11px] leading-none">{nearbyTypeIcon(item.type)}</span>
                  <span>{item.name}</span>
                  <span className="text-white/35">
                    {item.distance_km < 1
                      ? `${Math.round(item.distance_km * 1000)} m`
                      : `${item.distance_km.toFixed(1)} km`}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Location label — top-left pill */}
        <div className="absolute left-3 top-3 rounded-full border border-white/[0.12] bg-[#09090f]/70 px-3 py-1 backdrop-blur-sm">
          <p className="text-[11px] font-black text-white/80">
            {[location.neighbourhood, location.city].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Click-to-open overlay */}
        <a
          href={onMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
        >
          <span className="scale-90 rounded-full bg-white/0 px-4 py-1.5 text-xs font-black text-white/0 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:bg-white/20 group-hover:text-white group-hover:opacity-100 group-hover:backdrop-blur-sm">
            Open in Google Maps
          </span>
        </a>
      </div>

      {/* ── Action buttons ─────────────────────────────────────── */}
      <div className="flex gap-2 pt-3">
        <a
          href={onMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-xs font-black text-white/70 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
        >
          <span>🗺</span> View on Maps
        </a>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-xs font-black text-white/70 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
        >
          <span>🧭</span> Get Directions
        </a>
        <a
          href={nearbyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-xs font-black text-white/70 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300"
        >
          <span>📍</span> Nearby Places
        </a>
      </div>

      {/* ── Nearby items grid ──────────────────────────────────── */}
      {nearbyItems.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {nearbyItems.slice(0, 6).map((item, i) => (
            <a
              key={`grid-${item.type}-${i}`}
              href={nearbyItemUrl(item, propertyName)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.06]"
            >
              <span className="text-base">{nearbyTypeIcon(item.type)}</span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black text-white">{item.name}</p>
                <p className="text-[10px] font-semibold text-white/35">
                  {item.distance_km < 1
                    ? `${Math.round(item.distance_km * 1000)} m away`
                    : `${item.distance_km.toFixed(1)} km away`}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

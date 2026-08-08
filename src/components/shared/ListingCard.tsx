import { memo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { useVacancyState } from '../../hooks/useRealtimeListings';
import { SmartImage } from '../media/SmartImage';
import { toArray } from '../../utils/collection';
import { CompareButton } from './CompareButton';
import { useSeekerStore } from '../../stores/seekerStore';

interface Props {
  listing: Listing;
  variant?: 'featured' | 'browse';
}

export const ListingCard = memo(function ListingCard({ listing, variant = 'browse' }: Props) {
  const title          = listing.title ?? 'Untitled listing';
  const slug           = listing.slug || listing.id;
  const saved          = useSeekerStore(s => s.isSaved(slug));
  const toggleSaved    = useSeekerStore(s => s.toggleSaved);
  const unitsAvailable = listing.units?.available ?? 0;
  const beds           = listing.specs?.bedrooms   ?? { min: 0, max: 0 };
  const baths          = listing.specs?.bathrooms  ?? { min: 0, max: 0 };
  const city           = listing.location?.city ?? 'Nairobi';
  const neighbourhood  = listing.location?.neighbourhood;
  const locationLabel  = neighbourhood ? `${neighbourhood}, ${city}` : city;
  const mapsUrl        = listing.location?.google_maps_url;
  const rooms          = toArray(listing.units?.rooms);
  const priceDisplay   = listing.pricing?.display ?? 'Price on request';
  const cover          = listing.media?.cover ?? null;
  const galleryCount   = (listing.media?.gallery?.length ?? 0) + rooms.reduce((t, r) => t + (r.media?.cover ? 1 : 0) + toArray(r.media?.gallery).length, 0);
  const imageCount     = (cover ? 1 : 0) + galleryCount;
  const videoCount     = toArray(listing.media?.videos).length;
  const features       = listing.features ?? {};
  const amenities      = toArray(listing.amenities);
  const isFeatured     = !!listing.visibility?.is_featured;
  const trustBadge     = getTrustBadge(listing.trust);
  const publishedAgo   = listing.visibility?.published_ago ?? 'Recently listed';
  const houseTypes     = toArray(listing.house_types).map(formatHouseType);
  const { isAvailable, isRealtime } = useVacancyState(listing.id, unitsAvailable);

  // ── Featured (vertical card, flips on hover to reveal quick facts) ────────
  if (variant === 'featured') {
    const backFacts = [
      beds.max > 0      && { icon: <BedIcon />,     label: `${specRange(beds)} Bed${beds.max !== 1 ? 's' : ''}` },
      baths.max > 0     && { icon: <BathIcon />,    label: `${specRange(baths)} Bath${baths.max !== 1 ? 's' : ''}` },
      features.parking  && { icon: <ParkingIcon />, label: 'Parking' },
      features.water    && { icon: <WaterIcon />,   label: 'Water' },
      features.internet && { icon: <WifiIcon />,    label: 'WiFi' },
    ].filter((f): f is { icon: ReactElement; label: string } => !!f).slice(0, 4);

    return (
      <div className={`group/flip flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-premium-sm dark:border-white/[0.07] dark:bg-[#141421] dark:hover:border-brand-500/30 ${!isAvailable ? 'opacity-60' : ''}`}>
        <Link to={`/listing/${slug}`} className="perspective-1200 relative block aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.05]">
          <div className="preserve-3d relative h-full w-full transition-transform duration-700 ease-premium group-hover/flip:rotate-y-180">

            {/* ── Front face ────────────────────────────────────────────────── */}
            <div className="group absolute inset-0 backface-hidden">
              {isFeatured && (
                <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-brand-600 px-2 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                  FEATURED
                </span>
              )}
              {cover
                ? <SmartImage src={cover} alt={title} aspectRatio="4 / 3" sizes="(max-width: 768px) 92vw, 360px" loadMargin="260px" className="h-full w-full" imgClassName="group-hover:scale-105 transition-transform duration-300" />
                : <NoImagePlaceholder />}
              <MediaBadges imageCount={imageCount} videoCount={videoCount} className="left-2.5" />
              <button
                className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all ${
                  saved ? 'bg-red-50 dark:bg-red-900/30' : 'bg-white/90 hover:bg-white dark:bg-black/40 dark:hover:bg-black/60'
                }`}
                onClick={e => { e.preventDefault(); toggleSaved(slug); }}
                aria-label={saved ? 'Remove from saved' : 'Save listing'}
              >
                <HeartIcon filled={saved} />
              </button>
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <span className="text-sm font-semibold text-white">Not Available</span>
                </div>
              )}
            </div>

            {/* ── Back face — quick facts revealed on hover ────────────────────── */}
            <div className="absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-4 bg-brand-gradient p-5 text-center backface-hidden">
              <p className="text-xs font-black uppercase tracking-wide text-white/70">At a glance</p>
              <div className="grid w-full max-w-[220px] grid-cols-2 gap-2.5">
                {backFacts.length > 0
                  ? backFacts.map(f => (
                      <div key={f.label} className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-2 text-xs font-bold text-white backdrop-blur">
                        {f.icon}{f.label}
                      </div>
                    ))
                  : <p className="col-span-2 text-xs font-semibold text-white/70">Details on the full listing page</p>}
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-brand-700">
                View full details <ArrowRightIcon />
              </span>
            </div>
          </div>
        </Link>

        <div className="flex flex-col gap-2 p-4">
          <Link to={`/listing/${slug}`} className="flex flex-col gap-2">
            {trustBadge && <TrustBadge badge={trustBadge} />}
            <p className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-white/40">
              <PinIcon />
              {locationLabel}
            </p>
            <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950 dark:text-white">
              {title}
            </h3>
            {houseTypes.length > 0 && <HouseTypePills types={houseTypes} />}
            <p className="text-base font-black text-slate-950 dark:text-white">
              {priceDisplay}
            </p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {unitsAvailable} vacant room{unitsAvailable === 1 ? '' : 's'}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-600 dark:text-white/50">
              {beds.max > 0 && (
                <span className="flex items-center gap-1"><BedIcon />{specRange(beds)} Bed{beds.max !== 1 ? 's' : ''}</span>
              )}
              {baths.max > 0 && (
                <span className="flex items-center gap-1"><BathIcon />{specRange(baths)} Bath{baths.max !== 1 ? 's' : ''}</span>
              )}
              {features.parking && <span className="flex items-center gap-1"><ParkingIcon />Parking</span>}
            </div>
          </Link>
          <div className="mt-1 flex items-center justify-between gap-2">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-brand-600 hover:underline dark:text-brand-400"
              >
                <PinIcon />View location
              </a>
            )}
            <CompareButton slug={slug} compact className="ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ── Browse (horizontal card) ──────────────────────────────────────────────
  return (
    <div className={`flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/60 dark:border-white/[0.07] dark:bg-[#141421] dark:hover:border-violet-500/30 dark:hover:shadow-black/40 max-sm:flex-col ${!isAvailable ? 'opacity-60' : ''}`}>
      <Link
        to={`/listing/${slug}`}
        className="group relative h-48 shrink-0 overflow-hidden bg-slate-100 dark:bg-white/[0.05] sm:h-auto sm:w-64 lg:w-72"
        aria-label={title}
      >
        {isFeatured && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-black uppercase text-white shadow-sm">
            FEATURED
          </span>
        )}
        {cover
          ? <SmartImage src={cover} alt={title} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 256px, 288px" loadMargin="260px" className="h-full w-full" imgClassName="group-hover:scale-105 transition-transform duration-300" />
          : <NoImagePlaceholder />}
        <MediaBadges imageCount={imageCount} videoCount={videoCount} className="right-2" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/listing/${slug}`}
              className="line-clamp-1 block text-lg font-black leading-snug text-slate-950 transition-colors hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
            >
              {title}
            </Link>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-white/40">
              <PinIcon />
              {locationLabel}
            </p>
            {houseTypes.length > 0 && <HouseTypePills types={houseTypes} className="mt-1.5" />}
            <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
              {priceDisplay}
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {unitsAvailable} vacant room{unitsAvailable === 1 ? '' : 's'}
            </p>
          </div>
          <button
            className={`shrink-0 rounded-full p-2 transition-colors ${
              saved
                ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-white/30 dark:hover:bg-white/[0.07] dark:hover:text-white/70'
            }`}
            onClick={() => toggleSaved(slug)}
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600 dark:text-white/50">
          {beds.max > 0  && <span className="flex items-center gap-1"><BedIcon />{specRange(beds)} Bed{beds.max !== 1 ? 's' : ''}</span>}
          {baths.max > 0 && <span className="flex items-center gap-1"><BathIcon />{specRange(baths)} Bath{baths.max !== 1 ? 's' : ''}</span>}
          {features.water    && <span className="flex items-center gap-1"><WaterIcon />Water</span>}
          {features.internet && <span className="flex items-center gap-1"><WifiIcon />WiFi</span>}
          {features.parking  && <span className="flex items-center gap-1"><ParkingIcon />Parking</span>}
          {amenities
            .filter(a => {
              const l = a.toLowerCase();
              if (features.water    && (l === 'water' || l === 'running water')) return false;
              if (features.internet && (l === 'wifi' || l === 'wi-fi' || l === 'internet' || l === 'internet access')) return false;
              if (features.parking  && (l === 'parking' || l === 'car park')) return false;
              return true;
            })
            .slice(0, 2)
            .map(a => (
              <span key={a} className="flex items-center gap-1"><CheckIcon />{a}</span>
            ))}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-2.5 dark:border-white/[0.05]">
          <CompareButton slug={slug} compact />
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-black text-violet-600 hover:underline dark:text-violet-400"
            >
              <PinIcon />View location
            </a>
          )}
          {trustBadge && <TrustBadge badge={trustBadge} compact />}
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-white/30">
            {isRealtime && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-label="Live" />
            )}
            {publishedAgo}
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const specRange = (s: { min: number; max: number }) =>
  s.min === s.max ? `${s.min}` : `${s.min}–${s.max}`;

type TrustBadgeModel = {
  label: 'Trusted Landlord' | 'Verified';
  tone: 'success' | 'info';
  description: string;
};

function getTrustBadge(trust: Listing['trust'] | null | undefined): TrustBadgeModel | null {
  if (trust?.is_trusted) {
    return { label: 'Trusted Landlord', tone: 'success', description: 'This landlord has been verified by StayLynk.' };
  }
  if (trust?.is_verified) {
    return { label: 'Verified', tone: 'info', description: 'This listing has verification checks.' };
  }
  return null;
}

function formatHouseType(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function HouseTypePills({ types, className = '' }: { types: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {types.map(type => (
        <span
          key={type}
          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-white/55"
        >
          {type}
        </span>
      ))}
    </div>
  );
}

function TrustBadge({ badge, compact = false }: { badge: TrustBadgeModel; compact?: boolean }) {
  const toneClass = badge.tone === 'success'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
    : 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20';

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded px-2 py-1 font-bold ring-1 ${toneClass} ${compact ? 'text-xs' : 'text-[11px]'}`}
      title={badge.description}
    >
      <VerifiedIcon />
      {badge.label}
    </span>
  );
}

function MediaBadges({ imageCount, videoCount, className }: { imageCount: number; videoCount: number; className: string }) {
  if (imageCount <= 1 && videoCount === 0) return null;

  return (
    <div className={`absolute bottom-2 flex items-center gap-1.5 ${className}`}>
      {imageCount > 1 && (
        <span className="flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold text-white">
          <CameraIcon />{imageCount}
        </span>
      )}
      {videoCount > 0 && (
        <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-black text-white shadow-sm">
          <VideoIcon />{videoCount}
        </span>
      )}
    </div>
  );
}

// ─── Inline icons ─────────────────────────────────────────────────────────────
const CameraIcon  = () => <svg className="inline" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const VideoIcon   = () => <svg className="inline" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg>;
const HeartIcon   = ({ filled }: { filled: boolean }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const PinIcon     = () => <svg className="inline shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const BedIcon     = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9V20M22 9V20M2 16H22M7 16V9M2 9C2 9 6 6 12 6C18 6 22 9 22 9" strokeLinecap="round"/></svg>;
const BathIcon    = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12H20V17C20 19.2 18.2 21 16 21H8C5.8 21 4 19.2 4 17V12Z"/><path d="M4 12V6C4 4.9 4.9 4 6 4H8V7" strokeLinecap="round"/></svg>;
const WaterIcon   = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L5.5 9.5C4.2 11 3.5 12.8 3.5 14.5C3.5 18.6 7.4 22 12 22s8.5-3.4 8.5-7.5c0-1.7-.7-3.5-2-5L12 2Z"/></svg>;
const WifiIcon    = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
const ParkingIcon = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>;
const CheckIcon   = () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const VerifiedIcon= () => <svg className="inline shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const ArrowRightIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const NoImagePlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#0e0e1a] dark:to-slate-900">
    <svg className="h-12 w-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" />
    </svg>
  </div>
);

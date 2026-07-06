import { Car, Droplets, MapPin, ShieldCheck, Star, Wifi } from 'lucide-react';
import type { HunterListing } from '../../types/hunter';

interface HunterListingCardProps {
  listing: HunterListing;
  index: number;
  onAsk: (msg: string, listingUuid?: string | null) => void;
}

function matchBadgeClass(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30';
  if (score >= 75) return 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30';
  if (score >= 60) return 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30';
  if (score >= 45) return 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30';
  return 'bg-white/10 text-white/50 ring-1 ring-white/10';
}

export function HunterListingCard({ listing, index, onAsk }: HunterListingCardProps) {
  const location = [listing.neighbourhood, listing.city].filter(Boolean).join(', ');

  return (
    <button
      type="button"
      onClick={() => onAsk(`Tell me about #${index + 1} — ${listing.title}`, listing.uuid)}
      className="group w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] text-left transition hover:border-violet-500/40 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:w-[240px]"
      aria-label={`Learn more about ${listing.title}`}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#141421]">
        {listing.cover_image ? (
          <img
            src={listing.cover_image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20" />
        )}

        {/* Index number */}
        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-black text-white backdrop-blur-sm">
          {index + 1}
        </div>

        {/* Match badge */}
        <div
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black backdrop-blur-sm ${matchBadgeClass(listing.match_score)}`}
        >
          {listing.match_score}%
        </div>

        {/* Verified badge */}
        {listing.verification_status === 'verified' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm ring-1 ring-emerald-500/30">
            <ShieldCheck size={9} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-300">Verified</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-black text-white group-hover:text-violet-200">
          {listing.title}
        </p>
        {location && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-white/40">
            <MapPin size={9} />
            {location}
          </p>
        )}
        <p className="mt-1.5 text-sm font-black text-violet-300">
          {listing.currency} {listing.rent_min.toLocaleString()}
          {listing.rent_max > listing.rent_min && `–${listing.rent_max.toLocaleString()}`}
          <span className="text-[10px] font-semibold text-white/30">/mo</span>
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            {listing.water_available && <Droplets size={11} className="text-sky-400" />}
            {listing.internet_available && <Wifi size={11} className="text-sky-400" />}
            {listing.parking_available && <Car size={11} className="text-sky-400" />}
          </div>
          {listing.property_rating != null && (
            <div className="flex items-center gap-0.5">
              <Star size={9} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black text-amber-300">{listing.property_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {listing.available_units > 0 && (
          <p className="mt-1.5 text-[10px] font-bold text-emerald-400">
            {listing.available_units} unit{listing.available_units === 1 ? '' : 's'} available
          </p>
        )}
      </div>
    </button>
  );
}

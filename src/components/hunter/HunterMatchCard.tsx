import { BedDouble, MapPin, ShieldCheck } from 'lucide-react';
import type { HunterMatchResult } from '../../types/hunter';

function scoreBadge(score: number): string {
  if (score >= 0.7) return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
  if (score >= 0.4) return 'border-amber-500/40 bg-amber-500/15 text-amber-300';
  return 'border-red-500/40 bg-red-500/10 text-red-400';
}

interface HunterMatchCardProps {
  result: HunterMatchResult;
  checked: boolean;
  compareDisabled: boolean;
  onCompareToggle: (id: string) => void;
  onAsk: (msg: string) => void;
}

export function HunterMatchCard({
  result,
  checked,
  compareDisabled,
  onCompareToggle,
  onAsk,
}: HunterMatchCardProps) {
  const { room, score } = result;
  const pct = Math.round(score * 100);
  const location = [room.area, room.city].filter(Boolean).join(', ');

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04]">
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#141421]">
        {room.cover_image ? (
          <img
            src={room.cover_image}
            alt={room.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20" />
        )}

        {/* Room number badge */}
        {room.room_number && (
          <div className="absolute left-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-black text-white/80 backdrop-blur-sm">
            #{room.room_number}
          </div>
        )}

        {/* Status badge */}
        {room.status && room.status !== 'available' && (
          <div className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-black backdrop-blur-sm ${
            room.status === 'maintenance'
              ? 'bg-amber-500/80 text-white'
              : 'bg-red-500/80 text-white'
          }`}>
            {room.status}
          </div>
        )}

        {/* Compare checkbox */}
        <label className="absolute left-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
          <input
            type="checkbox"
            checked={checked}
            disabled={compareDisabled && !checked}
            onChange={() => onCompareToggle(room.id)}
            className="h-3.5 w-3.5 accent-violet-500"
          />
          <span className="text-[10px] font-black text-white/80">Compare</span>
        </label>

        {/* Verified */}
        {room.verification_status === 'verified' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm ring-1 ring-emerald-500/30">
            <ShieldCheck size={9} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-300">Verified</span>
          </div>
        )}

        {/* Match score badge */}
        <div className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-black backdrop-blur-sm ${scoreBadge(score)}`}>
          {pct}% match
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => onAsk(room.slug ? `Tell me about ${room.slug}` : `Tell me more about ${room.title}`)}
          className="w-full text-left"
        >
          <p className="line-clamp-1 text-sm font-black text-white hover:text-violet-200">
            {room.title}
          </p>
          {room.property_name && room.property_name !== room.title && (
            <p className="mt-0.5 text-[11px] font-semibold text-white/40">{room.property_name}</p>
          )}
          {location && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-white/40">
              <MapPin size={9} />
              {location}
            </p>
          )}
        </button>

        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-sm font-black text-violet-300">
            {room.currency ?? 'KES'} {room.monthly_rent.toLocaleString()}
            {room.rent_max && room.rent_max > room.monthly_rent && (
              <span className="text-[11px] font-semibold text-violet-400/70">–{room.rent_max.toLocaleString()}</span>
            )}
            <span className="text-[10px] font-semibold text-white/30">/mo</span>
          </p>
          <div className="flex items-center gap-2">
            {room.available_units != null && room.available_units > 0 && (
              <span className="text-[10px] font-bold text-emerald-400">{room.available_units} avail</span>
            )}
            {room.bedrooms != null && room.bedrooms > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/40">
                <BedDouble size={10} />
                {room.bedrooms} bd
              </span>
            )}
          </div>
        </div>


        {/* Amenity chips */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map(a => (
              <span
                key={a}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-white/50"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {room.available_from && (
          <p className="mt-2 text-[10px] font-semibold text-emerald-400">
            Available{' '}
            {new Date(room.available_from).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

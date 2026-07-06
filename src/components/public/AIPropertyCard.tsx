import { Link } from 'react-router-dom';
import { BedDouble, Car, Home, MapPin, MessageCircle, Play, Shield, Users, Wifi, X, Zap, Droplets } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { AiPropertyResult } from '../../types';

const AMENITY_ICONS: Record<string, ReactNode> = {
  wifi:              <Wifi size={10} />,
  'wi-fi':           <Wifi size={10} />,
  internet:          <Wifi size={10} />,
  parking:           <Car size={10} />,
  water:             <Droplets size={10} />,
  'water available': <Droplets size={10} />,
  security:          <Shield size={10} />,
  'gated security':  <Shield size={10} />,
};

function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/i.test(url);
}

function youtubeEmbedUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

function formatPrice(property: AiPropertyResult): string {
  const currency = property.currency ?? 'KES';
  if (property.rent_min && property.rent_max && property.rent_min !== property.rent_max) {
    return `${currency} ${property.rent_min.toLocaleString()} – ${property.rent_max.toLocaleString()}`;
  }
  const amount = property.rent_min ?? property.rent_max;
  return amount ? `${currency} ${amount.toLocaleString()}/mo` : 'Price on request';
}

function formatBedrooms(property: AiPropertyResult): string | null {
  if (property.bedrooms_min && property.bedrooms_max && property.bedrooms_min !== property.bedrooms_max) {
    return `${property.bedrooms_min}–${property.bedrooms_max} bed`;
  }
  const n = property.bedrooms_min ?? property.bedrooms_max;
  if (!n) return null;
  return n === 0 ? 'Bedsitter' : `${n} bed`;
}

function buildFeatureChips(property: AiPropertyResult): Array<{ label: string; icon?: ReactNode }> {
  const chips: Array<{ label: string; icon?: ReactNode }> = [];
  if (property.house_type) chips.push({ label: property.house_type, icon: <Home size={11} /> });
  const bedrooms = formatBedrooms(property);
  if (bedrooms) chips.push({ label: bedrooms, icon: <BedDouble size={11} /> });
  if (property.parking_available)   chips.push({ label: 'Parking',          icon: <Car size={11} /> });
  if (property.internet_available)  chips.push({ label: 'Wi-Fi',            icon: <Wifi size={11} /> });
  if (property.is_family_friendly)  chips.push({ label: 'Family friendly',  icon: <Users size={11} /> });
  if (property.is_student_friendly) chips.push({ label: 'Student friendly', icon: <Users size={11} /> });
  return chips;
}

// ─── Video modal ──────────────────────────────────────────────────────────────

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const embedUrl = isYouTube(url) ? youtubeEmbedUrl(url) : null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/90"
        >
          <X size={14} />
        </button>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Virtual tour"
            className="aspect-video w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={url}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full"
          />
        )}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function AIPropertyCard({
  property,
  onPropertyClick,
}: {
  property: AiPropertyResult;
  onPropertyClick?: (property: AiPropertyResult) => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const price    = formatPrice(property);
  const location = [property.neighbourhood, property.city, property.county].filter(Boolean).join(', ');
  const featureChips = buildFeatureChips(property);
  const tourUrl   = property.tour_videos?.[0]?.url ?? null;
  const waNumber  = property.whatsapp_number?.replace(/\D/g, '') ?? null;
  const waHref    = waNumber
    ? `https://wa.me/${waNumber.startsWith('0') ? `254${waNumber.slice(1)}` : waNumber}?text=${encodeURIComponent('Hi, I saw your listing on StayLynk and I\'m interested.')}`
    : null;

  return (
    <>
      {videoOpen && tourUrl && (
        <VideoModal url={tourUrl} onClose={() => setVideoOpen(false)} />
      )}

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-100 transition-all duration-200 hover:border-violet-300 hover:shadow-violet-100 dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-black/30 dark:hover:border-violet-400/40">
        <Link
          to={`/listings/${property.slug}`}
          onClick={() => onPropertyClick?.(property)}
          className="block"
        >
          {/* Cover image */}
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 sm:h-48">
            {property.cover_image ? (
              <img
                src={property.cover_image as string}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Home size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
            )}
            {/* Price badge */}
            <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-sm">
              <p className="text-sm font-black text-white">{price}</p>
            </div>
            {/* Match score */}
            {typeof property.similarity_score === 'number' && (
              <div className="absolute right-2 top-2 rounded-full bg-violet-600/90 px-2 py-0.5 backdrop-blur-sm">
                <p className="text-[11px] font-black text-white">{Math.round(property.similarity_score * 100)}% match</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="line-clamp-1 text-sm font-black text-slate-900 dark:text-white">
              {property.title}
            </p>
            {location && (
              <p className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <MapPin className="shrink-0" size={11} />
                <span className="truncate">{location}</span>
              </p>
            )}

            {/* Map link — below location, above chips */}
            {property.map_url && (
              <span
                onClick={e => e.preventDefault()}
                className="contents"
              >
                <a
                  href={property.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-sky-200/60 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-400/[0.10] dark:text-sky-200 dark:hover:bg-sky-400/[0.18]"
                >
                  <MapPin size={10} className="shrink-0" />
                  View on Map
                </a>
              </span>
            )}

            {/* Feature chips */}
            {featureChips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {featureChips.slice(0, 6).map(chip => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-white/[0.08] dark:text-slate-300"
                  >
                    {chip.icon}
                    {chip.label}
                  </span>
                ))}
              </div>
            )}

            {/* Amenities */}
            {(property.amenities?.length ?? 0) > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {(property.amenities ?? []).slice(0, 5).map(a => {
                  const icon = AMENITY_ICONS[a.toLowerCase()] ?? <Zap size={9} />;
                  return (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/[0.12] dark:text-violet-300"
                    >
                      {icon}
                      {a}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </Link>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2 dark:border-white/[0.06]">
          {/* Virtual tour */}
          {tourUrl && (
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-fuchsia-200/60 bg-fuchsia-50 px-2.5 py-1.5 text-[11px] font-black text-fuchsia-700 transition hover:bg-fuchsia-100 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/[0.10] dark:text-fuchsia-300 dark:hover:bg-fuchsia-400/[0.18]"
            >
              <Play size={10} className="fill-current" />
              Virtual Tour
            </button>
          )}

          {/* WhatsApp */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-emerald-200/60 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/[0.10] dark:text-emerald-300 dark:hover:bg-emerald-400/[0.18]"
            >
              <MessageCircle size={10} />
              WhatsApp Caretaker
            </a>
          )}

          <Link
            to={`/listings/${property.slug}`}
            onClick={() => onPropertyClick?.(property)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-[11px] font-black text-white shadow-sm shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            View listing →
          </Link>
        </div>
      </article>
    </>
  );
}

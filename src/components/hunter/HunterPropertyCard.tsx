import { useState } from 'react';
import {
  Baby, Car, CheckCircle, ChevronLeft, ChevronRight,
  Droplets, ExternalLink, GraduationCap, MapPin,
  MessageCircle, PawPrint, Play, ShieldCheck, Star,
  Users, Wifi, Navigation,
} from 'lucide-react';
import type { HunterProperty, HunterPropertyVideo } from '../../types/hunter';

interface HunterPropertyCardProps {
  property: HunterProperty;
  onAsk: (msg: string) => void;
}

// ── Map URL builders (name search finds the Google Maps business listing) ────────

// city + name only — no county, no country; coordinates provide location context when available
function buildHunterQuery(p: HunterProperty): string {
  return p.title ?? '';
}

function mapsEmbedUrl(p: HunterProperty): string | null {
  const q = buildHunterQuery(p);
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=17&output=embed`;
}

function mapsViewUrl(p: HunterProperty): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildHunterQuery(p))}`;
}

function directionsUrl(p: HunterProperty): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(buildHunterQuery(p))}&travelmode=transit`;
}

function nearbyPlaceUrl(label: string, p: HunterProperty): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${label} near ${buildHunterQuery(p)}`)}`;
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

function nearbyIcon(label: string): string {
  const l = label.toLowerCase();
  if (/hospital|clinic|health/.test(l)) return '🏥';
  if (/school|college|university/.test(l)) return '🏫';
  if (/bus|matatu|transit|stage/.test(l)) return '🚌';
  if (/police|station/.test(l)) return '🚔';
  if (/market|shop|mall|supermarket/.test(l)) return '🛍';
  if (/park|garden/.test(l)) return '🌳';
  if (/restaurant|food|cafe/.test(l)) return '🍽';
  if (/bank|atm/.test(l)) return '🏦';
  return '📍';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HunterPropertyCard({ property: p, onAsk }: HunterPropertyCardProps) {
  const allImages = [p.cover_image, ...(p.gallery ?? [])].filter(Boolean) as string[];
  const [imgIndex, setImgIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const videos: HunterPropertyVideo[] = p.videos ?? [];
  const nearbyEntries = Object.entries(p.nearby_places ?? {}).slice(0, 6);
  const embedUrl = mapsEmbedUrl(p);
  const viewUrl = mapsViewUrl(p);
  const dirsUrl = directionsUrl(p);

  const price =
    p.rent_min === p.rent_max
      ? `${p.currency ?? 'KES'} ${p.rent_min.toLocaleString()}/mo`
      : `${p.currency ?? 'KES'} ${p.rent_min.toLocaleString()}–${p.rent_max.toLocaleString()}/mo`;

  const prevImg = () => setImgIndex(i => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setImgIndex(i => (i + 1) % allImages.length);

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">

      {/* ── Image gallery ─────────────────────────────────────── */}
      {allImages.length > 0 ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-[#141421] group">
          <img
            src={allImages[imgIndex]}
            alt={`${p.title} – photo ${imgIndex + 1}`}
            className="h-full w-full object-cover transition-opacity duration-300"
            loading="lazy"
          />

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition"
                aria-label="Next photo"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
              <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-black text-white/80 backdrop-blur-sm">
                {imgIndex + 1}/{allImages.length}
              </span>
            </>
          )}

          <div className="absolute left-2 top-2 flex gap-1.5">
            {p.verification_status === 'verified' && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 backdrop-blur-sm ring-1 ring-emerald-500/30">
                <ShieldCheck size={9} /> Verified
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-white/[0.03]">
          <p className="text-xs font-semibold text-white/20">No photos yet</p>
        </div>
      )}

      {/* ── Video thumbnails strip ───────────────────────────── */}
      {videos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 [&::-webkit-scrollbar]:hidden">
          <p className="flex-none self-center text-[10px] font-black uppercase tracking-wider text-white/30 pr-1">
            Videos
          </p>
          {videos.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPlayingVideo(playingVideo === v.url ? null : v.url)}
              className="relative shrink-0 h-16 w-28 overflow-hidden rounded-lg border border-white/[0.07] bg-black"
              aria-label={v.title ?? `Video ${i + 1}`}
            >
              {v.thumbnail ? (
                <img src={v.thumbnail} alt="" className="h-full w-full object-cover opacity-70" />
              ) : (
                <div className="h-full w-full bg-white/[0.04]" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm ${playingVideo === v.url ? 'bg-violet-500/60' : 'bg-white/20'}`}>
                  <Play size={12} className="fill-white text-white ml-0.5" />
                </div>
              </div>
              {v.title && (
                <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white/80">
                  {v.title}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Inline video player ──────────────────────────────── */}
      {playingVideo && (
        <div className="relative mx-4 mt-3 aspect-video overflow-hidden rounded-xl bg-black">
          <video
            src={playingVideo}
            controls
            autoPlay
            className="h-full w-full object-contain"
            onEnded={() => setPlayingVideo(null)}
          />
          <button
            type="button"
            onClick={() => setPlayingVideo(null)}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80"
            aria-label="Close video"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Details ───────────────────────────────────────────── */}
      <div className="p-4">

        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-black text-white leading-tight">{p.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white/45">
              <MapPin size={11} />
              {[p.address_display, p.neighbourhood, p.city].filter(Boolean).join(', ')}
            </p>
          </div>
          {p.property_rating != null && p.property_rating > 0 && (
            <div className="shrink-0 flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 ring-1 ring-amber-500/20">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-amber-300">{p.property_rating.toFixed(1)}</span>
              {p.review_count > 0 && (
                <span className="text-[10px] text-white/30">({p.review_count})</span>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-lg font-black text-violet-300">{price}</p>

        {p.description && (
          <p className="mt-2 text-xs font-medium leading-5 text-white/50 line-clamp-3">
            {p.description}
          </p>
        )}

        {/* ── Feature chips ───────────────────────────────────── */}
        <div className="mt-3 flex flex-wrap gap-2">
          {p.water_available && <Feature icon={<Droplets size={11} />} label="Water" />}
          {p.internet_available && <Feature icon={<Wifi size={11} />} label="WiFi" />}
          {p.parking_available && <Feature icon={<Car size={11} />} label="Parking" />}
          {p.security_level && (
            <Feature icon={<ShieldCheck size={11} />} label={`Security: ${p.security_level}`} />
          )}
          {p.is_family_friendly && <Feature icon={<Baby size={11} />} label="Family friendly" />}
          {p.is_student_friendly && <Feature icon={<GraduationCap size={11} />} label="Student friendly" />}
          {p.pets_allowed && <Feature icon={<PawPrint size={11} />} label="Pets OK" />}
        </div>

        {/* ── Amenity chips ─────────────────────────────────── */}
        {(p.amenities ?? []).length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/25">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {p.amenities.map(a => (
                <span
                  key={a}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-white/55"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats row ─────────────────────────────────────── */}
        {(p.available_units > 0 || (p.landlord_rating != null && p.landlord_rating > 0)) && (
          <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
            {p.available_units > 0 && (
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <Users size={11} />
                {p.available_units} unit{p.available_units !== 1 ? 's' : ''} available
              </span>
            )}
            {p.landlord_rating != null && p.landlord_rating > 0 && (
              <span className="flex items-center gap-1 font-semibold">
                Landlord: <span className="ml-1 font-black text-amber-300">{p.landlord_rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        )}

        {/* ── Available rooms ────────────────────────────────── */}
        {(p.available_rooms ?? []).length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-white/30">
              Available Rooms
            </p>
            <div className="space-y-1.5">
              {p.available_rooms.map(room => (
                <div
                  key={room.uuid}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={11} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">Room {room.room_number}</span>
                  </div>
                  <span className="text-xs font-black text-violet-300">
                    {p.currency ?? 'KES'} {room.monthly_rent.toLocaleString()}/mo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAsk(`Book ${p.title}`)}
            className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            Book This House
          </button>

          {p.whatsapp_url ? (
            <a
              href={p.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/20 active:scale-95"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onAsk(`I want to contact the manager for ${p.title}`)}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-black text-white/60 transition hover:border-emerald-500/30 hover:text-emerald-300 active:scale-95"
            >
              <MessageCircle size={12} />
              Contact Manager
            </button>
          )}

          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-black text-white/60 transition hover:border-sky-500/30 hover:text-sky-300 active:scale-95"
          >
            <ExternalLink size={12} />
            View on Maps
          </a>

          <a
            href={dirsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-black text-white/60 transition hover:border-emerald-500/30 hover:text-emerald-300 active:scale-95"
          >
            <Navigation size={12} />
            Directions
          </a>
        </div>
      </div>

      {/* ── Location map ─────────────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowMap(v => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-black text-white/50 transition hover:text-white/80"
        >
          <span className="flex items-center gap-2">
            <MapPin size={12} className="text-violet-400" />
            Location{p.neighbourhood ? ` · ${p.neighbourhood}` : ''}
          </span>
          <span className="text-[10px] text-white/30">{showMap ? 'Hide' : 'Show map'}</span>
        </button>

        {showMap && (
          <div>
            <div className="relative mx-3 mb-3 h-52 overflow-hidden rounded-xl border border-white/[0.06]">
              {embedUrl ? (
                <iframe
                  title={`Map of ${p.title}`}
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/[0.03]">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-xs font-black text-white/70 transition hover:border-violet-500/40 hover:text-violet-300"
                  >
                    <ExternalLink size={12} />
                    Open on Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Nearby places — clickable rows */}
            {nearbyEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                {nearbyEntries.map(([label, km]) => (
                  <a
                    key={label}
                    href={nearbyPlaceUrl(label, p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-2 transition hover:border-white/[0.12] hover:bg-white/[0.06]"
                  >
                    <span className="text-sm">{nearbyIcon(label)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-black capitalize text-white group-hover:text-violet-200">
                        {label.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[10px] font-semibold text-white/35">
                        {(km as number) < 1
                          ? `${Math.round((km as number) * 1000)} m`
                          : `${(km as number).toFixed(1)} km`}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-sky-300">
      {icon}
      {label}
    </span>
  );
}

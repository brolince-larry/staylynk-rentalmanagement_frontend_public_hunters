import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitCompare,
  Loader2,
  MapPin,
  MessageCircle,
  PenSquare,
  Send,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  hunterApi,
  getStoredHunterSession,
  storeHunterSession,
  clearHunterSession,
} from '../api/hunterApi';
import { typeWords } from '../services/aiChat';
import { AIThinkingOrb } from '../components/public/AIThinkingOrb';
import { AIMediaGallery } from '../components/public/AIMediaGallery';
import { HunterPropertyCard } from '../components/hunter/HunterPropertyCard';
import { HunterMatchCard } from '../components/hunter/HunterMatchCard';
import { HunterComparePanel } from '../components/hunter/HunterComparePanel';
import { HunterChartBlock } from '../components/hunter/HunterChartBlock';
import { Seo } from '../components/seo/Seo';
import type {
  HunterActionIntent,
  HunterCompareData,
  HunterMessage,
  HunterProperty,
  HunterPropertyAction,
  HunterStage,
} from '../types/hunter';
import type { AIMediaItem } from '../types';

const TYPING_SPEED_MS = 30;

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Partial<Record<HunterStage, string>> = {
  NEED_LOCATION:       'Location',
  TOWN_DISAMBIGUATION: 'Choose town',
  NEED_BUDGET:         'Budget',
  NEED_TYPE:           'Property type',
  TYPE_SELECTION:      'Property type',
  RESULTS_SHOWN:       'Results',
  PROPERTY_LIST:       'Properties',
  PROPERTY_DETAIL:     'Property detail',
  BOOKING_DATE:        'Move-in date',
  BOOKING_CONTACT:     'Your details',
  BOOKING_CONFIRM:     'Confirm booking',
};

const STAGE_ORDER: HunterStage[] = [
  'NEED_LOCATION',
  'TOWN_DISAMBIGUATION',
  'TYPE_SELECTION',
  'PROPERTY_LIST',
  'PROPERTY_DETAIL',
  'BOOKING_DATE',
  'BOOKING_CONTACT',
  'BOOKING_CONFIRM',
];

/** Inline bold: **text** → <strong> */
function renderText(text: string): ReactNode {
  const lines = text.split('\n');
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {li > 0 && <br />}
        {parts.map((part, pi) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={pi} className="font-black text-white">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={pi}>{part}</span>
          ),
        )}
      </span>
    );
  });
}

// ─── Action intent sub-components ────────────────────────────────────────────

function PropertyActionsBlock({
  actions,
  onAsk,
}: {
  actions: HunterPropertyAction[];
  onAsk: (msg: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map(action => {
        if (action.type === 'whatsapp' || action.type === 'maps') {
          return (
            <a
              key={action.type}
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition ${
                action.type === 'whatsapp'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border border-white/[0.07] bg-white/[0.04] text-white/60 hover:border-sky-500/30 hover:text-sky-300'
              }`}
            >
              {action.type === 'whatsapp' ? <MessageCircle size={12} /> : <ExternalLink size={12} />}
              {action.label}
            </a>
          );
        }
        return (
          <button
            key={`${action.type}-${action.label}`}
            type="button"
            onClick={() =>
              action.type === 'book'
                ? onAsk(`Book this house`)
                : action.action === 'show_more'
                  ? onAsk('Show more properties')
                  : onAsk(action.label)
            }
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
              action.type === 'book'
                ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30 hover:from-violet-500 hover:to-fuchsia-500'
                : 'border border-white/[0.07] bg-white/[0.04] text-white/60 hover:border-violet-500/30 hover:text-violet-300'
            }`}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function DatePickerBlock({
  intent,
  onConfirm,
}: {
  intent: HunterActionIntent;
  onConfirm: (date: string) => void;
}) {
  const [date, setDate] = useState('');
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2">
        <CalendarDays size={14} className="shrink-0 text-violet-400" />
        <input
          type="date"
          min={intent.min_date}
          max={intent.max_date}
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white outline-none [color-scheme:dark]"
        />
      </div>
      <button
        type="button"
        disabled={!date}
        onClick={() => onConfirm(date)}
        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white transition hover:bg-violet-500 disabled:opacity-40"
      >
        Confirm
      </button>
    </div>
  );
}

function BookingConfirmBlock({
  intent,
  onAsk,
}: {
  intent: HunterActionIntent;
  onAsk: (msg: string) => void;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">Booking Summary</p>
      </div>
      <div className="space-y-2 px-4 py-3 text-xs font-semibold text-white/55">
        <p>
          Property:{' '}
          <span className="font-black text-white">{intent.booking_slug}</span>
        </p>
        <p>
          Move-in:{' '}
          <span className="font-black text-white">{intent.booking_date}</span>
        </p>
        <p>
          Name:{' '}
          <span className="font-black text-white">{intent.hunter_name}</span>
        </p>
        <p>
          Email:{' '}
          <span className="font-black text-white">{intent.hunter_email}</span>
        </p>
        <p>
          Phone:{' '}
          <span className="font-black text-white">{intent.hunter_phone}</span>
        </p>
      </div>
      <div className="flex gap-2 border-t border-white/[0.06] px-4 py-3">
        <button
          type="button"
          onClick={() => onAsk('Yes, confirm')}
          className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-black text-white transition hover:bg-emerald-500"
        >
          ✅ Yes, confirm
        </button>
        <button
          type="button"
          onClick={() => onAsk('No, cancel')}
          className="flex-1 rounded-lg border border-white/[0.08] py-2.5 text-xs font-black text-white/55 transition hover:bg-white/[0.05]"
        >
          ❌ No, cancel
        </button>
      </div>
    </div>
  );
}

function SubmitBookingBlock({
  intent,
  onSubmit,
}: {
  intent: HunterActionIntent;
  onSubmit: (intent: HunterActionIntent) => void;
}) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => onSubmit(intent)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500"
      >
        <Send size={14} />
        {intent.label ?? 'Submit Booking Request'}
      </button>
    </div>
  );
}

// ─── Disambiguation / guided flow blocks ─────────────────────────────────────

function formatHouseType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

type DisambigCandidate = { city: string; types: Array<{ type: string; count: number }>; total: number };
type TypeOption = { type: string; count: number; price_min: number; price_max: number };
type PropertyListItem = {
  rank: number;
  slug: string;
  title: string;
  house_type: string;
  rent_min: number;
  rent_max: number;
  neighbourhood?: string;
  available_units: number;
  cover_image?: string | null;
  water_available?: boolean;
  internet_available?: boolean;
  parking_available?: boolean;
  verification_status?: string;
  property_rating?: number | null;
};

function TownOptionsBlock({
  payload,
  onAsk,
}: {
  payload: HunterActionIntent['payload'];
  onAsk: (msg: string) => void;
}) {
  if (!payload) return null;
  const candidates = (payload.candidates ?? []) as DisambigCandidate[];
  return (
    <div className="mt-3 space-y-2">
      {candidates.map(c => (
        <button
          key={c.city}
          type="button"
          onClick={() => onAsk(c.city)}
          className="w-full text-left rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 transition hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-white">{c.city}</span>
            <span className="text-[10px] font-semibold text-white/35">{c.total} properties</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {c.types.map(t => (
              <span
                key={t.type}
                className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300"
              >
                {formatHouseType(t.type)}: {t.count}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

function TypeOptionsBlock({
  payload,
  onAsk,
}: {
  payload: HunterActionIntent['payload'];
  onAsk: (msg: string) => void;
}) {
  if (!payload) return null;
  const types = (payload.types ?? []) as TypeOption[];
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {types.map(t => (
        <button
          key={t.type}
          type="button"
          onClick={() => onAsk(t.type)}
          className="text-left rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 transition hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
        >
          <p className="font-black text-white">{formatHouseType(t.type)}</p>
          <p className="mt-0.5 text-xs font-semibold text-violet-300">
            KES {t.price_min.toLocaleString()}
            {t.price_max > t.price_min ? ` – ${t.price_max.toLocaleString()}` : ''}
            /mo
          </p>
          <p className="mt-1 text-[10px] font-semibold text-white/35">{t.count} available</p>
        </button>
      ))}
    </div>
  );
}

// ─── Structured cards: room_selection ────────────────────────────────────────

interface RoomSelectionItem {
  index: number;
  uuid?: string | null;
  room_number?: string | null;
  floor?: string | null;
  block?: string | null;
  monthly_rent: number;
  price_label: string;
  status?: string;
  pending_bookings_count: number;
}

interface RoomSelectionCards {
  property_name?: string;
  property_slug?: string;
  total: number;
  items: RoomSelectionItem[];
}

function RoomSelectionBlock({
  cards,
  onAsk,
}: {
  cards: RoomSelectionCards;
  onAsk: (msg: string) => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-white/30">
        {cards.total} available room{cards.total !== 1 ? 's' : ''} — tap to select
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cards.items.map(room => (
          <button
            key={room.uuid ?? room.index}
            type="button"
            onClick={() => onAsk(`#${room.index}`)}
            className="group relative rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] active:scale-[0.97]"
          >
            {room.pending_bookings_count > 0 && (
              <span className="absolute right-2 top-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                {room.pending_bookings_count} pending
              </span>
            )}
            <p className="text-sm font-black text-violet-300">
              {room.room_number ? `Room ${room.room_number}` : `#${room.index}`}
            </p>
            {(room.floor || room.block) && (
              <p className="mt-0.5 text-[10px] font-semibold text-white/35">
                {[room.floor && `Floor ${room.floor}`, room.block && `Block ${room.block}`].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="mt-2 text-sm font-black text-white">{room.price_label}</p>
            <p className="mt-1.5 text-[10px] font-semibold text-white/25 group-hover:text-violet-300 transition-colors">
              Select →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Structured cards: booking_summary ───────────────────────────────────────

interface BookingSummaryCards {
  property?: string;
  slug?: string;
  room?: string;
  room_uuid?: string;
  move_in?: string;
  name?: string;
  email?: string;
  phone?: string;
}

function BookingSummaryCard({
  cards,
  onAsk,
}: {
  cards: BookingSummaryCards;
  onAsk: (msg: string) => void;
}) {
  const rows = [
    { label: 'Property',  value: cards.property },
    { label: 'Room',      value: cards.room ? `Room ${cards.room}` : undefined },
    { label: 'Move-in',   value: cards.move_in
        ? new Date(cards.move_in).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
        : undefined },
    { label: 'Name',      value: cards.name },
    { label: 'Email',     value: cards.email },
    { label: 'Phone',     value: cards.phone },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
      <p className="border-b border-violet-500/15 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-violet-300">
        Booking Summary
      </p>
      <div className="divide-y divide-white/[0.05]">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">{row.label}</span>
            <span className="max-w-[60%] truncate text-right text-[11px] font-black text-white/80">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-violet-500/15 px-4 py-3">
        <button
          type="button"
          onClick={() => onAsk('Yes, confirm')}
          className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-black text-white transition hover:bg-emerald-500"
        >
          ✅ Yes, confirm
        </button>
        <button
          type="button"
          onClick={() => onAsk('No, cancel')}
          className="flex-1 rounded-lg border border-white/[0.08] py-2.5 text-xs font-black text-white/55 transition hover:bg-white/[0.05]"
        >
          ❌ No, cancel
        </button>
      </div>
    </div>
  );
}

// ─── Guided flow: property list ───────────────────────────────────────────────

function PropertyListBlock({
  payload,
  onAsk,
}: {
  payload: HunterActionIntent['payload'];
  onAsk: (msg: string) => void;
}) {
  if (!payload) return null;
  const items = (payload.items ?? []) as PropertyListItem[];
  const hasMore = !!(payload.has_more);
  return (
    <div className="mt-3 space-y-3">
      {items.map(item => {
        const price =
          item.rent_max > item.rent_min
            ? `KES ${item.rent_min.toLocaleString()} – ${item.rent_max.toLocaleString()}/mo`
            : `KES ${item.rent_min.toLocaleString()}/mo`;
        const features = [
          item.water_available && 'Water',
          item.internet_available && 'WiFi',
          item.parking_available && 'Parking',
        ].filter(Boolean) as string[];

        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onAsk(`#${item.rank}`)}
            className="group w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] text-left transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] active:scale-[0.98]"
          >
            {/* Cover image */}
            <div className="relative aspect-[16/9] overflow-hidden bg-[#141421]">
              {item.cover_image ? (
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-semibold text-white/15">No photo</span>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Available units badge — top right */}
              {item.available_units > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur-sm">
                  {item.available_units} available
                </span>
              )}

              {/* Verified badge — top left */}
              {item.verification_status === 'verified' && (
                <span className="absolute left-2 top-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur-sm">
                  ✓ Verified
                </span>
              )}

              {/* Rating — bottom left on image */}
              {item.property_rating != null && item.property_rating > 0 && (
                <span className="absolute bottom-2 left-3 text-[11px] font-black text-amber-300">
                  ★ {item.property_rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="px-4 py-3">
              <p className="truncate font-black text-white leading-tight">{item.title}</p>
              <p className="mt-0.5 text-base font-black text-violet-300">{price}</p>
              {item.neighbourhood && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/35">
                  <span>📍</span>{item.neighbourhood}
                </p>
              )}

              {/* Feature chips */}
              {features.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {features.map(f => (
                    <span
                      key={f}
                      className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-sky-300"
                    >
                      {f}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] font-semibold text-white/25 self-center">
                    Tap to view →
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => onAsk('Show more')}
          className="w-full rounded-xl border border-white/[0.06] py-2.5 text-xs font-semibold text-violet-300 transition hover:border-violet-500/30 hover:text-violet-200"
        >
          Show more properties →
        </button>
      )}
    </div>
  );
}

// ─── New action intent blocks ─────────────────────────────────────────────────

function amenityCategoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (/health|hospital|clinic|medical/.test(c)) return '🏥';
  if (/school|education|university|college/.test(c)) return '🏫';
  if (/transport|bus|transit|matatu|commute/.test(c)) return '🚌';
  if (/police|security/.test(c)) return '🚔';
  if (/shop|mall|market|supermarket|grocery/.test(c)) return '🛍';
  if (/park|garden|recreation|sport/.test(c)) return '🌳';
  if (/restaurant|food|cafe|eating/.test(c)) return '🍽';
  if (/bank|atm|finance/.test(c)) return '🏦';
  if (/church|mosque|temple|worship/.test(c)) return '⛪';
  if (/petrol|fuel|gas/.test(c)) return '⛽';
  return '📍';
}

function AmenitiesMapBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  const amenities = (payload.amenities ?? []) as Array<{
    category: string;
    distance_km?: number;
    distance_fmt?: string;
    walk_minutes?: number;
    maps_link: string;
    source?: 'listing_data' | 'maps_link_only';
  }>;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black text-white/70">
          {payload.property_name as string}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-white/35">Nearby Amenities</p>
      </div>

      {payload.embed_url && (
        <div className="relative aspect-video overflow-hidden">
          <iframe
            src={payload.embed_url as string}
            title="Amenities map"
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {amenities.length > 0 && (
        <div className="grid gap-2 p-3 sm:grid-cols-2">
          {amenities.map((a, i) => (
            <a
              key={i}
              href={a.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-violet-500/30 hover:bg-violet-500/[0.06]"
            >
              <span className="text-xl leading-none">{amenityCategoryIcon(a.category)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white group-hover:text-violet-200">
                  {a.category}
                </p>
                {a.source === 'listing_data' && a.distance_fmt && (
                  <p className="mt-0.5 text-[10px] font-semibold text-white/40">
                    {a.distance_fmt}
                    {a.walk_minutes != null && (
                      <span className="ml-1.5 text-white/30">· {a.walk_minutes} min walk</span>
                    )}
                  </p>
                )}
              </div>
              <ExternalLink size={10} className="shrink-0 text-white/20 group-hover:text-violet-400" />
            </a>
          ))}
        </div>
      )}

      <div className="border-t border-white/[0.06] px-4 py-3">
        <a
          href={payload.maps_url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white transition hover:bg-violet-500"
        >
          <ExternalLink size={12} />
          View All Nearby on Maps
        </a>
      </div>
    </div>
  );
}

/** Shared iframe map card used by view_property_map, view_directions, view_street_view */
function MapIframeCard({
  embedUrl,
  title,
  property,
  city,
  children,
}: {
  embedUrl?: string | null;
  title: string;
  property?: string;
  city?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      {(property || city) && (
        <div className="border-b border-white/[0.06] px-4 py-2.5">
          {property && <p className="text-xs font-black text-white/80">{property}</p>}
          {city && <p className="mt-0.5 text-[11px] font-semibold text-white/35">{city}</p>}
        </div>
      )}
      {embedUrl && (
        <div className="relative aspect-video overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2 px-4 py-3">{children}</div>
    </div>
  );
}

function PropertyMapBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  return (
    <MapIframeCard
      embedUrl={payload.embed_url as string | null}
      title="Property location"
      property={payload.property as string}
      city={payload.city as string}
    >
      <a
        href={payload.maps_url as string}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
      >
        <ExternalLink size={12} />
        Open on Google Maps
      </a>
    </MapIframeCard>
  );
}

function DirectionsBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  return (
    <MapIframeCard
      embedUrl={payload.embed_url as string | null}
      title="Directions map"
      property={payload.property as string}
      city={payload.city as string}
    >
      <a
        href={payload.maps_url as string}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-sky-500"
      >
        🚌 Transit Directions
      </a>
      {payload.walk_url && (
        <a
          href={payload.walk_url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/20"
        >
          🚶 Walking Directions
        </a>
      )}
    </MapIframeCard>
  );
}

function StreetViewBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  return (
    <MapIframeCard
      embedUrl={payload.embed_url as string | null}
      title="Street view"
      property={payload.property as string}
      city={payload.city as string}
    >
      <a
        href={payload.maps_url as string}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
      >
        <ExternalLink size={12} />
        Open Street View
      </a>
    </MapIframeCard>
  );
}

function ListingPricingBlock({
  payload,
  onNavigate,
}: {
  payload: HunterActionIntent['payload'];
  onNavigate: (slug: string) => void;
}) {
  if (!payload) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">Pricing</p>
      </div>
      <div className="space-y-2 px-4 py-3 text-xs font-semibold text-white/55">
        {payload.monthly_rent != null && (
          <p>
            Monthly Rent:{' '}
            <span className="font-black text-violet-300">
              KES {(payload.monthly_rent as number).toLocaleString()}
            </span>
          </p>
        )}
        {payload.deposit != null && (
          <p>
            Deposit:{' '}
            <span className="font-black text-white">
              KES {(payload.deposit as number).toLocaleString()}
            </span>
          </p>
        )}
      </div>
      {payload.listing_slug && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <button
            type="button"
            onClick={() => onNavigate(payload.listing_slug as string)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            View Full Listing
          </button>
        </div>
      )}
    </div>
  );
}

function SafetyMapBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  const features = (payload.security_features ?? []) as string[];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">
          {payload.property_name} — Security
        </p>
      </div>
      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {features.map(f => (
            <span
              key={f}
              className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300"
            >
              <CheckCircle2 size={10} />
              {f}
            </span>
          ))}
        </div>
      )}
      {payload.police_distance != null && (
        <p className="px-4 pb-3 text-xs font-semibold text-white/40">
          Nearest police station:{' '}
          <span className="font-black text-white/70">
            {(payload.police_distance as number).toFixed(1)} km
          </span>
        </p>
      )}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <a
          href={payload.police_maps_link as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-black text-white/70 transition hover:border-sky-500/30 hover:text-sky-300"
        >
          <ExternalLink size={12} />
          Police Station on Maps
        </a>
      </div>
    </div>
  );
}

function NeighbourhoodMapBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  const mapLinks = (payload.map_links ?? {}) as Record<string, string>;
  const entries = Object.entries(mapLinks);
  const streetViewUrl = mapLinks['Street View'];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">
          {payload.area} — Neighbourhood
        </p>
      </div>
      {payload.embed_url && (
        <iframe
          src={payload.embed_url as string}
          title="Neighbourhood map"
          className="h-36 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {entries.map(([label, url]) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              label === 'Street View'
                ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 font-black text-white hover:from-violet-500 hover:to-fuchsia-500'
                : 'border border-white/[0.08] bg-white/[0.04] text-white/60 hover:border-violet-500/30 hover:text-violet-300'
            }`}
          >
            {label === 'Street View' ? null : <ExternalLink size={10} />}
            {label}
          </a>
        ))}
        {!streetViewUrl && (
          <p className="text-xs text-white/30">No Street View link available</p>
        )}
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { emoji: string; label: string; cls: string }> = {
  available:    { emoji: '✅', label: 'Available',    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  occupied:     { emoji: '❌', label: 'Occupied',     cls: 'border-red-500/30 bg-red-500/10 text-red-300' },
  maintenance:  { emoji: '🔧', label: 'Maintenance',  cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
};

function AvailabilityBlock({
  payload,
  onNavigate,
}: {
  payload: HunterActionIntent['payload'];
  onNavigate: (slug: string) => void;
}) {
  if (!payload) return null;
  const status = (payload.status as string) ?? 'unknown';
  const cfg = STATUS_CONFIG[status] ?? { emoji: 'ℹ️', label: status, cls: 'border-white/[0.08] bg-white/[0.04] text-white/60' };
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">Availability</p>
      </div>
      <div className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${cfg.cls}`}>
          {cfg.emoji} {cfg.label}
        </span>
        {payload.available_from && (
          <p className="mt-2 text-xs font-semibold text-white/50">
            Available from:{' '}
            <span className="font-black text-white">
              {new Date(payload.available_from as string).toLocaleDateString('en-KE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </p>
        )}
      </div>
      {payload.listing_slug && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <button
            type="button"
            onClick={() => onNavigate(payload.listing_slug as string)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            View Listing
          </button>
        </div>
      )}
    </div>
  );
}

interface SimilarListing {
  uuid: string;
  slug: string;
  title: string;
  price: number;
  area: string;
  bedrooms: number;
}

function CompareListingsBlock({
  payload,
  onAsk,
}: {
  payload: HunterActionIntent['payload'];
  onAsk: (msg: string, listingUuid?: string | null) => void;
}) {
  if (!payload) return null;
  const items = (payload.similar_listings ?? []) as SimilarListing[];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">Similar Properties</p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 py-3 pb-4">
        {items.map(item => (
          <button
            key={item.uuid}
            type="button"
            onClick={() => onAsk('Tell me about this property', item.uuid)}
            className="group w-44 shrink-0 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 text-left transition hover:border-violet-500/40 hover:bg-white/[0.07]"
          >
            <p className="line-clamp-2 text-xs font-black text-white group-hover:text-violet-200">
              {item.title}
            </p>
            <p className="mt-1 text-sm font-black text-violet-300">
              KES {item.price.toLocaleString()}
              <span className="text-[10px] font-semibold text-white/30">/mo</span>
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-white/40">
              <span className="flex items-center gap-0.5">
                <MapPin size={8} />
                {item.area}
              </span>
              <span className="flex items-center gap-0.5">
                <BedDouble size={8} />
                {item.bedrooms} bd
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const RISK_CONFIG: Record<string, { emoji: string; cls: string }> = {
  LOW:    { emoji: '🟢', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  MEDIUM: { emoji: '🟡', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  HIGH:   { emoji: '🔴', cls: 'border-red-500/30 bg-red-500/10 text-red-300' },
};

function VerificationBlock({ payload }: { payload: HunterActionIntent['payload'] }) {
  if (!payload) return null;
  const level = (payload.risk_level as string) ?? 'MEDIUM';
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.MEDIUM;
  const positives = (payload.positives ?? []) as string[];
  const redFlags = (payload.red_flags ?? []) as string[];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wider text-white/30">Scam Check</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${cfg.cls}`}>
          {cfg.emoji} {level} RISK
        </span>
      </div>
      {positives.length > 0 && (
        <div className="px-4 pt-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/25">Positives</p>
          <ul className="space-y-1">
            {positives.map(p => (
              <li key={p} className="flex items-start gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 size={11} className="mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {redFlags.length > 0 && (
        <div className="px-4 py-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/25">Red Flags</p>
          <ul className="space-y-1">
            {redFlags.map(f => (
              <li key={f} className="flex items-start gap-2 text-xs font-semibold text-amber-300">
                <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
      {redFlags.length === 0 && positives.length === 0 && (
        <p className="px-4 py-3 text-xs text-white/30">No details available.</p>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function HunterMessageBubble({
  msg,
  onAsk,
  onNavigate,
  onSubmitBooking,
  compareIds,
  onCompareToggle,
}: {
  msg: HunterMessage;
  onAsk: (text: string, listingUuid?: string | null) => void;
  onNavigate: (slug: string) => void;
  onSubmitBooking: (intent: HunterActionIntent) => void;
  compareIds: string[];
  onCompareToggle: (id: string) => void;
}) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white sm:max-w-[70%]">
          {msg.text}
        </div>
      </div>
    );
  }

  // Loading bubble
  if (msg.isLoading) {
    return (
      <div className="flex gap-3">
        <AIThinkingOrb size="sm" thinking />
        <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.04] px-4 py-3">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const intent = msg.actionIntent;

  return (
    <div className="flex gap-3">
      <div className="shrink-0 pt-1">
        <AIThinkingOrb size="sm" />
      </div>

      <div className="min-w-0 flex-1">
        {/* Text */}
        <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm font-medium leading-6 text-white/80">
          {renderText(msg.text)}
        </div>

        {/* Expanded search notice */}
        {msg.searchInfo?.expanded && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
            <MapPin size={12} />
            No results in {msg.searchInfo.city} — showing results from{' '}
            <strong className="font-black">{msg.searchInfo.expanded_to}</strong>
          </div>
        )}


        {/* Room match cards (from chat listings) */}
        {msg.listings && msg.listings.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-white/30">
              {msg.listings.length} Room{msg.listings.length !== 1 ? 's' : ''} Found
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {msg.listings.map(result => (
                <HunterMatchCard
                  key={result.room.id}
                  result={result}
                  checked={compareIds.includes(result.room.id)}
                  compareDisabled={compareIds.length >= 4 && !compareIds.includes(result.room.id)}
                  onCompareToggle={onCompareToggle}
                  onAsk={onAsk}
                />
              ))}
            </div>
          </div>
        )}

        {/* Property detail card */}
        {msg.property && (
          <HunterPropertyCard property={msg.property as HunterProperty} onAsk={onAsk} />
        )}

        {/* Media gallery (images + videos) */}
        {msg.media && msg.media.length > 0 && (
          <AIMediaGallery media={msg.media as AIMediaItem[]} />
        )}

        {/* Direct match results (from /hunter/match filter form) */}
        {msg.matches && msg.matches.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-white/30">
              {msg.matches.length} AI Match{msg.matches.length !== 1 ? 'es' : ''}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {msg.matches.map(result => (
                <HunterMatchCard
                  key={result.room.id}
                  result={result}
                  checked={compareIds.includes(result.room.id)}
                  compareDisabled={compareIds.length >= 4 && !compareIds.includes(result.room.id)}
                  onCompareToggle={onCompareToggle}
                  onAsk={onAsk}
                />
              ))}
            </div>
          </div>
        )}

        {/* Charts / visuals */}
        {msg.visuals && msg.visuals.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {msg.visuals.map((visual, i) => (
              <HunterChartBlock key={i} visual={visual} />
            ))}
          </div>
        )}

        {/* Action intent UI */}
        {intent && (
          <>
            {intent.type === 'town_options' && (
              <TownOptionsBlock payload={intent.payload} onAsk={onAsk} />
            )}
            {intent.type === 'type_options' && (
              <TypeOptionsBlock payload={intent.payload} onAsk={onAsk} />
            )}
            {intent.type === 'property_list' && (
              <PropertyListBlock payload={intent.payload} onAsk={onAsk} />
            )}
            {intent.type === 'property_actions' && intent.actions && (
              <PropertyActionsBlock actions={intent.actions} onAsk={onAsk} />
            )}
            {intent.type === 'date_input' && (
              <DatePickerBlock intent={intent} onConfirm={date => onAsk(date)} />
            )}
            {intent.type === 'booking_confirm' && !msg.cards && (
              <BookingConfirmBlock intent={intent} onAsk={onAsk} />
            )}
            {intent.type === 'submit_booking' && (
              <SubmitBookingBlock intent={intent} onSubmit={onSubmitBooking} />
            )}
            {intent.type === 'view_amenities_map' && (
              <AmenitiesMapBlock payload={intent.payload} />
            )}
            {intent.type === 'view_listing_pricing' && (
              <ListingPricingBlock payload={intent.payload} onNavigate={onNavigate} />
            )}
            {intent.type === 'view_safety_map' && (
              <SafetyMapBlock payload={intent.payload} />
            )}
            {intent.type === 'explore_neighbourhood' && (
              <NeighbourhoodMapBlock payload={intent.payload} />
            )}
            {intent.type === 'enquire_availability' && (
              <AvailabilityBlock payload={intent.payload} onNavigate={onNavigate} />
            )}
            {intent.type === 'compare_listings' && (
              <CompareListingsBlock payload={intent.payload} onAsk={onAsk} />
            )}
            {intent.type === 'view_listing_verification' && (
              <VerificationBlock payload={intent.payload} />
            )}
            {intent.type === 'view_property_map' && (
              <PropertyMapBlock payload={intent.payload} />
            )}
            {intent.type === 'view_directions' && (
              <DirectionsBlock payload={intent.payload} />
            )}
            {intent.type === 'view_street_view' && (
              <StreetViewBlock payload={intent.payload} />
            )}
          </>
        )}

        {/* Structured cards: room_selection */}
        {msg.responseType === 'room_selection' && msg.cards && (
          <RoomSelectionBlock
            cards={msg.cards as unknown as RoomSelectionCards}
            onAsk={onAsk}
          />
        )}

        {/* Structured cards: booking_summary — preferred over BookingConfirmBlock */}
        {msg.responseType === 'booking_summary' && msg.cards && (
          <BookingSummaryCard
            cards={msg.cards as BookingSummaryCards}
            onAsk={onAsk}
          />
        )}

        {/* Town/area map embed */}
        {msg.mapData && (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
            {msg.mapData.embed_url && (
              <iframe
                src={msg.mapData.embed_url}
                title={msg.mapData.label ?? `Map of ${msg.mapData.place}`}
                className="h-48 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            <div className="flex items-center justify-between bg-white/[0.04] px-3 py-2">
              <span className="text-xs font-medium text-white/60">
                {msg.mapData.label ?? `Map of ${msg.mapData.place}`}
              </span>
              <a
                href={msg.mapData.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                Open in Maps ↗
              </a>
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onAsk(s)}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/65 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AMENITY_OPTIONS = ['Parking', 'WiFi', 'Generator', 'Water', 'Security', 'Gym'];

export default function HunterPage() {
  const navigate = useNavigate();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [stage, setStage] = useState<HunterStage>('NEED_LOCATION');
  const [preferences, setPreferences] = useState<Record<string, unknown>>({});
  const [messages, setMessages] = useState<HunterMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<HunterCompareData | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  // Filter panel state
  const [showFilters, setShowFilters] = useState(false);
  const [filterBudgetMin, setFilterBudgetMin] = useState('');
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  const isBusy = thinking || typing || sessionLoading || matchLoading;

  const typingCleanupRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '48px';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  useEffect(() => () => { typingCleanupRef.current?.(); }, []);

  // ── Typing ───────────────────────────────────────────────────────────────────

  const beginTyping = useCallback(
    (id: string, text: string, extras: Partial<HunterMessage> = {}) => {
      typingCleanupRef.current?.();
      typingCleanupRef.current = null;

      setMessages(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, ...extras, text: '', isLoading: false, fullyRevealed: false }
            : m,
        ),
      );

      setTyping(true);
      typingCleanupRef.current = typeWords(
        text,
        TYPING_SPEED_MS,
        partial =>
          setMessages(prev =>
            prev.map(m => (m.id === id ? { ...m, text: partial } : m)),
          ),
        () => {
          typingCleanupRef.current = null;
          setTyping(false);
          setMessages(prev =>
            prev.map(m => (m.id === id ? { ...m, fullyRevealed: true } : m)),
          );
        },
      );
    },
    [],
  );

  // ── Session ──────────────────────────────────────────────────────────────────

  const applySession = useCallback(
    (data: Awaited<ReturnType<typeof hunterApi.session>>['data']) => {
      storeHunterSession(data.session_token);
      setSessionToken(data.session_token);
      setStage(data.stage);
      setPreferences(data.preferences ?? {});
    },
    [],
  );

  const initSession = useCallback(async (token?: string | null) => {
    setSessionLoading(true);
    try {
      const res = await hunterApi.session(token);
      const data = res.data;
      applySession(data);

      const hasPrefs = Object.keys(data.preferences ?? {}).length > 0;
      const greetingText =
        data.greeting ??
        (hasPrefs
          ? `Welcome back! 👋 Ready to continue your search?`
          : `Hey! 👋 I'm StayLynk AI, your Kenya house-hunting assistant. Which town or city are you searching in? I'll find you the best available rentals right away.`);

      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: greetingText,
          stage: data.stage,
          suggestions: data.suggestions ?? [
            'Nairobi',
            'Mombasa',
            'Kisumu',
            'Nakuru',
          ],
          fullyRevealed: true,
        },
      ]);
    } catch {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `Hey! 👋 I'm StayLynk AI, your Kenya house-hunting assistant. Which town or city are you searching in?`,
          stage: 'NEED_LOCATION',
          suggestions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
          fullyRevealed: true,
        },
      ]);
    } finally {
      setSessionLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    void initSession(getStoredHunterSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewSession = async () => {
    typingCleanupRef.current?.();
    typingCleanupRef.current = null;
    setTyping(false);
    clearHunterSession();
    setMessages([]);
    setInput('');
    setStage('NEED_LOCATION');
    setPreferences({});
    await initSession(null);
  };

  // ── Ask ──────────────────────────────────────────────────────────────────────

  /** Inner chat call with one-retry on 401 / session_expired. */
  const doChat = useCallback(
    async (loadingId: string, text: string, token: string, retried: boolean, listingUuid?: string | null) => {
      try {
        const res = await hunterApi.chat(token, text, listingUuid ? { selected_listing_uuid: listingUuid } : undefined);

        // session_expired in the body (Axios returns 200 with this flag)
        if (res.session_expired && !retried) {
          clearHunterSession();
          const newRes = await hunterApi.session(null);
          const newToken = newRes.data.session_token;
          storeHunterSession(newToken);
          setSessionToken(newToken);
          return doChat(loadingId, text, newToken, true, listingUuid);
        }

        const data = res.data;
        storeHunterSession(data.session_token);
        setSessionToken(data.session_token);
        if (data.stage) setStage(data.stage);

        beginTyping(loadingId, data.message, {
          stage: data.stage,
          suggestions: data.suggestions ?? [],
          actionIntent: data.action_intent ?? null,
          listings: data.listings,
          property: data.property,
          pagination: data.pagination,
          searchInfo: data.search_info,
          media: data.media,
          matches: data.matches,
          visuals: data.visuals,
          confidenceScore: data.confidence ?? null,
          responseType: data.response_type ?? null,
          cards: data.cards ?? null,
          mapData: data.map_data ?? null,
        });

        // If the backend returned property_actions but no property data, fetch it.
        const propSlug =
          data.action_intent?.booking_slug ??
          (data.action_intent?.payload?.listing_slug as string | undefined);
        if (
          data.action_intent?.type === 'property_actions' &&
          propSlug &&
          !data.property
        ) {
          hunterApi.property(propSlug, data.session_token).then(propRes => {
            setMessages(prev =>
              prev.map(m =>
                m.id === loadingId && !m.property ? { ...m, property: propRes.data } : m,
              ),
            );
          }).catch(() => { /* property detail unavailable — leave as-is */ });
        }
      } catch (err) {
        const status = (err as { status?: number }).status;

        // 401 — session expired on the server, auto-renew once
        if (status === 401 && !retried) {
          clearHunterSession();
          try {
            const newRes = await hunterApi.session(null);
            const newToken = newRes.data.session_token;
            storeHunterSession(newToken);
            setSessionToken(newToken);
            return doChat(loadingId, text, newToken, true, listingUuid);
          } catch {
            // session renewal failed — fall through to error
          }
        }

        const errorMsg =
          status === 429
            ? "You're sending messages too quickly. Please wait a moment before trying again."
            : status === 422
              ? "I couldn't process that. Try rephrasing your message."
              : status === 0 || status == null
                ? "Connection lost. Your conversation is saved — just try again."
                : 'Something went wrong. Please try again.';

        beginTyping(loadingId, errorMsg, {
          suggestions: status === 429 ? [] : ['Try again'],
        });
      } finally {
        setThinking(false);
      }
    },
    [beginTyping],
  );

  const ask = useCallback(
    async (text: string, listingUuid?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy || !sessionToken) return;

      const loadingId = crypto.randomUUID();
      typingCleanupRef.current?.();
      typingCleanupRef.current = null;
      setTyping(false);
      setInput('');

      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: trimmed, fullyRevealed: true },
        { id: loadingId, role: 'assistant', text: '', isLoading: true },
      ]);
      setThinking(true);

      await doChat(loadingId, trimmed, sessionToken, false, listingUuid);
    },
    [isBusy, sessionToken, doChat],
  );

  // ── Submit booking ───────────────────────────────────────────────────────────

  const handleSubmitBooking = useCallback(
    async (intent: HunterActionIntent) => {
      if (!intent.payload) return;

      const loadingId = crypto.randomUUID();
      setMessages(prev => [
        ...prev,
        { id: loadingId, role: 'assistant', text: '', isLoading: true },
      ]);
      setThinking(true);

      const doBook = async (token: string, retried: boolean) => {
        try {
          const res = await hunterApi.book({
            session_token: token,
            slug: intent.payload!.slug,
            move_in_date: intent.payload!.move_in_date,
            name: intent.payload!.name,
            email: intent.payload!.email,
            phone: intent.payload!.phone,
          });
          const data = res.data;
          const successMsg = intent.success_message
            ? `${intent.success_message}\n\nReference: **${data.reference}** · Move-in: **${data.move_in_date}**`
            : `✅ Booking submitted! Reference: **${data.reference}**\n\n` +
              `Room **${data.room}** is reserved for **${data.move_in_date}**. ` +
              `You'll receive a confirmation email when the property manager reviews your request.`;
          beginTyping(loadingId, successMsg, {
            suggestions: ['Show more properties', 'Start a new search'],
          });
        } catch (err) {
          const status = (err as { status?: number })?.status;
          if (status === 401 && !retried) {
            clearHunterSession();
            try {
              const newRes = await hunterApi.session(null);
              const newToken = newRes.data.session_token;
              storeHunterSession(newToken);
              setSessionToken(newToken);
              return doBook(newToken, true);
            } catch { /* fall through */ }
          }
          const msg =
            status === 409
              ? 'You already have a pending booking for this property.'
              : status === 429
                ? 'Too many booking requests. Please try again in an hour.'
                : 'Booking failed. Please try again.';
          beginTyping(loadingId, msg, { suggestions: ['Try again', 'Show more properties'] });
        } finally {
          setThinking(false);
        }
      };

      let token = sessionToken;
      if (!token) {
        const newRes = await hunterApi.session(null);
        token = newRes.data.session_token;
        storeHunterSession(token);
        setSessionToken(token);
      }
      await doBook(token, false);
    },
    [sessionToken, beginTyping],
  );

  // ── Compare ───────────────────────────────────────────────────────────────────

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const handleCompare = async () => {
    if (compareIds.length < 2 || compareLoading) return;
    setCompareLoading(true);
    try {
      const res = await hunterApi.compare(compareIds);
      setCompareData(res.data);
      setCompareOpen(true);
    } catch {
      // silently fail — user can retry
    } finally {
      setCompareLoading(false);
    }
  };

  // ── Match search (filter form) ────────────────────────────────────────────────

  const handleMatchSearch = useCallback(async () => {
    if (!sessionToken || matchLoading) return;
    setMatchLoading(true);
    setShowFilters(false);

    const loadingId = crypto.randomUUID();
    setMessages(prev => [
      ...prev,
      { id: loadingId, role: 'assistant', text: '', isLoading: true },
    ]);

    try {
      const params = {
        budget_min: filterBudgetMin ? Number(filterBudgetMin) : undefined,
        budget_max: (preferences.budget_max as number) || undefined,
        location: (preferences.city as string) || undefined,
        type: (preferences.house_type as string) || undefined,
        amenities: filterAmenities.length ? filterAmenities : undefined,
        bedrooms: (preferences.bedrooms as number) || undefined,
      };
      const res = await hunterApi.match(params);
      const data = res.data;
      beginTyping(
        loadingId,
        data.text || `Found ${data.matches.length} matching properties`,
        {
          matches: data.matches,
          visuals: data.visuals,
          confidenceScore: data.confidence,
          fullyRevealed: false,
        },
      );
    } catch {
      beginTyping(loadingId, 'Could not fetch matches. Please try again.', {
        suggestions: ['Try again'],
      });
    } finally {
      setMatchLoading(false);
    }
  }, [sessionToken, matchLoading, filterBudgetMin, filterAmenities, preferences, beginTyping]);

  // ── Input handlers ────────────────────────────────────────────────────────────

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void ask(input);
    }
  };

  const stageIndex = STAGE_ORDER.indexOf(stage);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100dvh-4rem)] bg-[#09090f] text-white">
      <Seo
        title="StayLynk Hunter — Guided House Search"
        description="Get step-by-step AI guidance to find your ideal rental in Kenya. Just describe what you need."
        canonicalPath="/hunter"
      />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d14] lg:flex">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/40 transition hover:text-white/70"
            aria-label="Back to home"
          >
            <ArrowLeft size={15} />
          </Link>
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-sm font-black text-transparent">
            Hunter AI
          </span>
        </div>

        {/* New search */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => void startNewSession()}
            disabled={sessionLoading}
            className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm font-black text-white/60 transition hover:border-violet-500/30 hover:bg-violet-500/[0.07] hover:text-white disabled:opacity-40"
          >
            <PenSquare size={14} />
            New Search
          </button>
        </div>

        <div className="mx-3 border-t border-white/[0.05]" />

        {/* Stage progress */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-wider text-white/25">
            Progress
          </p>
          <div className="space-y-1">
            {STAGE_ORDER.slice(0, 8).map((s, i) => (
              <div
                key={s}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 ${
                  i < stageIndex
                    ? 'text-emerald-400'
                    : i === stageIndex
                      ? 'bg-violet-500/15 text-white'
                      : 'text-white/20'
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < stageIndex
                      ? 'bg-emerald-400'
                      : i === stageIndex
                        ? 'bg-violet-400'
                        : 'bg-white/15'
                  }`}
                />
                <span className="text-xs font-semibold">{STAGE_LABELS[s]}</span>
              </div>
            ))}
          </div>

          {/* Preferences summary */}
          {Object.keys(preferences).length > 0 && (
            <div className="mt-5">
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-white/25">
                Your Preferences
              </p>
              <div className="space-y-1 px-1">
                {(preferences.city as string) && (
                  <PrefChip label="City" value={preferences.city as string} />
                )}
                {(preferences.neighbourhood as string) && (
                  <PrefChip label="Area" value={preferences.neighbourhood as string} />
                )}
                {(preferences.house_type as string) && (
                  <PrefChip label="Type" value={preferences.house_type as string} />
                )}
                {(preferences.budget_max as number) && (
                  <PrefChip
                    label="Budget"
                    value={`KES ${(preferences.budget_max as number).toLocaleString()}`}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-3 py-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <p className="text-[11px] font-semibold text-white/35">
              Your data is private &amp; secure
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-black text-white/40 transition hover:text-white/70 lg:hidden"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                sessionLoading || thinking
                  ? 'animate-pulse bg-amber-400'
                  : typing
                    ? 'animate-pulse bg-violet-400'
                    : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-semibold text-white/35">
              {sessionLoading
                ? 'Connecting…'
                : thinking
                  ? 'Searching…'
                  : typing
                    ? 'Typing…'
                    : (STAGE_LABELS[stage] ?? 'House Hunter AI')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void startNewSession()}
            disabled={sessionLoading}
            className="rounded-xl p-2 text-white/30 transition hover:bg-white/[0.07] hover:text-white/70 disabled:opacity-40"
            title="New search"
            aria-label="Start new search"
          >
            <PenSquare size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 && !sessionLoading ? (
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
              <AIThinkingOrb size="lg" thinking />
              <motion.h1
                className="mt-5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-3xl font-black text-transparent dark:from-violet-300 dark:via-fuchsia-200 dark:to-violet-300 sm:text-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Hunter AI
              </motion.h1>
              <motion.p
                className="mt-3 max-w-xs text-sm font-medium text-white/40"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                I'll guide you step by step to find the perfect home in Kenya.
              </motion.p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
              {messages.map(msg => (
                <HunterMessageBubble
                  key={msg.id}
                  msg={msg}
                  onAsk={(text, uuid) => void ask(text, uuid)}
                  onNavigate={slug => navigate(`/listing/${slug}`)}
                  onSubmitBooking={handleSubmitBooking}
                  compareIds={compareIds}
                  onCompareToggle={toggleCompare}
                />
              ))}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-white/[0.06] bg-[#0d0d14] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {/* Filter panel */}
          {showFilters && (
            <div className="mx-auto mb-3 max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-white/30">
                  AI Match Filters
                </p>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-[10px] font-black text-white/30 hover:text-white/60"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Budget min */}
              <div className="mb-2.5">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-white/30">
                  Budget Min (KES/mo)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={filterBudgetMin}
                  onChange={e => setFilterBudgetMin(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/25 [appearance:textfield] focus:border-violet-500/40"
                />
              </div>

              {/* Amenities */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/30">
                  Must-have amenities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITY_OPTIONS.map(a => {
                    const active = filterAmenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() =>
                          setFilterAmenities(prev =>
                            active ? prev.filter(x => x !== a) : [...prev, a],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          active
                            ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                            : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-violet-500/30 hover:text-violet-300'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleMatchSearch()}
                className="w-full rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 py-2.5 text-xs font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40"
              >
                {matchLoading ? 'Searching…' : 'Find AI Matches'}
              </button>
            </div>
          )}

          {/* Latest suggestions above input */}
          {(() => {
            const latest = [...messages].reverse().find(m => m.role === 'assistant' && !m.isLoading);
            const chips = latest?.suggestions;
            if (!chips?.length) return null;
            return (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {chips.slice(0, 5).map(s => (
                  <button
                    key={s}
                    type="button"
                    disabled={isBusy}
                    onClick={() => void ask(s)}
                    className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            );
          })()}

          <form
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-2.5"
            onSubmit={handleSubmit}
          >
            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                showFilters
                  ? 'border-violet-500/40 bg-violet-500/15 text-violet-400'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-violet-500/30 hover:text-violet-400'
              }`}
              aria-label="Toggle match filters"
              title="AI match filters"
            >
              {showFilters ? <ChevronUp size={15} /> : <SlidersHorizontal size={15} />}
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 1000))}
              onKeyDown={handleKeyDown}
              placeholder={
                sessionLoading
                  ? 'Connecting…'
                  : 'Type your answer or pick a suggestion above…'
              }
              disabled={sessionLoading}
              rows={1}
              maxLength={1000}
              className="min-h-[48px] min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-base font-semibold leading-6 text-white outline-none placeholder:text-white/30 disabled:opacity-40"
              aria-label="Chat with Hunter AI"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40"
              aria-label="Send"
            >
              {isBusy ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            </button>
          </form>
        </div>
      </div>

      {/* Floating compare button */}
      {compareIds.length >= 2 && (
        <motion.div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <button
            type="button"
            onClick={() => void handleCompare()}
            disabled={compareLoading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-violet-900/50 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60"
          >
            {compareLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <GitCompare size={15} />
            )}
            Compare {compareIds.length} Selected
          </button>
        </motion.div>
      )}

      {/* Compare panel */}
      <HunterComparePanel
        open={compareOpen}
        data={compareData}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function PrefChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="font-semibold text-white/30">{label}</span>
      <span className="font-black text-white/70">{value}</span>
    </div>
  );
}

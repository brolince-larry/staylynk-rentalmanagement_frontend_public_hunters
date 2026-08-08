import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BedDouble, Car, CheckCircle, ChevronRight,
  ExternalLink, Heart, Loader2, MapPin, MessageCircle,
  Navigation, Send, ShieldCheck, Star, Wifi, Droplets,
  X, Zap,
} from 'lucide-react';
import { publicAIChat, typeWords } from '../services/aiChat';
import {
  getStoredAiSessionToken,
  storeAiSessionToken,
  createPublicAISession,
} from '../services/aiSession';
import { hunterApi } from '../api/hunterApi';
import { normalizePublicImageUrl } from '../services/media/cdnService';
import type { AIActionIntent } from '../types';

// ─── Local types ─────────────────────────────────────────────────────────────

interface MapData {
  lat?: number | null;
  lng?: number | null;
  zoom?: number;
  title?: string;
  address?: string;
  search_url?: string;
  directions_url?: string;
}

interface PropertyCardItem {
  slug: string;
  title: string;
  house_types?: string[];
  rent_min: number;
  rent_max?: number;
  city?: string;
  neighbourhood?: string;
  cover_image?: string | null;
  available_units?: number;
  rating?: number;
  is_verified?: boolean;
  amenities?: string[];
  rank: number;
}

interface PropertyCardsData {
  total: number;
  showing: number;
  has_more: boolean;
  page: number;
  city: string;
  type_label: string;
  items: PropertyCardItem[];
}

interface RoomItem {
  index: number;
  uuid?: string;
  room_number?: string;
  floor?: string;
  block?: string;
  monthly_rent?: number;
  price_label: string;
  status?: string;
  pending_bookings_count?: number;
}

interface RoomSelectionData {
  property_name?: string;
  total: number;
  items: RoomItem[];
}

interface BookingSummaryData {
  property?: string;
  room?: string;
  move_in?: string;
  name?: string;
  email?: string;
  phone?: string;
  slug?: string;
  room_uuid?: string;
}

interface FindMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isLoading?: boolean;
  fullyRevealed?: boolean;
  responseType?: string | null;
  cards?: Record<string, unknown> | null;
  mapData?: MapData | null;
  suggestions?: string[];
  actionIntent?: Record<string, unknown> | null;
  whatsAppUrl?: string | null;
}

const FILTER_CHIPS = [
  'Cheapest', 'Nearest', 'WiFi', 'Parking', 'Furnished',
  'Security', 'Water', 'Pet Friendly',
];

const TYPING_SPEED_MS = 28;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FindPage() {
  const [messages, setMessages] = useState<FindMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingCleanupRef = useRef<(() => void) | null>(null);

  // ── Scroll to bottom on each new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // ── Session init + greeting
  useEffect(() => {
    const init = async () => {
      const existing = getStoredAiSessionToken();
      if (existing) {
        setSessionToken(existing);
        setMessages([{
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Welcome back! Tell me where you\'re searching or what type of place you need.',
          fullyRevealed: true,
          suggestions: ['Bedsitter Nairobi', 'Single room Kirinyaga', 'Apartment Mombasa'],
        }]);
        return;
      }
      try {
        const res = await createPublicAISession();
        const token = (res as unknown as { session_token?: string }).session_token ?? crypto.randomUUID();
        storeAiSessionToken(token);
        setSessionToken(token);
        const greeting = (res as unknown as { greeting?: string }).greeting
          ?? "Hey! I'm StayLynk AI. Tell me which town you're searching in and what kind of place you need.";
        const suggestions: string[] = (res as unknown as { suggestions?: string[] }).suggestions
          ?? ['Nairobi', 'Mombasa', 'Kisumu', 'Kirinyaga'];
        setMessages([{
          id: crypto.randomUUID(),
          role: 'assistant',
          text: greeting,
          fullyRevealed: true,
          suggestions,
        }]);
      } catch {
        setMessages([{
          id: crypto.randomUUID(),
          role: 'assistant',
          text: "Hey! I'm StayLynk AI. Tell me which town you're searching in and what kind of place you need.",
          fullyRevealed: true,
          suggestions: ['Nairobi', 'Mombasa', 'Kisumu', 'Kirinyaga'],
        }]);
      }
    };
    void init();
  }, []);

  // ── Typing animation helper
  const beginTyping = useCallback(
    (msgId: string, text: string, extras: Partial<FindMessage> = {}) => {
      typingCleanupRef.current?.();
      typingCleanupRef.current = null;

      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, ...extras, text: '', isLoading: false, fullyRevealed: false } : m),
      );

      setTyping(true);
      typingCleanupRef.current = typeWords(
        text,
        TYPING_SPEED_MS,
        partial => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: partial } : m)),
        () => {
          typingCleanupRef.current = null;
          setTyping(false);
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, fullyRevealed: true } : m));
        },
      );
    },
    [],
  );

  // ── Core send function
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing || disabled) return;

    setInput('');
    inputRef.current?.focus();

    const userMsgId = crypto.randomUUID();
    const loadingId = crypto.randomUUID();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: trimmed, fullyRevealed: true },
      { id: loadingId, role: 'assistant', text: '', isLoading: true },
    ]);

    try {
      let token = sessionToken ?? getStoredAiSessionToken();
      if (!token) {
        const res = await createPublicAISession();
        token = (res as unknown as { session_token?: string }).session_token ?? crypto.randomUUID();
        storeAiSessionToken(token);
        setSessionToken(token);
      }

      const res = await publicAIChat(trimmed, token);
      const data = res.data;

      const freshToken = data.session_token;
      if (freshToken) {
        storeAiSessionToken(freshToken);
        setSessionToken(freshToken);
      }

      const responseType = data.response_type ?? null;
      const cards = data.cards ?? null;
      const mapData = (data.map_data as MapData | undefined) ?? null;
      const actionIntent = (data.action_intent as Record<string, unknown> | undefined) ?? null;
      const suggestions = data.suggestions ?? [];

      // booking_summary
      if (responseType === 'booking_summary' && cards) {
        beginTyping(loadingId, data.message || 'Please review your booking details.', {
          responseType, cards, suggestions, actionIntent, mapData,
        });
        return;
      }

      // room_selection
      if (responseType === 'room_selection' && cards) {
        beginTyping(loadingId, data.message || 'Please select a room.', {
          responseType, cards, suggestions,
        });
        return;
      }

      // submit_booking
      if (actionIntent && (actionIntent as { type?: string }).type === 'submit_booking') {
        beginTyping(loadingId, data.message || 'Your booking is ready to submit.', {
          responseType: 'booking_submit', actionIntent, suggestions,
        });
        return;
      }

      // property_cards (from property_list action_intent OR response_type)
      if (
        responseType === 'property_cards' ||
        (actionIntent && (actionIntent as { type?: string }).type === 'property_list')
      ) {
        const cardsData = cards ?? (actionIntent as Record<string, unknown>)?.payload;
        if (cardsData) {
          beginTyping(loadingId, data.message || 'Here are the matching properties.', {
            responseType: 'property_cards', cards: cardsData as Record<string, unknown>,
            suggestions, mapData,
          });
          return;
        }
      }

      // property_detail
      if (responseType === 'property_detail' && cards) {
        // extract whatsapp/maps from cards
        const wa = (cards.whatsapp_url as string | undefined) ?? null;
        beginTyping(loadingId, data.message || 'Here are the property details.', {
          responseType: 'property_detail', cards, suggestions, mapData, whatsAppUrl: wa,
        });
        return;
      }

      // map intents
      if (actionIntent) {
        const act = actionIntent as { type?: string; url?: string; payload?: Record<string, unknown> };
        const mapsUrl = act.url ?? act.payload?.maps_url as string | undefined;
        const mapTypes = ['view_property_map', 'view_directions', 'view_street_view'];
        if (mapsUrl && (mapTypes.includes(act.type ?? '') || act.type === 'open_url')) {
          const isWa = /wa\.me|whatsapp\.com/i.test(mapsUrl);
          beginTyping(loadingId, data.message || "Here's the location.", {
            mapData: isWa ? null : { search_url: mapsUrl, directions_url: mapsUrl },
            whatsAppUrl: isWa ? mapsUrl : null,
            suggestions,
          });
          return;
        }
      }

      // fallback — plain conversational reply
      beginTyping(loadingId, data.message || "I'm still learning about this. Could you give me more detail?", {
        suggestions,
      });
    } catch {
      setTyping(false);
      setMessages(prev =>
        prev.map(m => m.id === loadingId
          ? { ...m, text: 'Something went wrong. Please try again.', isLoading: false, fullyRevealed: true }
          : m,
        ),
      );
    }
  }, [sessionToken, typing, disabled, beginTyping]);

  // ── Booking submit handler
  const handleBookingSubmit = useCallback(async (actionIntent: Record<string, unknown>) => {
    const payload = actionIntent.payload as Record<string, unknown> | undefined;
    if (!payload?.slug) throw new Error('Missing booking data');
    const token = sessionToken ?? getStoredAiSessionToken();
    if (!token) throw new Error('No session');

    await hunterApi.book({
      session_token: token,
      slug:          payload.slug as string,
      move_in_date:  payload.move_in_date as string,
      name:          payload.name as string,
      email:         payload.email as string,
      phone:         payload.phone as string,
      room_uuid:     payload.room_uuid as string | undefined,
    });

    setMessages(prev => [
      ...prev,
      {
        id:            crypto.randomUUID(),
        role:          'assistant' as const,
        text:          (actionIntent.success_message as string) ?? "✅ Booking submitted! The property manager will contact you shortly.",
        fullyRevealed: true,
        suggestions:   ['Find more properties', 'Start over'],
      },
    ]);
  }, [sessionToken]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="dark flex h-dvh flex-col bg-[#09090f] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5 text-white/50 transition hover:text-white/80">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">Home</span>
        </Link>
        <div className="mx-auto flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
          <span className="text-sm font-black text-white">StayLynk AI</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessages([]);
            setInput('');
            setDisabled(false);
          }}
          className="text-xs font-semibold text-white/35 transition hover:text-white/70"
        >
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map(msg => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onSend={s => void sendMessage(s)}
              onBookingSubmit={handleBookingSubmit}
            />
          ))}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.07] px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything about properties in Kenya…"
              disabled={disabled || typing}
              className="flex-1 resize-none rounded-2xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white placeholder-white/25 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing || disabled}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40"
            >
              {typing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          {messages.length === 0 && (
            <p className="mt-2 text-center text-[11px] font-semibold text-violet-400/60">
              Unaweza tafuta kwa Kiingereza, Kiswahili au Sheng — e.g. &ldquo;Nataka bedsitter Westlands&rdquo;
            </p>
          )}
          <p className="mt-1 text-center text-[11px] text-white/20">
            AI can make mistakes — always verify property details before booking.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Message renderer ─────────────────────────────────────────────────────────

function MessageItem({
  msg,
  onSend,
  onBookingSubmit,
}: {
  msg: FindMessage;
  onSend: (s: string) => void;
  onBookingSubmit: (intent: Record<string, unknown>) => Promise<void>;
}) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="max-w-[80%] rounded-[18px] rounded-tr-sm bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40">
          {msg.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Bubble */}
      <div className="flex items-start gap-2.5">
        <OrbIcon />
        <div className="max-w-[88%] rounded-[18px] rounded-tl-sm bg-white/[0.07] px-4 py-3 text-sm font-semibold leading-6 text-white/90 ring-1 ring-white/[0.07]">
          {msg.isLoading ? <TypingDots /> : <RichText text={msg.text} />}
        </div>
      </div>

      {/* Structured cards */}
      {!msg.isLoading && (
        <div className="pl-9">
          {msg.responseType === 'property_cards' && msg.cards && (
            <PropertyCards cards={msg.cards as unknown as PropertyCardsData} onSend={onSend} />
          )}
          {msg.responseType === 'property_detail' && msg.cards && (
            <PropertyDetail cards={msg.cards} mapData={msg.mapData} onSend={onSend} />
          )}
          {msg.responseType === 'room_selection' && msg.cards && (
            <RoomGrid cards={msg.cards as unknown as RoomSelectionData} onSend={onSend} />
          )}
          {msg.responseType === 'booking_summary' && msg.cards && (
            <BookingSummary cards={msg.cards as unknown as BookingSummaryData} onSend={onSend} />
          )}
          {msg.responseType === 'booking_submit' && msg.actionIntent && msg.fullyRevealed && (
            <BookingSubmitBtn intent={msg.actionIntent} onSubmit={onBookingSubmit} />
          )}
          {msg.mapData && msg.responseType !== 'property_detail' && (
            <MapPreview mapData={msg.mapData} />
          )}
          {msg.whatsAppUrl && msg.fullyRevealed && (
            <a
              href={msg.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-emerald-900/40 transition hover:bg-emerald-500"
            >
              <MessageCircle size={14} />
              WhatsApp Manager
            </a>
          )}
          {msg.fullyRevealed && msg.suggestions && msg.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {msg.suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/65 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Property cards ───────────────────────────────────────────────────────────

function PropertyCards({ cards, onSend }: { cards: PropertyCardsData; onSend: (s: string) => void }) {
  return (
    <div className="mt-1 space-y-3">
      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => onSend(chip)}
            className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/55 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Cards: horizontal scroll on mobile, 2-col grid on sm+ */}
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none]">
        {cards.items.map((item, i) => (
          <PropertyCard key={item.slug} item={item} rank={i + 1} onSend={onSend} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-white/30">
          Showing <span className="text-white/55">{cards.showing}</span> of{' '}
          <span className="text-white/55">{cards.total}</span>{' '}
          {cards.type_label}s in {cards.city}
        </p>
        {cards.has_more && (
          <button
            type="button"
            onClick={() => onSend('show more')}
            className="flex items-center gap-1 text-[11px] font-black text-violet-400 transition hover:text-violet-300"
          >
            Show more <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ item, rank, onSend }: { item: PropertyCardItem; rank: number; onSend: (s: string) => void }) {
  const [favorited, setFavorited] = useState(false);
  const imgSrc = normalizePublicImageUrl(item.cover_image);
  const price = item.rent_max && item.rent_max > item.rent_min
    ? `KES ${item.rent_min.toLocaleString()} – ${item.rent_max.toLocaleString()}/mo`
    : `KES ${item.rent_min.toLocaleString()}/mo`;

  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] sm:w-auto sm:shrink">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#141421]">
        {imgSrc ? (
          <img src={imgSrc} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BedDouble size={32} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Verified */}
        {item.is_verified && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm ring-1 ring-emerald-500/30">
            <ShieldCheck size={9} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-300">Verified</span>
          </div>
        )}

        {/* Rank badge */}
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/90 text-[10px] font-black text-white backdrop-blur-sm">
          #{rank}
        </div>

        {/* Availability */}
        {(item.available_units ?? 0) > 0 && (
          <div className="absolute bottom-2 left-2 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm ring-1 ring-emerald-500/30">
            <span className="text-[9px] font-black text-emerald-300">{item.available_units} available</span>
          </div>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={() => setFavorited(f => !f)}
          aria-label={favorited ? 'Remove from favourites' : 'Add to favourites'}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition hover:bg-black/70"
        >
          <Heart size={13} className={favorited ? 'fill-rose-400 text-rose-400' : 'text-white/60'} />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-9 left-2 rounded-lg bg-black/60 px-2 py-0.5 backdrop-blur-sm">
          <span className="text-xs font-black text-white">{price}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-1 text-sm font-black text-white">{item.title}</p>
          {item.rating != null && item.rating > 0 && (
            <div className="flex shrink-0 items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black text-amber-300">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {(item.neighbourhood || item.city) && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/40">
            <MapPin size={9} />
            {[item.neighbourhood, item.city].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Amenity chips */}
        {item.amenities && item.amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.amenities.slice(0, 3).map(a => (
              <AmenityChip key={a} label={a} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => onSend(`#${rank}`)}
            className="flex-1 rounded-lg bg-violet-600/20 py-1.5 text-[11px] font-black text-violet-300 transition hover:bg-violet-600/30"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onSend(`book #${rank}`)}
            className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 py-1.5 text-[11px] font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function AmenityChip({ label }: { label: string }) {
  const l = label.toLowerCase();
  const icon = /wifi|internet/.test(l) ? <Wifi size={9} />
    : /water/.test(l)   ? <Droplets size={9} />
    : /park/.test(l)    ? <Car size={9} />
    : /security/.test(l)? <ShieldCheck size={9} />
    : <Zap size={9} />;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/55">
      {icon}{label}
    </span>
  );
}

// ─── Property detail ──────────────────────────────────────────────────────────

function PropertyDetail({
  cards,
  mapData,
  onSend,
}: {
  cards: Record<string, unknown>;
  mapData?: MapData | null;
  onSend: (s: string) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = (cards.images as string[] | undefined) ?? [];
  const coverImg = normalizePublicImageUrl((cards.cover_image as string | null) ?? images[0]);
  const allImages = coverImg ? [coverImg, ...images.slice(1)] : images;
  const amenities = (cards.amenities as string[] | undefined) ?? [];
  const availableRooms = (cards.available_rooms as unknown[]).length ?? 0;
  const lat = mapData?.lat ?? (cards.latitude as number | undefined);
  const lng = mapData?.lng ?? (cards.longitude as number | undefined);
  const mapsUrl = mapData?.search_url ?? (cards.maps_url as string | undefined);
  const directionsUrl = mapData?.directions_url ?? mapsUrl;
  const wa = cards.whatsapp_url as string | undefined;

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
      {/* Gallery */}
      {allImages.length > 0 && (
        <div className="relative aspect-[16/9] overflow-hidden bg-[#141421]">
          <img
            src={allImages[imgIdx]}
            alt={cards.title as string}
            className="h-full w-full object-cover transition-opacity duration-300"
            loading="lazy"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}
          {cards.is_verified && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm ring-1 ring-emerald-500/30">
              <ShieldCheck size={9} className="text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-300">Verified</span>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-black text-white">{cards.title as string}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white/40">
            <MapPin size={10} />
            {[cards.neighbourhood, cards.city].filter(Boolean).join(', ')}
          </p>
          <p className="mt-1 text-lg font-black text-violet-300">
            KES {(cards.rent_min as number).toLocaleString()}/mo
          </p>
        </div>

        {cards.description && (
          <p className="text-xs font-semibold leading-5 text-white/55">{cards.description as string}</p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/30">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {amenities.map(a => <AmenityChip key={a} label={a} />)}
            </div>
          </div>
        )}

        {availableRooms > 0 && (
          <p className="text-xs font-bold text-emerald-400">
            <CheckCircle size={11} className="mr-1 inline" />
            {availableRooms} room{availableRooms !== 1 ? 's' : ''} available
          </p>
        )}

        {/* Map */}
        {(lat && lng) || mapsUrl ? (
          <MapPreview mapData={{ lat, lng, search_url: mapsUrl, directions_url: directionsUrl }} />
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSend('Book this house')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            <BedDouble size={12} /> Book This House
          </button>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-500"
            >
              <MessageCircle size={12} /> WhatsApp Manager
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-black text-white/65 transition hover:border-sky-400/40 hover:text-sky-300"
            >
              <MapPin size={12} /> View on Map
            </a>
          )}
          <button
            type="button"
            onClick={() => onSend('Show more properties')}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] px-4 py-2 text-xs font-black text-white/40 transition hover:border-white/20 hover:text-white/65"
          >
            <ArrowLeft size={11} /> Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Room selection grid ──────────────────────────────────────────────────────

function RoomGrid({ cards, onSend }: { cards: RoomSelectionData; onSend: (s: string) => void }) {
  return (
    <div className="mt-2 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-white/30">
        {cards.total} room{cards.total !== 1 ? 's' : ''} available — tap to select
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cards.items.map(room => {
          const pending = room.pending_bookings_count ?? 0;
          return (
            <button
              key={room.uuid ?? room.index}
              type="button"
              onClick={() => onSend(`#${room.index}`)}
              className="group relative rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] active:scale-[0.97]"
            >
              {pending > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                  {pending} pending
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
              <p className="mt-1.5 text-[10px] font-semibold text-white/25 transition-colors group-hover:text-violet-300">
                Select →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Booking summary ──────────────────────────────────────────────────────────

function BookingSummary({ cards, onSend }: { cards: BookingSummaryData; onSend: (s: string) => void }) {
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
    <div className="mt-2 overflow-hidden rounded-2xl border border-violet-500/25 bg-violet-500/[0.07]">
      <p className="border-b border-violet-500/15 px-4 py-3 text-xs font-black uppercase tracking-wider text-violet-300">
        Booking Summary
      </p>
      <div className="divide-y divide-white/[0.05]">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">{row.label}</span>
            <span className="max-w-[60%] truncate text-right text-[11px] font-black text-white/85">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-violet-500/15 p-4">
        <button
          type="button"
          onClick={() => onSend('yes confirm')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
        >
          <CheckCircle size={14} /> Confirm Booking
        </button>
        <button
          type="button"
          onClick={() => onSend('no cancel')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] py-3 text-sm font-black text-white/55 transition hover:bg-white/[0.05]"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Booking submit ───────────────────────────────────────────────────────────

function BookingSubmitBtn({
  intent,
  onSubmit,
}: {
  intent: Record<string, unknown>;
  onSubmit: (intent: Record<string, unknown>) => Promise<void>;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const label = (intent.label as string | undefined) ?? 'Submit Booking Request';

  if (state === 'done') return null;

  const handleClick = async () => {
    setState('loading');
    try {
      await onSubmit(intent);
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        disabled={state === 'loading'}
        onClick={() => void handleClick()}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60"
      >
        {state === 'loading' ? (
          <><Loader2 size={15} className="animate-spin" /> Submitting…</>
        ) : (
          <><CheckCircle size={15} /> {label}</>
        )}
      </button>
      {state === 'error' && (
        <p className="text-xs font-semibold text-rose-400">Submission failed. Please try again.</p>
      )}
    </div>
  );
}

// ─── Map preview ──────────────────────────────────────────────────────────────

function MapPreview({ mapData }: { mapData: MapData }) {
  const { lat, lng, zoom = 16, title, search_url, directions_url } = mapData;
  const embedSrc = lat && lng
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
    : search_url
      ? `https://maps.google.com/maps?q=${encodeURIComponent(title ?? '')}&output=embed`
      : null;

  if (!embedSrc && !search_url) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
      {embedSrc && (
        <div className="relative h-44 w-full overflow-hidden bg-[#141421]">
          <iframe
            src={embedSrc}
            title={title ?? 'Map'}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </div>
      )}
      <div className="flex gap-2 border-t border-white/[0.06] px-3 py-2.5">
        {search_url && (
          <a
            href={search_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] font-black text-white/60 transition hover:border-sky-400/40 hover:text-sky-300"
          >
            <ExternalLink size={11} /> Open in Maps
          </a>
        )}
        {directions_url && (
          <a
            href={directions_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-sky-600/20 px-3 py-1.5 text-[11px] font-black text-sky-300 ring-1 ring-sky-500/20 transition hover:bg-sky-600/30"
          >
            <Navigation size={11} /> Get Directions
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function OrbIcon() {
  return (
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md shadow-violet-900/40">
      <Zap size={12} className="text-white" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

// Suppress unused import warning — AnimatePresence used for potential future expansion
void AnimatePresence;

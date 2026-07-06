import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PenSquare, RotateCcw, Send, Loader2, Search, Trash2 } from 'lucide-react';
import { listingApi } from '../api/listingApi';
import { hunterApi } from '../api/hunterApi';
import { useStore } from '../stores/listingStore';
import { useSeekerStore, type StoredMessage } from '../stores/seekerStore';
import { clearAiSessionToken, getStoredAiSessionToken, storeAiSessionToken } from '../services/aiSession';
import {
  clarificationChipsFor,
  createPublicAISession,
  fallbackMessage,
  fuzzyIntentToFilters,
  isIntentReady,
  publicAIChat,
  publicAIRankSearch,
  typeWords,
} from '../services/aiChat';
import { postAIFeedback, sendAIAbandonFeedback } from '../services/aiFeedback';
import { normalizePublicImageUrl } from '../services/media/cdnService';
import { AIThinkingOrb } from '../components/public/AIThinkingOrb';
import { AIChatThread } from '../components/public/AIChatThread';
import { RolePromptSuggestions } from '../components/public/RolePromptSuggestions';
import { Seo } from '../components/seo/Seo';
import type {
  AIActionIntent,
  AiPropertyResult,
  AiSearchIntent,
  FuzzyIntent,
  Listing,
  RankableProperty,
} from '../types';
import type { PublicAIMessage } from '../components/public/AIMessageBubble';

const TYPING_SPEED_MS = 36;

// ─── Conversation helpers ─────────────────────────────────────────────────────

function newConversationId() {
  return crypto.randomUUID();
}

function makeTitle(firstUserText: string): string {
  return firstUserText.length > 50
    ? firstUserText.slice(0, 47) + '…'
    : firstUserText;
}

/** Strip non-serialisable fields; mark everything as fully revealed so
 *  restoring doesn't re-play typing animations. */
function messagesToStored(messages: PublicAIMessage[]): StoredMessage[] {
  return messages
    .filter(m => !m.isLoading)
    .map(m => ({
      id: m.id,
      role: m.role,
      text: m.text,
      isError: m.isError,
      timestamp: (m.timestamp ?? new Date()).toISOString(),
      fullyRevealed: true,
      suggestions: m.suggestions,
      properties: m.properties as unknown[],
      intent: m.intent,
      learningApplied: m.learningApplied,
      media: m.media as unknown[],
      actionIntent: m.actionIntent,
    }));
}

function storedToMessages(stored: StoredMessage[]): PublicAIMessage[] {
  return stored.map(m => ({
    ...(m as unknown as PublicAIMessage),
    timestamp: new Date(m.timestamp),
    fullyRevealed: true,
    isLoading: false,
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIPage() {
  const setFilters = useStore(s => s.setFilters);
  const addPrompt = useSeekerStore(s => s.addPrompt);
  const conversations = useSeekerStore(s => s.conversations);
  const saveConversation = useSeekerStore(s => s.saveConversation);
  const deleteConversation = useSeekerStore(s => s.deleteConversation);
  const getConversation = useSeekerStore(s => s.getConversation);

  const typingCleanupRef = useRef<(() => void) | null>(null);
  const sessionStartRef = useRef(Date.now());
  const lastQueryRef = useRef('');
  const lastIntentRef = useRef<FuzzyIntent | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation ID — starts as a fresh conversation
  const [conversationId, setConversationId] = useState<string>(() => newConversationId());
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => getStoredAiSessionToken(),
  );
  const [, setRole] = useState('public_hunter');
  const [showHunterBanner, setShowHunterBanner] = useState(false);
  const [messages, setMessages] = useState<PublicAIMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inputDisabledReason, setInputDisabledReason] = useState<string | null>(null);
  const isBusy = thinking || sessionLoading || typing;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '52px';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Abandon feedback on leave
  useEffect(() => {
    const handler = () => {
      const token = sessionToken ?? getStoredAiSessionToken();
      if (!token || !lastQueryRef.current) return;
      sendAIAbandonFeedback({
        session_token: token,
        last_query: lastQueryRef.current,
        duration_seconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
      });
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sessionToken]);

  // Save conversation to store after every message update
  // (skips loading messages; marks everything as revealed so restore is instant)
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    if (messages.some(m => m.isLoading)) return; // still in flight
    const firstUser = messages.find(m => m.role === 'user');
    if (!firstUser) return;
    saveConversation({
      id: conversationId,
      title: makeTitle(firstUser.text),
      sessionToken: sessionToken,
      messages: messagesToStored(messages),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => () => typingCleanupRef.current?.(), []);

  // Start session on mount
  useEffect(() => {
    void ensureSession().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Session ──────────────────────────────────────────────────────────────────

  const ensureSession = async () => {
    const existing = sessionToken ?? getStoredAiSessionToken();
    if (existing) return existing;
    setSessionLoading(true);
    try {
      const response = await createPublicAISession(null);
      const token = response.data.session_token;
      storeAiSessionToken(token);
      setSessionToken(token);
      setRole(response.data.role ?? 'public_hunter');
      return token;
    } finally {
      setSessionLoading(false);
    }
  };

  // ── Typing ───────────────────────────────────────────────────────────────────

  const beginTyping = useCallback(
    (msgId: string, text: string, extras: Partial<PublicAIMessage> = {}) => {
      typingCleanupRef.current?.();
      typingCleanupRef.current = null;

      setMessages(current =>
        current.map(msg =>
          msg.id === msgId
            ? { ...msg, ...extras, text: '', isLoading: false, fullyRevealed: false }
            : msg,
        ),
      );

      setTyping(true);
      typingCleanupRef.current = typeWords(
        text,
        TYPING_SPEED_MS,
        partial =>
          setMessages(current =>
            current.map(msg => (msg.id === msgId ? { ...msg, text: partial } : msg)),
          ),
        () => {
          typingCleanupRef.current = null;
          setTyping(false);
          setMessages(current =>
            current.map(msg =>
              msg.id === msgId ? { ...msg, fullyRevealed: true } : msg,
            ),
          );
        },
      );
    },
    [],
  );

  // ── Ask ──────────────────────────────────────────────────────────────────────

  const ask = async (prompt: string) => {
    const value = prompt.trim();
    if (!value || isBusy || inputDisabledReason) return;

    const loadingId = crypto.randomUUID();

    typingCleanupRef.current?.();
    typingCleanupRef.current = null;
    setTyping(false);
    setHasError(false);
    lastQueryRef.current = value;
    addPrompt(value);
    setInput('');
    setThinking(true);

    setMessages(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'user',
        text: value,
        timestamp: new Date(),
        fullyRevealed: true,
      },
      { id: loadingId, role: 'assistant', text: '', isLoading: true, timestamp: new Date() },
    ]);

    try {
      let token = sessionToken ?? getStoredAiSessionToken() ?? await ensureSession();
      let chatResponse: Awaited<ReturnType<typeof publicAIChat>>;
      try {
        chatResponse = await publicAIChat(value, token);
      } catch (chatErr) {
        // Session expired (HTTP 401 or session_expired flag) — refresh once and retry
        if ((chatErr as { status?: number }).status === 401) {
          clearAiSessionToken();
          setSessionToken(null);
          const freshRes = await createPublicAISession(null);
          token = freshRes.data.session_token;
          storeAiSessionToken(token);
          setSessionToken(token);
          chatResponse = await publicAIChat(value, token);
        } else {
          throw chatErr;
        }
      }
      const activeToken = chatResponse.data.session_token ?? token;
      storeAiSessionToken(activeToken);
      setSessionToken(activeToken);
      setRole(chatResponse.data.role ?? 'public_hunter');

      // If the AI is answering property/housing questions, show the hunter banner
      const aiMessage = (chatResponse.data.message ?? '') as string;
      if (!showHunterBanner && /bedsitter|apartment|studio|rental|property|room|house|hostel|available in|options in/i.test(aiMessage)) {
        setShowHunterBanner(true);
      }

      const fuzzyIntent = chatResponse.data.context?.fuzzy_intent;
      lastIntentRef.current = fuzzyIntent ?? null;

      const modAction = chatResponse.data.meta?.moderation?.action;
      if (modAction === 'temporary_mute') setInputDisabledReason('AI input is temporarily muted.');
      else if (modAction === 'session_suspension')
        setInputDisabledReason('This AI session is suspended.');
      else setInputDisabledReason(null);

      const directMedia = chatResponse.data.media;
      const directAction = chatResponse.data.action_intent;
      if (directMedia?.length) {
        beginTyping(loadingId, chatResponse.data.message || 'Here are the property photos:', {
          media: directMedia,
          actionIntent: directAction,
          suggestions: chatResponse.data.suggestions,
        });
        return;
      }

      // When the AI returns a specific property detail (user picked #1, #2, etc.),
      // fetch that listing from Laravel and render a full property card.
      if (directAction && (directAction as unknown as Record<string, unknown>).type === 'property_actions') {
        const rawActions = ((directAction as unknown as Record<string, unknown>).actions ?? []) as Array<Record<string, string>>;
        const bookAction = rawActions.find(a => a.type === 'book' && a.slug);
        if (bookAction?.slug) {
          try {
            const detail = await listingApi.show(bookAction.slug);
            const property = listingToAiProperty(detail.data, undefined);
            beginTyping(loadingId, chatResponse.data.message || `Here are the details for ${property.title}:`, {
              properties: [property],
              suggestions: chatResponse.data.suggestions,
              actionIntent: directAction,
            });
          } catch {
            beginTyping(loadingId, chatResponse.data.message || 'Property details unavailable.', {
              suggestions: chatResponse.data.suggestions,
            });
          }
          return;
        }
      }

      // Handle property_list from conversation engine (city + type confirmed, backend returned results)
      if (directAction) {
        const act = directAction as unknown as { type?: string; payload?: Record<string, unknown> };
        if (act.type === 'property_list' && act.payload?.items) {
          const rawItems = (act.payload.items as Array<Record<string, unknown>>).slice(0, 5);
          if (rawItems.length > 0) {
            const city = (act.payload.city as string | undefined) ?? '';
            const typeLabel = (act.payload.type_label as string | undefined) ?? '';
            const properties = rawItems.map(propertyListItemToAiResult);
            const suggestions = buildPropertyListSuggestions(rawItems, city, typeLabel);
            beginTyping(
              loadingId,
              chatResponse.data.message || `Found ${rawItems.length} ${typeLabel || 'properties'}${city ? ` in ${city}` : ''}:`,
              { properties, suggestions },
            );
            return;
          }
        }
      }

      // Handle structured response_type payloads
      const responseType = chatResponse.data.response_type;
      const cards = chatResponse.data.cards ?? null;
      const rawMapData = (chatResponse.data as unknown as Record<string, unknown>).map_data as Record<string, unknown> | null | undefined;
      const mapDataUrl: string | null = rawMapData
        ? ((rawMapData.search_url as string | undefined) ?? (rawMapData.directions_url as string | undefined) ?? null)
        : null;

      if (responseType === 'property_cards' && cards) {
        const items = ((cards as Record<string, unknown>).items as Array<Record<string, unknown>>) ?? [];
        if (items.length > 0) {
          const properties = items.map(propertyListItemToAiResult);
          const city = (cards as Record<string, unknown>).city as string | undefined;
          const typeLabel = (cards as Record<string, unknown>).type_label as string | undefined;
          const suggestions = buildPropertyListSuggestions(items, city ?? '', typeLabel ?? '');
          beginTyping(
            loadingId,
            chatResponse.data.message || `Found ${items.length} ${typeLabel || 'properties'}${city ? ` in ${city}` : ''}:`,
            { properties, suggestions: chatResponse.data.suggestions?.length ? chatResponse.data.suggestions : suggestions },
          );
          return;
        }
      }

      if (responseType === 'property_detail' && cards) {
        beginTyping(
          loadingId,
          chatResponse.data.message || 'Here are the property details.',
          {
            responseType,
            cards,
            mapUrl: mapDataUrl,
            suggestions: chatResponse.data.suggestions,
            actionIntent: directAction,
          },
        );
        return;
      }

      if (responseType === 'booking_summary' && cards) {
        beginTyping(
          loadingId,
          chatResponse.data.message || 'Please review your booking details.',
          {
            responseType,
            cards,
            suggestions: chatResponse.data.suggestions,
            actionIntent: directAction,
          },
        );
        return;
      }
      if (responseType === 'room_selection' && cards) {
        beginTyping(
          loadingId,
          chatResponse.data.message || 'Please select a room.',
          {
            responseType,
            cards,
            suggestions: chatResponse.data.suggestions,
          },
        );
        return;
      }

      // Handle submit_booking — show the booking CTA button
      if (directAction) {
        const act = directAction as unknown as { type?: string };
        if (act.type === 'submit_booking') {
          beginTyping(
            loadingId,
            chatResponse.data.message || 'Your booking request is ready!',
            {
              actionIntent: directAction,
              suggestions: chatResponse.data.suggestions,
            },
          );
          return;
        }
      }

      // Handle map/URL intents — check map_data first, then action_intent
      if (mapDataUrl && !responseType) {
        beginTyping(
          loadingId,
          chatResponse.data.message || "Here's the location on Google Maps.",
          {
            mapUrl: mapDataUrl,
            suggestions: chatResponse.data.suggestions,
            actionIntent: directAction,
          },
        );
        return;
      }

      if (directAction) {
        const act = directAction as unknown as { type?: string; url?: string; label?: string; payload?: Record<string, unknown> };
        const rawUrl = (act.url as string | undefined) ?? (act.payload?.maps_url as string | undefined);

        const mapTypes = ['view_property_map', 'view_directions', 'view_street_view'];
        const isMaps = (u: string) => /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(u);
        const isWhatsApp = (u: string) => /wa\.me|whatsapp\.com/i.test(u);

        if (rawUrl && (mapTypes.includes(act.type ?? '') || (act.type === 'open_url' && isMaps(rawUrl)))) {
          beginTyping(
            loadingId,
            chatResponse.data.message || "Here's the location on Google Maps.",
            {
              mapUrl: rawUrl,
              suggestions: chatResponse.data.suggestions,
              actionIntent: directAction,
            },
          );
          return;
        }

        if (rawUrl && act.type === 'open_url' && isWhatsApp(rawUrl)) {
          beginTyping(
            loadingId,
            chatResponse.data.message || 'Contact the manager on WhatsApp.',
            {
              whatsAppUrl: rawUrl,
              suggestions: chatResponse.data.suggestions,
              actionIntent: directAction,
            },
          );
          return;
        }
      }

      const ready = isIntentReady(chatResponse.data);
      if (!ready) {
        const chips =
          chatResponse.data.suggestions?.length
            ? chatResponse.data.suggestions
            : clarificationChipsFor(fuzzyIntent?.missing ?? []);
        beginTyping(
          loadingId,
          chatResponse.data.message ||
            'Could you add a bit more detail — like an area, budget, or property type?',
          { suggestions: chips },
        );
        return;
      }

      setMessages(current =>
        current.map(msg =>
          msg.id === loadingId ? { ...msg, text: 'Searching properties…' } : msg,
        ),
      );

      const searchFilters = fuzzyIntentToFilters(fuzzyIntent, value);
      let laravelListings: Listing[] = [];
      try {
        const page = await listingApi.search(searchFilters);
        laravelListings = page.data ?? [];
      } catch {
        /* ranking handles zero_results */
      }

      const rankable: RankableProperty[] = laravelListings.map(listingToRankable);
      const rankResponse = await publicAIRankSearch(value, rankable, activeToken);

      const rankedProps = (rankResponse.data.properties ?? []).sort(
        (a, b) => b.ai_rank_score - a.ai_rank_score,
      );

      // Fetch full listing data from Laravel for the top ranked results so we
      // get real cover_image, amenities and features (the ranker's own copy is
      // stale and has null images). Fall back to the ranker's data if fetch fails.
      const topRanked = rankedProps.slice(0, 6);
      const hydrated = await Promise.all(
        topRanked.map(async r => {
          const raw = r as unknown as Record<string, unknown>;
          const slug = raw.slug as string | undefined;
          if (!slug) return rankedToAiProperty(r);
          try {
            const detail = await listingApi.show(slug);
            return listingToAiProperty(detail.data, r.ai_rank_score);
          } catch {
            return rankedToAiProperty(r);
          }
        }),
      );
      const properties: AiPropertyResult[] = hydrated.length
        ? hydrated
        : laravelListings.map(l => listingToAiProperty(l, undefined));

      const zeroResults = rankResponse.data.zero_results || !properties.length;
      const suggestions =
        rankResponse.data.suggestions?.length
          ? rankResponse.data.suggestions
          : zeroResults
            ? ['Try a nearby neighbourhood', 'Increase your budget', 'Remove one amenity']
            : [];

      const responseText =
        chatResponse.data.message ||
        (zeroResults
          ? fallbackMessage('property_search')
          : `Found ${properties.length} matching propert${properties.length === 1 ? 'y' : 'ies'}`);

      setFilters({ ...searchFilters, sort: 'smart' });

      beginTyping(loadingId, responseText, {
        properties,
        suggestions,
        intent: fuzzyIntentToAiSearchIntent(fuzzyIntent),
        learningApplied: rankResponse.data.learning_applied,
        moderationAction: modAction,
      });
    } catch (error) {
      setHasError(true);
      const errorText = errorMessageForStatus(error);
      window.setTimeout(() => {
        beginTyping(loadingId, errorText, { isError: true, retryPrompt: value, thinking: [] });
      }, 600);
    } finally {
      setThinking(false);
    }
  };

  // ── Conversation switching ────────────────────────────────────────────────────

  /** Start a fresh blank conversation */
  const startNewConversation = () => {
    typingCleanupRef.current?.();
    typingCleanupRef.current = null;
    setTyping(false);
    setHasError(false);
    setInputDisabledReason(null);
    lastQueryRef.current = '';
    lastIntentRef.current = null;

    const id = newConversationId();
    setConversationId(id);
    setMessages([]);

    // Fresh session token — don't re-use the old one so AI has no carry-over context
    clearAiSessionToken();
    setSessionToken(null);
    void ensureSession().catch(() => undefined);
    sessionStartRef.current = Date.now();
  };

  /** Switch to a stored conversation without sending a message */
  const switchToConversation = (id: string) => {
    if (id === conversationId) return;

    typingCleanupRef.current?.();
    typingCleanupRef.current = null;
    setTyping(false);
    setHasError(false);
    setInputDisabledReason(null);
    setInput('');
    lastQueryRef.current = '';
    lastIntentRef.current = null;

    const stored = getConversation(id);
    if (!stored) return;

    setConversationId(id);
    setMessages(storedToMessages(stored.messages));

    // Restore that conversation's session token so follow-up messages have context
    const token = stored.sessionToken;
    if (token) {
      storeAiSessionToken(token);
      setSessionToken(token);
    } else {
      clearAiSessionToken();
      setSessionToken(null);
      void ensureSession().catch(() => undefined);
    }
  };

  // ── Event handlers ────────────────────────────────────────────────────────────

  const handleSuggestion = (s: string) => {
    postAIFeedback('suggestion-acted', {
      session_token: sessionToken,
      suggestion: s,
      last_query: lastQueryRef.current,
    });
    void ask(s);
  };

  const handlePropertyClick = (property: AiPropertyResult, message: PublicAIMessage) => {
    postAIFeedback('click', {
      property_uuid: property.uuid,
      session_token: sessionToken,
      query: lastQueryRef.current,
      intent: message.intent ?? lastIntentRef.current,
    });
  };

  const handleFeedback = (message: PublicAIMessage, value: 'up' | 'down', reason?: string) => {
    postAIFeedback('thumbs', {
      value,
      reason,
      session_token: sessionToken,
      message_id: message.id,
      query: lastQueryRef.current,
    });
    setMessages(current =>
      current.map(item =>
        item.id === message.id
          ? { ...item, feedbackState: value === 'up' ? 'thanks' : 'noted' }
          : item,
      ),
    );
  };

  const handleBookingSubmit = async (actionIntent: AIActionIntent) => {
    const raw = actionIntent as unknown as Record<string, unknown>;
    const payload = raw.payload as Record<string, unknown> | undefined;
    if (!payload?.slug) throw new Error('Missing booking data');

    const token = sessionToken ?? getStoredAiSessionToken();
    if (!token) throw new Error('No session token');

    await hunterApi.book({
      session_token: token,
      slug:          payload.slug as string,
      move_in_date:  payload.move_in_date as string,
      name:          payload.name as string,
      email:         payload.email as string,
      phone:         payload.phone as string,
    });

    setMessages(current => [
      ...current,
      {
        id:            crypto.randomUUID(),
        role:          'assistant' as const,
        text:          (raw.success_message as string) || "✅ Booking submitted! You'll receive a confirmation email once the property manager reviews your request.",
        timestamp:     new Date(),
        fullyRevealed: true,
        suggestions:   ['Find more properties', 'Start over'],
      },
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void ask(input);
    }
  };

  const statusDot = hasError
    ? 'bg-rose-500'
    : isBusy
      ? 'animate-pulse bg-amber-400'
      : 'bg-emerald-400';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="dark flex h-dvh bg-[#09090f] text-white">
      <Seo
        title="StayLynk AI — Property Search Assistant"
        description="Describe what you're looking for and our AI will find and rank verified rental properties in Kenya for you."
        canonicalPath="/ai"
      />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d16] lg:flex">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-4 py-4">
          <Link
            to="/"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
            aria-label="Back to home"
          >
            <ArrowLeft size={14} />
          </Link>
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-sm font-black text-transparent">
            StayLynk AI
          </span>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-xs font-black text-white/55 transition hover:border-violet-500/30 hover:bg-violet-500/[0.08] hover:text-violet-300"
            onClick={startNewConversation}
          >
            <PenSquare size={13} />
            New chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {conversations.length > 0 && (
            <>
              <p className="mb-2 px-1 text-[9px] font-black uppercase tracking-widest text-white/20">
                Recent
              </p>
              <div className="space-y-0.5">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`group flex w-full items-center gap-1.5 rounded-lg text-left transition ${
                      conv.id === conversationId
                        ? 'bg-violet-500/[0.13] text-white'
                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                    }`}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2"
                      onClick={() => switchToConversation(conv.id)}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${conv.id === conversationId ? 'bg-violet-400' : 'bg-white/[0.15]'}`} />
                      <span className="truncate text-[12px] font-semibold">{conv.title}</span>
                    </button>
                    <button
                      type="button"
                      className="mr-1.5 hidden shrink-0 rounded p-0.5 text-white/20 transition hover:text-rose-400 group-hover:block"
                      onClick={e => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                        if (conv.id === conversationId) startNewConversation();
                      }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom link */}
        <div className="border-t border-white/[0.05] px-3 py-3">
          <Link
            to="/browse"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white/30 transition hover:bg-white/[0.04] hover:text-white/60"
          >
            <Search size={13} />
            Browse listings
          </Link>
        </div>
      </aside>

      {/* ── Main chat ──────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0d0d16]/80 px-4 py-3 backdrop-blur-md">
          {/* Mobile back */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-black text-white/35 transition hover:text-white/70 lg:hidden"
          >
            <ArrowLeft size={13} />
            Home
          </Link>

          {/* Status pill */}
          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            <span className="text-[11px] font-black text-white/50">
              {isBusy
                ? thinking ? 'Thinking…' : 'Typing…'
                : 'Kenya property AI'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/25 transition hover:bg-white/[0.06] hover:text-white/60"
              onClick={startNewConversation}
              title="New conversation"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Hunter redirect banner */}
        {showHunterBanner && (
          <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.08] to-fuchsia-500/[0.06] px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
              <Search size={13} className="text-violet-300" />
            </div>
            <p className="flex-1 text-xs font-semibold text-white/60">
              Looking for a rental property?
            </p>
            <Link
              to="/hunter"
              className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-1.5 text-[11px] font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Open House Hunter →
            </Link>
            <button
              type="button"
              onClick={() => setShowHunterBanner(false)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white/20 transition hover:bg-white/[0.05] hover:text-white/50"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Messages scroll area */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
              <AIThinkingOrb size="lg" thinking={sessionLoading} />
              <motion.h1
                className="mt-5 bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-300 bg-clip-text text-3xl font-black text-transparent sm:text-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                StayLynk AI
              </motion.h1>
              <motion.p
                className="mt-3 max-w-xs text-sm font-medium text-white/35"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                Describe what you're looking for and I'll find verified properties, rank them for
                you, and answer any questions.
              </motion.p>
              <motion.div
                className="mt-8 w-full max-w-lg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
              >
                <RolePromptSuggestions onSelect={prompt => void ask(prompt)} />
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
              <AIChatThread
                messages={messages}
                onRetry={prompt => void ask(prompt)}
                onSuggestion={handleSuggestion}
                onPropertyClick={handlePropertyClick}
                onFeedback={handleFeedback}
                onBookingSubmit={handleBookingSubmit}
              />
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-white/[0.06] bg-[#09090f] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <form
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.05] p-2 transition-colors focus-within:border-violet-500/40 focus-within:bg-white/[0.07]"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void ask(input);
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 2000))}
              onKeyDown={handleKeyDown}
              placeholder={
                inputDisabledReason ? inputDisabledReason : 'Ask anything about properties in Kenya…'
              }
              disabled={!!inputDisabledReason}
              rows={1}
              maxLength={2000}
              className="min-h-[48px] min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] font-semibold leading-6 text-white outline-none placeholder:text-white/25 disabled:opacity-40"
              aria-label="Message AI assistant"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim() || !!inputDisabledReason}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-35"
              aria-label="Send"
            >
              {isBusy ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            </button>
          </form>
          {messages.length === 0 && (
            <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] font-semibold text-violet-400/50">
              Unaweza tafuta kwa Kiingereza, Kiswahili au Sheng — e.g. &ldquo;Nataka bedsitter Westlands&rdquo;
            </p>
          )}
          <p className="mx-auto mt-1 max-w-3xl text-center text-[11px] font-medium text-white/15">
            AI can make mistakes — always verify property details before booking.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Listing ↔ AI shapes ──────────────────────────────────────────────────────

// Map a rich ranker response property to AiPropertyResult.
// The AI ranker returns full property objects (cover_image, amenities, features, etc.)
// so we use those directly rather than joining back to the sparse Laravel listing data.
function rankedToAiProperty(r: RankableProperty): AiPropertyResult {
  const raw = r as unknown as Record<string, unknown>;
  return {
    uuid:              (raw.uuid as string) ?? (raw.id as string),
    slug:              (raw.slug as string) ?? (raw.uuid as string),
    title:             (raw.title as string) ?? (raw.name as string) ?? '',
    description:       (raw.description as string | null) ?? null,
    rent_min:          (raw.rent_min as number | null) ?? null,
    rent_max:          (raw.rent_max as number | null) ?? null,
    currency:          (raw.currency as string) ?? 'KES',
    city:              (raw.city as string | null) ?? null,
    neighbourhood:     (raw.neighbourhood as string | null) ?? null,
    county:            (raw.county as string | null) ?? null,
    house_type:        (raw.house_type as string | null) ?? null,
    bedrooms_min:      (raw.bedrooms_min as number | null) ?? null,
    bedrooms_max:      (raw.bedrooms_max as number | null) ?? null,
    amenities:         (raw.amenities as string[]) ?? [],
    parking_available: (raw.parking_available as boolean) ?? false,
    internet_available:(raw.internet_available as boolean) ?? false,
    is_family_friendly:(raw.is_family_friendly as boolean) ?? false,
    is_student_friendly:(raw.is_student_friendly as boolean) ?? false,
    cover_image:       (raw.cover_image as string | null) ?? null,
    latitude:          (raw.latitude as number | null) ?? null,
    longitude:         (raw.longitude as number | null) ?? null,
    similarity_score:  r.ai_rank_score,
  };
}

function listingToRankable(listing: Listing): RankableProperty {
  return {
    uuid: listing.id,
    name: listing.title,
    city: listing.location.city,
    neighbourhood: listing.location.neighbourhood ?? undefined,
    house_type: listing.house_type ?? undefined,
    monthly_rent: listing.pricing.min,
    amenities: listing.amenities.join(','),
    score: listing.trust?.property_rating ?? undefined,
  };
}

function listingToAiProperty(listing: Listing, aiRankScore?: number): AiPropertyResult {
  const cover = listing.media.cover;
  const coverUrl =
    typeof cover === 'string'
      ? cover
      : cover
        ? (cover.optimized_urls?.medium ?? cover.optimized_urls?.small ?? null)
        : null;
  return {
    uuid: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    rent_min: listing.pricing.min,
    rent_max: listing.pricing.max,
    currency: listing.pricing.currency,
    city: listing.location.city,
    neighbourhood: listing.location.neighbourhood,
    house_type: listing.house_type,
    bedrooms_min: listing.specs.bedrooms.min,
    bedrooms_max: listing.specs.bedrooms.max,
    amenities: listing.amenities,
    parking_available: listing.features.parking,
    internet_available: listing.features.internet,
    is_family_friendly: listing.features.family_friendly,
    is_student_friendly: listing.features.student_friendly,
    cover_image: coverUrl,
    map_url: listing.location.google_maps_url ?? null,
    similarity_score: aiRankScore,
  };
}

function propertyListItemToAiResult(item: Record<string, unknown>): AiPropertyResult {
  const amenities: string[] = [];
  if (item.water_available) amenities.push('Water');

  return {
    uuid:               (item.slug as string) || crypto.randomUUID(),
    slug:               (item.slug as string) || '',
    title:              (item.title as string) || '',
    rent_min:           typeof item.rent_min === 'number' ? item.rent_min : null,
    rent_max:           typeof item.rent_max === 'number' ? item.rent_max : null,
    currency:           'KES',
    neighbourhood:      (item.neighbourhood as string | null) ?? null,
    house_type:         (item.house_type as string | null) ?? null,
    amenities,
    parking_available:  Boolean(item.parking_available),
    internet_available: Boolean(item.internet_available),
    cover_image:        normalizePublicImageUrl(item.cover_image as string | null),
    similarity_score:   typeof item.rank === 'number' ? Math.max(0, 1 - (item.rank - 1) / 10) : undefined,
  };
}

function buildPropertyListSuggestions(
  items: Array<Record<string, unknown>>,
  city: string,
  typeLabel: string,
): string[] {
  const suggestions: string[] = [];

  items.slice(0, 3).forEach((item, i) => {
    const price = typeof item.rent_min === 'number'
      ? ` – KES ${(item.rent_min as number).toLocaleString()}`
      : '';
    suggestions.push(`#${i + 1}${price}`);
  });

  const rents = items
    .map(i => i.rent_min as number)
    .filter((r): r is number => typeof r === 'number' && r > 0);
  if (rents.length > 1) {
    const minRent = Math.min(...rents);
    const maxRent = Math.max(...rents);
    if (minRent !== maxRent) {
      const ceiling = Math.ceil((minRent * 1.25) / 1000) * 1000;
      suggestions.push(`Budget under KES ${ceiling.toLocaleString()}`);
    }
  }

  if (city) suggestions.push(`More ${typeLabel || 'options'} in ${city}`);

  return suggestions.slice(0, 4);
}

function fuzzyIntentToAiSearchIntent(intent: FuzzyIntent | undefined): AiSearchIntent | undefined {
  if (!intent) return undefined;
  return {
    type: intent.action,
    budget_min: intent.budget_min ?? undefined,
    budget_max: intent.budget_max ?? undefined,
    locations: intent.location ? [intent.location] : undefined,
    property_types: intent.house_type ? [intent.house_type] : undefined,
    amenities: intent.amenities,
  };
}

function errorMessageForStatus(error: unknown) {
  const s =
    typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0;
  if (s === 429) return 'AI is receiving too many requests. Please wait a moment, then retry.';
  if (s === 422) return 'I could not use that prompt. Please reword it or add more details.';
  if (s === 401) return 'Your session expired. Please try again.';
  return 'I could not complete that request right now. Please try again.';
}

import { AIThinkingOrb } from './AIThinkingOrb';
import { AISearchResults } from './AISearchResults';
import { AIMediaGallery } from './AIMediaGallery';
import { motion } from 'framer-motion';
import { Download, Loader2, MapPin, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AIChatSource, AIActionIntent, AIComparisonTable, AIConfidenceBand, AIContextAction, AIModerationAction, AIMediaItem, AiPropertyResult, AiSearchIntent } from '../../types';

export type PublicAIMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thinking?: string[];
  isLoading?: boolean;
  isError?: boolean;
  retryPrompt?: string;
  timestamp?: Date;
  properties?: AiPropertyResult[];
  suggestions?: string[];
  intent?: AiSearchIntent;
  mapUrl?: string | null;
  tables?: AIComparisonTable[];
  source?: AIChatSource;
  confidenceBand?: AIConfidenceBand;
  confidence?: number;
  moderationAction?: AIModerationAction;
  blocked?: boolean;
  messageOnly?: boolean;
  modelCircuitOpen?: boolean;
  actions?: AIContextAction[];
  fullyRevealed?: boolean;
  feedbackState?: 'thanks' | 'noted';
  learningApplied?: boolean;
  media?: AIMediaItem[];
  actionIntent?: AIActionIntent;
  whatsAppUrl?: string | null;
  responseType?: string | null;
  cards?: Record<string, unknown> | null;
};

export function AIMessageBubble({
  message,
  onRetry,
  onSuggestion,
  onPropertyClick,
  onFeedback,
  onBookingSubmit,
}: {
  message: PublicAIMessage;
  onRetry: (prompt: string) => void;
  onSuggestion: (suggestion: string) => void;
  onPropertyClick: (property: AiPropertyResult, message: PublicAIMessage) => void;
  onFeedback: (message: PublicAIMessage, value: 'up' | 'down', reason?: string) => void;
  onBookingSubmit?: (actionIntent: AIActionIntent) => Promise<void>;
}) {
  const isUser = message.role === 'user';
  const isLowConfidence = message.confidenceBand === 'low';
  const canRenderProperties = !message.messageOnly && !isLowConfidence;
  const canRenderAssistantExtras = !message.messageOnly;
  const canRenderActions = !message.messageOnly && !isLowConfidence && !!message.actions?.length;
  const isWarning = message.moderationAction === 'warning';
  const timestamp = message.timestamp ?? new Date();

  return (
    <motion.div
      className={`flex min-w-0 flex-col ${isUser ? 'items-end' : 'items-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className={`flex max-w-[92%] items-start gap-2 sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <AIThinkingOrb size="xs" muted={message.isError} />
        )}
        <div
          className={`overflow-hidden rounded-[18px] px-4 py-3 text-[15px] font-semibold leading-6 ${
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40'
              : isLowConfidence
                ? 'rounded-tl-sm bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-500/20'
                : isWarning
                  ? 'rounded-tl-sm bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-100 dark:ring-rose-500/20'
                  : 'rounded-tl-sm bg-slate-100 text-slate-900 ring-1 ring-slate-200 dark:bg-white/[0.07] dark:text-white/90 dark:ring-white/[0.07]'
          }`}
        >
          {message.thinking && message.thinking.length > 0 && (
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.07] dark:bg-white/[0.04]">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-400 dark:text-white/35">
                <AIThinkingOrb size="xs" thinking={message.isLoading} muted={message.isError} />
                Thinking
              </div>
              <div className="space-y-1.5">
                {message.thinking.map(line => (
                  <p key={line} className="break-words text-xs font-medium leading-5 text-slate-500 dark:text-white/35">{line}</p>
                ))}
              </div>
            </div>
          )}
          {message.isLoading ? (
            <ThinkingDots />
          ) : (
            <div className="whitespace-pre-wrap break-words">{renderRichText(message.text)}</div>
          )}
          {!isUser && message.confidenceBand === 'medium' && !message.blocked && (
            <p className="mt-2 text-[11px] font-bold uppercase text-white/30">
              Verified from available data
            </p>
          )}
          {!isUser && isLowConfidence && (
            <p className="mt-2 text-xs font-semibold leading-5 text-amber-400">
              Needs more detail
            </p>
          )}
        </div>
      </div>
      <div className={`mt-1 max-w-[92%] text-[12px] font-medium text-slate-400 sm:max-w-[78%] dark:text-white/30 ${isUser ? 'text-right' : 'pl-7 text-left'}`}>
        {formatTimestamp(timestamp)}
        {!isUser && message.learningApplied && (
          <span className="ml-2 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-black text-violet-400">
            personalised
          </span>
        )}
        {!isUser && message.confidenceBand === 'medium' && !message.learningApplied && (
          <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-white/25" />
        )}
        {!isUser && message.confidenceBand === 'low' && (
          <span className="ml-2 text-amber-500 dark:text-amber-400/75">I may need more info</span>
        )}
      </div>
      {!message.isLoading && !isUser && canRenderAssistantExtras && (
        <div className="mt-2 w-full max-w-[92%] pl-7 sm:max-w-[78%]">
          <AISearchResults
            properties={canRenderProperties ? message.properties : []}
            suggestions={message.suggestions}
            intent={message.intent}
            mapUrl={message.mapUrl}
            onSuggestion={onSuggestion}
            onPropertyClick={property => onPropertyClick(property, message)}
          />
          {message.media?.length ? (
            <AIMediaGallery
              media={message.media}
              actionIntent={message.actionIntent}
            />
          ) : null}
          <ComparisonTables tables={message.tables} />
          {canRenderActions && <DownloadActionList actions={message.actions} />}
          {message.responseType === 'property_detail' && message.cards && (
            <AiPropertyDetailCard cards={message.cards} onSuggestion={onSuggestion} />
          )}
          {message.responseType === 'booking_summary' && message.cards && (
            <AiBookingSummaryCard cards={message.cards} onSuggestion={onSuggestion} />
          )}
          {message.responseType === 'room_selection' && message.cards && (
            <AiRoomSelectionGrid cards={message.cards} onSuggestion={onSuggestion} />
          )}
          {message.fullyRevealed && message.actionIntent?.type === 'submit_booking' && onBookingSubmit && (
            <BookingSubmitButton actionIntent={message.actionIntent} onSubmit={onBookingSubmit} />
          )}
          {message.whatsAppUrl && message.fullyRevealed && (
            <a
              href={message.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-emerald-900/30 transition hover:bg-emerald-500"
            >
              <MessageCircle size={15} />
              WhatsApp Manager
            </a>
          )}
          {message.fullyRevealed && (
            <FeedbackBar message={message} onFeedback={onFeedback} />
          )}
        </div>
      )}
      <div className="max-w-[92%] sm:max-w-[78%]">
        {message.isError && message.retryPrompt && (
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/55 dark:hover:border-violet-500/40 dark:hover:text-white/80"
            onClick={() => onRetry(message.retryPrompt!)}
          >
            <AIThinkingOrb size="xs" muted />
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(index => (
        <motion.span
          key={index}
          className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400"
          animate={{ scale: [1, 1.45, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.45, repeat: Infinity, delay: index * 0.15 }}
        />
      ))}
    </div>
  );
}

function renderRichText(text: string) {
  const urlPattern = /(https?:\/\/[^\s)]+)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const isMap = /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(part);
      if (isMap) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="my-2 inline-flex max-w-full items-center gap-2 rounded-full border border-sky-500/20 bg-sky-400/10 px-3 py-1.5 text-sm font-black text-sky-300 underline-offset-2 transition hover:bg-sky-400/15"
          >
            <MapPin size={14} />
            <span className="truncate">View area on Google Maps</span>
          </a>
        );
      }

      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 underline underline-offset-2"
        >
          {part}
        </a>
      );
    }

    return renderBoldText(part, index);
  });
}

function renderBoldText(text: string, parentIndex: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${parentIndex}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${parentIndex}-${index}`}>{part}</span>;
  });
}

function FeedbackBar({
  message,
  onFeedback,
}: {
  message: PublicAIMessage;
  onFeedback: (message: PublicAIMessage, value: 'up' | 'down', reason?: string) => void;
}) {
  const [showComment, setShowComment] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  if (message.feedbackState === 'thanks') {
    return <p className="mt-2 text-xs font-bold text-emerald-400">Thanks for the feedback!</p>;
  }
  if (message.feedbackState === 'noted') {
    return <p className="mt-2 text-xs font-bold text-white/35">Noted</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/35 dark:hover:border-emerald-500/35 dark:hover:text-emerald-400"
          onClick={() => onFeedback(message, 'up')}
          aria-label="Good response"
        >
          <ThumbsUp size={13} />
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-400 transition hover:border-rose-300 hover:text-rose-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/35 dark:hover:border-rose-500/35 dark:hover:text-rose-400"
          onClick={() => setShowComment(current => !current)}
          aria-label="Bad response"
          aria-expanded={showComment}
        >
          <ThumbsDown size={13} />
        </button>
      </div>
      {showComment && (
        <div className="grid max-w-sm gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/[0.07] dark:bg-white/[0.04]">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 dark:border-white/[0.08] dark:bg-[#181030] dark:text-white/65"
            value={reason}
            aria-label="Response issue"
            onChange={event => setReason(event.target.value)}
          >
            <option value="">Choose issue</option>
            <option value="Wrong location">Wrong location</option>
            <option value="Not what I meant">Not what I meant</option>
            <option value="Missing data">Missing data</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            className="min-h-16 resize-none rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 dark:border-white/[0.08] dark:text-white/65 dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
            value={comment}
            maxLength={300}
            placeholder="Optional comment"
            aria-label="Optional feedback comment"
            onChange={event => setComment(event.target.value)}
          />
          <button
            type="button"
            className="h-9 rounded-lg bg-violet-700 px-3 text-xs font-black text-white transition hover:bg-violet-600 disabled:opacity-50"
            disabled={!reason && !comment.trim()}
            onClick={() => onFeedback(message, 'down', [reason, comment.trim()].filter(Boolean).join(': '))}
          >
            Send feedback
          </button>
        </div>
      )}
    </div>
  );
}

function ComparisonTables({ tables }: { tables?: AIComparisonTable[] }) {
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const table = tables?.[0];
  const sortedRows = useMemo(() => {
    if (!table) return [];
    if (!sort) return table.rows;

    return [...table.rows].sort((left, right) => {
      const leftValue = String(left[sort.column] ?? '');
      const rightValue = String(right[sort.column] ?? '');
      const result = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? result : -result;
    });
  }, [sort, table]);

  if (!tables?.length) return null;

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.04]">
      <table className="min-w-full text-left text-xs text-slate-700 dark:text-white/65">
        <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-400 dark:bg-white/[0.04] dark:text-white/35">
          <tr>
            {table!.columns.map(column => (
              <th key={column} className="px-3 py-2 font-black">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left transition hover:text-slate-900 dark:hover:text-white/60"
                  onClick={() => setSort(current => ({
                    column,
                    direction: current?.column === column && current.direction === 'asc' ? 'desc' : 'asc',
                  }))}
                >
                  {column}
                  {sort?.column === column && <span>{sort.direction === 'asc' ? 'A-Z' : 'Z-A'}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr key={index} className={index % 2 !== 0 ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}>
              {table!.columns.map(column => (
                <td key={column} className="px-3 py-2 font-semibold">{String(row[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DownloadActionList({ actions }: { actions?: AIContextAction[] }) {
  const downloads = actions?.filter(action => action.type === 'pdf_download' || action.type === 'download') ?? [];
  if (!downloads.length) return null;

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/[0.07] dark:bg-white/[0.04]">
      {downloads.map((action, index) => {
        const url = action.url ?? action.href;
        if (!url) return null;
        return (
          <a
            key={`${url}-${index}`}
            href={url}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:bg-white/[0.04] dark:text-white/55 dark:hover:bg-white/[0.08] dark:hover:text-white/80"
          >
            <span className="truncate">{action.label ?? action.title ?? 'PDF download'}</span>
            <Download size={13} />
          </a>
        );
      })}
    </div>
  );
}

function AiBookingSummaryCard({
  cards,
  onSuggestion,
}: {
  cards: Record<string, unknown>;
  onSuggestion?: (s: string) => void;
}) {
  const rows = [
    { label: 'Property', value: cards.property as string | undefined },
    { label: 'Room',     value: cards.room ? `Room ${cards.room as string}` : undefined },
    { label: 'Move-in',  value: cards.move_in
        ? new Date(cards.move_in as string).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
        : undefined },
    { label: 'Name',     value: cards.name as string | undefined },
    { label: 'Email',    value: cards.email as string | undefined },
    { label: 'Phone',    value: cards.phone as string | undefined },
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
            <span className="max-w-[60%] truncate text-right text-[11px] font-black text-white/85">{row.value}</span>
          </div>
        ))}
      </div>
      {onSuggestion && (
        <div className="flex gap-2 border-t border-violet-500/15 px-4 py-3">
          <button
            type="button"
            onClick={() => onSuggestion('Yes, confirm')}
            className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-black text-white transition hover:bg-emerald-500"
          >
            ✅ Confirm
          </button>
          <button
            type="button"
            onClick={() => onSuggestion('No, cancel')}
            className="flex-1 rounded-lg border border-white/[0.08] py-2 text-xs font-black text-white/55 transition hover:bg-white/[0.05]"
          >
            ❌ Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function AiRoomSelectionGrid({
  cards,
  onSuggestion,
}: {
  cards: Record<string, unknown>;
  onSuggestion?: (s: string) => void;
}) {
  const items = (cards.items ?? []) as Array<Record<string, unknown>>;
  if (!items.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-violet-200/60">
        {(cards.total as number) ?? items.length} available room{items.length !== 1 ? 's' : ''} — tap to select
      </p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((room) => {
          const idx  = room.index as number;
          const num  = room.room_number as string | undefined;
          const floor = room.floor as string | undefined;
          const block = room.block as string | undefined;
          const price = room.price_label as string | undefined;
          const pending = (room.pending_bookings_count as number) ?? 0;

          return (
            <button
              key={(room.uuid as string) ?? idx}
              type="button"
              onClick={() => onSuggestion?.(`#${idx}`)}
              className="group relative rounded-xl border border-white/[0.08] bg-white/[0.05] p-3 text-left transition hover:border-violet-400/40 hover:bg-violet-500/[0.08] dark:border-white/[0.07] dark:bg-white/[0.04]"
            >
              {pending > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                  {pending} pending
                </span>
              )}
              <p className="text-sm font-black text-violet-400">
                {num ? `Room ${num}` : `#${idx}`}
              </p>
              {(floor || block) && (
                <p className="mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-white/35">
                  {[floor && `Floor ${floor}`, block && `Block ${block}`].filter(Boolean).join(' · ')}
                </p>
              )}
              {price && <p className="mt-1.5 text-sm font-black text-slate-900 dark:text-white">{price}</p>}
              <p className="mt-1 text-[10px] font-semibold text-slate-400 transition-colors group-hover:text-violet-400 dark:text-white/25">
                Select →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingSubmitButton({
  actionIntent,
  onSubmit,
}: {
  actionIntent: AIActionIntent;
  onSubmit: (actionIntent: AIActionIntent) => Promise<void>;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const raw = actionIntent as unknown as Record<string, unknown>;
  const label = (raw.label as string | undefined) || 'Submit Booking Request';

  if (state === 'done') return null;

  const handleClick = async () => {
    setState('loading');
    try {
      await onSubmit(actionIntent);
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
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60"
      >
        {state === 'loading' ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Submitting…
          </>
        ) : label}
      </button>
      {state === 'error' && (
        <p className="text-xs font-semibold text-rose-400">Failed to submit. Please try again.</p>
      )}
    </div>
  );
}

function AiPropertyDetailCard({
  cards,
  onSuggestion,
}: {
  cards: Record<string, unknown>;
  onSuggestion?: (s: string) => void;
}) {
  const name        = cards.title as string | undefined;
  const type        = cards.house_type as string | undefined;
  const city        = cards.city as string | undefined;
  const neighbourhood = cards.neighbourhood as string | undefined;
  const address     = cards.address_display as string | undefined;
  const rentMin     = cards.rent_min as number | null | undefined;
  const rentMax     = cards.rent_max as number | null | undefined;
  const available   = cards.available_units as number | undefined;
  const amenities   = (cards.amenities as string[] | undefined) ?? [];
  const water       = cards.water_available as boolean | undefined;
  const internet    = cards.internet_available as boolean | undefined;
  const parking     = cards.parking_available as boolean | undefined;
  const security    = cards.security_level as string | undefined;
  const rating      = cards.property_rating as number | undefined;
  const slug        = cards.slug as string | undefined;

  const priceLabel = rentMin && rentMax && rentMin !== rentMax
    ? `KES ${rentMin.toLocaleString()} – ${rentMax.toLocaleString()}/mo`
    : rentMin
      ? `KES ${rentMin.toLocaleString()}/mo`
      : null;

  const locationParts = [neighbourhood, city].filter(Boolean);

  const quickFeatures = [
    water    && 'Water',
    internet && 'WiFi',
    parking  && 'Parking',
    security && security !== 'none' && `Security: ${security}`,
  ].filter(Boolean) as string[];

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
      {/* Header */}
      <div className="border-b border-violet-500/15 px-4 py-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-violet-300">Property Details</p>
        {name && <p className="mt-1 text-sm font-black text-white/90">{name}</p>}
        {type && (
          <span className="mt-1 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-black text-violet-300">
            {type.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="divide-y divide-white/[0.05]">
        {locationParts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">Location</span>
            <span className="text-right text-[11px] font-black text-white/85">{locationParts.join(', ')}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">Address</span>
            <span className="max-w-[60%] truncate text-right text-[11px] font-black text-white/85">{address}</span>
          </div>
        )}
        {priceLabel && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">Rent</span>
            <span className="text-right text-[11px] font-black text-emerald-400">{priceLabel}</span>
          </div>
        )}
        {available !== undefined && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">Available Rooms</span>
            <span className={`text-right text-[11px] font-black ${available > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {available > 0 ? `${available} room${available !== 1 ? 's' : ''}` : 'None'}
            </span>
          </div>
        )}
        {rating && rating > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold text-white/40">Rating</span>
            <span className="text-right text-[11px] font-black text-amber-400">★ {rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Features */}
      {(quickFeatures.length > 0 || amenities.length > 0) && (
        <div className="border-t border-violet-500/15 px-4 py-3">
          <p className="mb-2 text-[10px] font-black uppercase text-white/30">Features</p>
          <div className="flex flex-wrap gap-1.5">
            {quickFeatures.map(f => (
              <span key={f} className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                {f}
              </span>
            ))}
            {amenities.slice(0, 6).map(a => (
              <span key={a} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-white/55">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-violet-500/15 px-4 py-3">
        {available && available > 0 && onSuggestion && (
          <button
            type="button"
            onClick={() => onSuggestion(`Book ${name ?? 'this property'}`)}
            className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-black text-white transition hover:bg-violet-500"
          >
            Book Now
          </button>
        )}
        {slug && (
          <a
            href={`/listings/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-white/[0.08] py-2 text-center text-xs font-black text-white/55 transition hover:bg-white/[0.05]"
          >
            View Listing
          </a>
        )}
        {onSuggestion && (
          <button
            type="button"
            onClick={() => onSuggestion('Show available rooms')}
            className="flex-1 rounded-lg border border-white/[0.08] py-2 text-xs font-black text-white/55 transition hover:bg-white/[0.05]"
          >
            See Rooms
          </button>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

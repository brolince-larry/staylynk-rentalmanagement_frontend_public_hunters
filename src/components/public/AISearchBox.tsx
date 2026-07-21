import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mic, Search, Sparkles } from 'lucide-react';
import { useStore } from '../../stores/listingStore';
import { useSeekerStore } from '../../stores/seekerStore';
import { parseNaturalLanguageSearch } from '../../utils/publicSearch';
import { getStoredAiSessionToken, storeAiSessionToken } from '../../services/aiSession';
import {
  clarificationChipsFor,
  createPublicAISession,
  fuzzyIntentToFilters,
  isIntentReady,
  publicAIChat,
} from '../../services/aiChat';
import type { SearchFilters } from '../../types';

const EXAMPLES = [
  'Find me a modern apartment under 25k',
  'Family house near schools',
  'Bedsitter near university',
  'Pet friendly apartment with parking',
];

// Gradual rollout: AI chat parsing is admin/superadmin only on the backend for
// now, so skip straight to the client-side fallback (parse + /browse) instead
// of round-tripping to a gated endpoint. Flip to true once AI is enabled here.
const AI_SEARCH_ENABLED: boolean = false;

interface AISearchBoxProps {
  compact?: boolean;
  className?: string;
}

export function AISearchBox({ compact = false, className = '' }: AISearchBoxProps) {
  const navigate  = useNavigate();
  const setFilters = useStore(s => s.setFilters);
  const addPrompt  = useSeekerStore(s => s.addPrompt);
  const [query, setQuery] = useState('');
  const [placeholder] = useState(EXAMPLES[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [clarificationChips, setClarificationChips] = useState<string[] | null>(null);
  const [clarificationText, setClarificationText] = useState<string | null>(null);
  const [inputDisabledReason, setInputDisabledReason] = useState<string | null>(null);

  const submit = async (value: string) => {
    const prompt = value.trim();
    if (!prompt || inputDisabledReason) return;

    addPrompt(prompt);
    setClarificationChips(null);
    setClarificationText(null);
    setIsSearching(true);

    if (!AI_SEARCH_ENABLED) {
      setFilters(parseNaturalLanguageSearch(prompt));
      navigate('/browse');
      setIsSearching(false);
      return;
    }

    try {
      // Step 1: parse intent via /ai/chat
      const existing = getStoredAiSessionToken();
      const session  = await createPublicAISession(existing);
      const token    = session.data.session_token;
      storeAiSessionToken(token);

      const chatResponse = await publicAIChat(prompt, token);
      if (chatResponse.data.session_token) {
        storeAiSessionToken(chatResponse.data.session_token);
      }

      // Moderation check
      const modAction = chatResponse.data.meta?.moderation?.action;
      if (modAction === 'temporary_mute') {
        setInputDisabledReason('AI search is temporarily muted.');
        return;
      } else if (modAction === 'session_suspension') {
        setInputDisabledReason('This AI session is suspended.');
        return;
      }

      const fuzzyIntent = chatResponse.data.context?.fuzzy_intent;
      const ready = isIntentReady(chatResponse.data);

      if (!ready) {
        // Show clarification chips — don't navigate yet
        const chips =
          chatResponse.data.suggestions?.length
            ? chatResponse.data.suggestions
            : clarificationChipsFor(fuzzyIntent?.missing ?? []);
        setClarificationText(chatResponse.data.message ?? null);
        setClarificationChips(chips);
        return;
      }

      // Step 2+3 happen server-side on the browse page — pass parsed filters
      const filters: SearchFilters = fuzzyIntentToFilters(fuzzyIntent, prompt);
      setFilters(filters);
      navigate('/browse');
    } catch {
      // Fall back to client-side NLP parse so the user still reaches browse
      setFilters(parseNaturalLanguageSearch(prompt));
      navigate('/browse');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.form
      className={`relative overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:border-white/[0.12] dark:bg-white/[0.07] dark:shadow-black/50 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        void submit(query);
      }}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/25">
          <Sparkles size={18} />
        </span>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          type="search"
          placeholder={inputDisabledReason ?? placeholder}
          disabled={!!inputDisabledReason}
          className={`${compact ? 'h-11 text-sm' : 'h-14 text-base sm:text-lg'} min-w-0 flex-1 bg-transparent font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/40`}
          aria-label="AI house search"
        />
        <button
          type="button"
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.1] dark:text-white/40 dark:hover:border-white/20 dark:hover:bg-white/[0.07] sm:flex"
          aria-label="Voice search"
          title="Voice search"
        >
          <Mic size={17} />
        </button>
        <button
          type="submit"
          disabled={isSearching || !!inputDisabledReason}
          className={`${compact ? 'h-11 px-4' : 'h-12 px-5'} inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60`}
        >
          {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          <span className="hidden sm:inline">{isSearching ? 'Thinking…' : 'Search'}</span>
        </button>
      </div>

      {/* Clarification notice */}
      {clarificationText && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold leading-5 text-amber-800 dark:border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-300">
          {clarificationText}
        </p>
      )}

      {/* Clarification chips — shown when confidence < 0.70 or missing fields */}
      {clarificationChips && clarificationChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
          {clarificationChips.map(chip => (
            <button
              key={chip}
              type="button"
              className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
              onClick={() => {
                const combined = query.trim() ? `${query} ${chip}` : chip;
                setQuery(combined);
                void submit(combined);
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Example chips — only shown when no clarification pending */}
      {!clarificationChips && !compact && (
        <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
          {EXAMPLES.slice(0, 3).map(example => (
            <button
              key={example}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-white/55 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              onClick={() => { setQuery(example); void submit(example); }}
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </motion.form>
  );
}

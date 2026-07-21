import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useStore } from '../../stores/listingStore';
import { useSeekerStore } from '../../stores/seekerStore';
import { parseNaturalLanguageSearch } from '../../utils/publicSearch';

const EXAMPLES = [
  'Modern apartment under 25k',
  'Family house near schools',
  'Bedsitter near university',
];

interface PlainSearchBoxProps {
  compact?: boolean;
  className?: string;
}

/**
 * Non-AI stand-in for AISearchBox — parses area/budget/type keywords
 * client-side and routes to /browse. See AISearchBox.tsx for the v2 version.
 */
export function PlainSearchBox({ compact = false, className = '' }: PlainSearchBoxProps) {
  const navigate = useNavigate();
  const setFilters = useStore(s => s.setFilters);
  const addPrompt = useSeekerStore(s => s.addPrompt);
  const [query, setQuery] = useState('');

  const submit = (value: string) => {
    const prompt = value.trim();
    if (!prompt) return;
    addPrompt(prompt);
    setFilters(parseNaturalLanguageSearch(prompt));
    navigate('/browse');
  };

  return (
    <motion.form
      className={`relative overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:border-white/[0.12] dark:bg-white/[0.07] dark:shadow-black/50 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        submit(query);
      }}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/25">
          <Search size={18} />
        </span>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          type="search"
          placeholder="Search by area, property type, or budget"
          className={`${compact ? 'h-11 text-sm' : 'h-14 text-base sm:text-lg'} min-w-0 flex-1 bg-transparent font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/40`}
          aria-label="Search homes"
        />
        <button
          type="submit"
          className={`${compact ? 'h-11 px-4' : 'h-12 px-5'} inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500`}
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
          {EXAMPLES.map(example => (
            <button
              key={example}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-white/55 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              onClick={() => { setQuery(example); submit(example); }}
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </motion.form>
  );
}

import { useEffect, useMemo, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { History, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { AIThinkingOrb } from './AIThinkingOrb';
import { RolePromptSuggestions } from './RolePromptSuggestions';
import { AIChatThread } from './AIChatThread';
import type { PublicAIMessage } from './AIMessageBubble';

export function AIAssistantModal({
  thinking,
  typing,
  status,
  role,
  input,
  messages,
  onInputChange,
  onSubmit,
  onPrompt,
  onRetry,
  onSuggestion,
  onPropertyClick,
  onFeedback,
  onClose,
  onReset,
  onLoadHistory,
  disabled,
  disabledReason,
}: {
  thinking: boolean;
  typing: boolean;
  status: 'idle' | 'thinking' | 'typing' | 'error';
  role?: string;
  input: string;
  messages: PublicAIMessage[];
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onPrompt: (prompt: string) => void;
  onRetry: (prompt: string) => void;
  onSuggestion: (suggestion: string) => void;
  onPropertyClick: Parameters<typeof AIChatThread>[0]['onPropertyClick'];
  onFeedback: Parameters<typeof AIChatThread>[0]['onFeedback'];
  onClose: () => void;
  onReset: () => void;
  onLoadHistory: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const hasMessages = messages.length > 0;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const placeholder = useMemo(() => randomPlaceholder(), []);
  const roleBadge = roleBadgeFor(role);
  const counterVisible = input.length >= 1800;

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = '52px';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [input]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <motion.aside
      className="fixed bottom-24 right-5 z-50 flex h-[min(760px,calc(100dvh-7rem))] max-h-[calc(100dvh-7rem)] w-[min(780px,calc(100vw-2rem))] min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#09090f] text-white max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:rounded-none"
      style={{
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px -12px rgba(10,4,24,0.9), 0 8px 32px -4px rgba(139,92,246,0.18)',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.17 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3 backdrop-blur-2xl sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AIThinkingOrb size="sm" thinking={thinking || typing} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-black text-white">{statusLabel(status)}</p>
              {roleBadge && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${roleBadge.className}`}>
                  {roleBadge.label}
                </span>
              )}
            </div>
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-4 text-white/40">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(status)}`} />
              <span className="truncate">Kenya property and rental assistant</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="rounded-xl p-2 text-white/40 transition-all hover:bg-white/[0.07] hover:text-white"
            onClick={onReset}
            aria-label="Reset assistant conversation"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-white/40 transition-all hover:bg-white/[0.07] hover:text-white"
            onClick={onLoadHistory}
            aria-label="Load assistant history"
          >
            <History size={16} />
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-white/40 transition-all hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col">
        {!hasMessages && (
          <div className="shrink-0 px-4 pb-3 pt-6 sm:px-5">
            <div className="mb-6 flex flex-col items-center text-center">
              <AIThinkingOrb size="lg" thinking={thinking} />
              <h2 className="mt-4 bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-300 bg-clip-text text-xl font-black leading-tight text-transparent">
                StayLynk AI
              </h2>
              <p className="mt-2 max-w-[260px] text-sm font-medium leading-6 text-white/40">
                Find your next home. Ask about properties, areas, budgets, and amenities.
              </p>
            </div>
            <RolePromptSuggestions onSelect={onPrompt} />
          </div>
        )}

        <div className="ai-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-4 sm:px-5 sm:pr-3">
          <AIChatThread
            messages={messages}
            onRetry={onRetry}
            onSuggestion={onSuggestion}
            onPropertyClick={onPropertyClick}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Input form */}
      <form
        className="sticky bottom-0 shrink-0 border-t border-white/[0.07] bg-white/[0.03] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-2xl sm:p-4"
        onSubmit={onSubmit}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={event => onInputChange(event.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? (disabledReason ?? 'AI session is temporarily unavailable') : placeholder}
            disabled={disabled}
            rows={1}
            maxLength={2000}
            className="min-h-[52px] min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-base font-semibold leading-6 text-white outline-none placeholder:text-white/30 disabled:opacity-40"
            aria-label="Message AI assistant"
          />
          <button
            type="submit"
            disabled={thinking || disabled}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-800/50 disabled:opacity-50"
            aria-label="Send message"
          >
            {thinking ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-medium text-white/30">
          <p>AI can make mistakes. Always verify details.</p>
          {counterVisible && (
            <p className={input.length >= 1950 ? 'text-amber-400' : ''}>{input.length}/2000</p>
          )}
        </div>
      </form>
    </motion.aside>
  );
}

function randomPlaceholder() {
  const placeholders = [
    'Search for a bedsitter in Westlands...',
    'Find a 2-bed near Kilimani under 25k',
    'Family home with parking in Kasarani',
    'Affordable studio near the CBD...',
    'Bedsitter near university with WiFi',
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}

function statusLabel(status: 'idle' | 'thinking' | 'typing' | 'error') {
  if (status === 'thinking') return 'AI is thinking...';
  if (status === 'typing') return 'Typing...';
  if (status === 'error') return 'Connection issue';
  return 'StayLynk AI';
}

function statusDotClass(status: 'idle' | 'thinking' | 'typing' | 'error') {
  if (status === 'thinking') return 'animate-pulse bg-amber-400';
  if (status === 'typing') return 'bg-sky-400';
  if (status === 'error') return 'bg-rose-500';
  return 'bg-emerald-400';
}

function roleBadgeFor(role: string | undefined) {
  switch (role) {
    case 'superadmin':
      return { label: 'Platform Admin', className: 'bg-purple-500/20 text-purple-300' };
    case 'admin':
      return { label: 'Property Admin', className: 'bg-blue-500/20 text-blue-300' };
    case 'manager':
      return { label: 'Manager', className: 'bg-teal-500/20 text-teal-300' };
    case 'tenant':
      return { label: 'Tenant', className: 'bg-green-500/20 text-green-300' };
    default:
      return null;
  }
}

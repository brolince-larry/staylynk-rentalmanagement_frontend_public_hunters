import { create } from 'zustand';

// ─── Conversation persistence ─────────────────────────────────────────────────
// Messages are stored as plain JSON (no Date objects, no class instances).
// AIPage restores them by converting timestamp strings back to Date.

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
  timestamp: string; // ISO-8601
  fullyRevealed: boolean;
  suggestions?: string[];
  // loosely typed so seekerStore stays free of ../types imports
  properties?: unknown[];
  intent?: unknown;
  learningApplied?: boolean;
  media?: unknown[];
  actionIntent?: unknown;
}

export interface StoredConversation {
  id: string;
  title: string;       // first user message, trimmed to ≤50 chars
  sessionToken: string | null;
  messages: StoredMessage[];
  updatedAt: number;   // Date.now()
}

const LS_KEY = 'staylynk_conversations';
const MAX_CONVS = 12;

function loadConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredConversation[]) : [];
  } catch {
    return [];
  }
}

function persistConversations(convs: StoredConversation[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
  } catch {
    /* quota exceeded — skip */
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface SeekerState {
  savedSlugs: string[];
  /** Legacy list used by AISearchBox chips / AIPage still uses addPrompt for
   *  the sidebar Recent section when conversations are empty */
  recentPrompts: string[];
  conversations: StoredConversation[];
  toggleSaved: (slug: string) => void;
  addPrompt: (prompt: string) => void;
  isSaved: (slug: string) => boolean;
  /** Upsert or create a conversation entry */
  saveConversation: (conv: Omit<StoredConversation, 'updatedAt'>) => void;
  /** Remove a conversation */
  deleteConversation: (id: string) => void;
  getConversation: (id: string) => StoredConversation | undefined;
}

export const useSeekerStore = create<SeekerState>((set, get) => ({
  savedSlugs: [],
  recentPrompts: [],
  conversations: loadConversations(),

  toggleSaved: slug =>
    set(state => ({
      savedSlugs: state.savedSlugs.includes(slug)
        ? state.savedSlugs.filter(item => item !== slug)
        : [slug, ...state.savedSlugs],
    })),

  addPrompt: prompt => {
    const value = prompt.trim();
    if (!value) return;
    set(state => ({
      recentPrompts: [value, ...state.recentPrompts.filter(item => item !== value)].slice(0, 6),
    }));
  },

  isSaved: slug => get().savedSlugs.includes(slug),

  saveConversation: conv => {
    const entry: StoredConversation = { ...conv, updatedAt: Date.now() };
    set(state => {
      const without = state.conversations.filter(c => c.id !== conv.id);
      const next = [entry, ...without].slice(0, MAX_CONVS);
      persistConversations(next);
      return { conversations: next };
    });
  },

  deleteConversation: id => {
    set(state => {
      const next = state.conversations.filter(c => c.id !== id);
      persistConversations(next);
      return { conversations: next };
    });
  },

  getConversation: id => get().conversations.find(c => c.id === id),
}));

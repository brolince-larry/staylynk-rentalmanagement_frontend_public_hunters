import type {
  AIChatResponse,
  AiHistoryResponse,
  AiSessionResponse,
  FuzzyIntent,
  PublicChatResponse,
  PublicSearchResponse,
  RankableProperty,
  SearchFilters,
} from '../types';
import { API_CONFIG } from '../config/api';

type ApiFetchError = Error & { status?: number; payload?: unknown };

function aiUrl(path: string) {
  return `${API_CONFIG.API_V1}${path}`;
}

async function readJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(
      typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : fallbackMessage,
    ) as ApiFetchError;
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

// ─── AI-specific request headers ─────────────────────────────────────────────
// X-AI-Internal-Token and X-AI-Signature require VITE_AI_INTERNAL_TOKEN to be set.
// X-Client-Ref and X-AI-Timestamp are always included.

async function aiHeaders(ts: number): Promise<Record<string, string>> {
  const base: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Client-Ref': 'public',
    'X-AI-Timestamp': String(ts),
  };

  const token = (import.meta.env.VITE_AI_INTERNAL_TOKEN as string | undefined) ?? '';
  if (!token) return base;

  base['X-AI-Internal-Token'] = token;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(token),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}:public`));
    base['X-AI-Signature'] = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Web Crypto not available — omit signature
  }

  return base;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function createPublicAISession(sessionToken?: string | null) {
  const res = await fetch(aiUrl('/ai/session'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: sessionToken ?? undefined }),
  });
  return readJsonResponse<{ success: boolean; data: AiSessionResponse }>(res, 'AI session failed');
}

// ─── Step 1: Chat — intent parser + clarifier ─────────────────────────────────
// POST /ai/chat
// Wraps message in { context, payload } as required by the Go service.
// Returns PublicChatResponse with data.confidence_score and data.context.fuzzy_intent.

export async function publicAIChat(
  message: string,
  sessionToken?: string | null,
): Promise<PublicChatResponse> {
  const ts = Math.floor(Date.now() / 1000);
  const res = await fetch(aiUrl('/ai/chat'), {
    method: 'POST',
    headers: await aiHeaders(ts),
    body: JSON.stringify({
      message,
      session_token: sessionToken ?? undefined,
    }),
  });
  const parsed = await readJsonResponse<PublicChatResponse>(res, 'AI chat failed');
  // Treat a session_expired flag in the body the same as an HTTP 401
  if (parsed.data?.session_expired) {
    const err = new Error('Session expired') as ApiFetchError;
    err.status = 401;
    throw err;
  }
  return parsed;
}

// ─── Step 3: Rank — re-ranks properties YOU pass ──────────────────────────────
// POST /ai/search
// /search is NOT a database query — it re-ranks a list of properties.
// Always fetch properties from Laravel first (step 2), then pass them here.
// Sort the returned `properties` by ai_rank_score DESC before rendering.

export async function publicAIRankSearch(
  query: string,
  properties: RankableProperty[],
  sessionToken?: string | null,
): Promise<PublicSearchResponse> {
  const ts = Math.floor(Date.now() / 1000);
  const res = await fetch(aiUrl('/ai/search'), {
    method: 'POST',
    headers: await aiHeaders(ts),
    body: JSON.stringify({
      query,
      session_token: sessionToken ?? undefined,
      properties,
    }),
  });
  return readJsonResponse<PublicSearchResponse>(res, 'AI rank failed');
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function publicAIHistory(sessionToken: string) {
  const ts = Math.floor(Date.now() / 1000);
  const res = await fetch(
    aiUrl(`/ai/history?session_token=${encodeURIComponent(sessionToken)}`),
    { method: 'GET', headers: await aiHeaders(ts) },
  );
  return readJsonResponse<{ success: boolean; data: AiHistoryResponse }>(res, 'AI history failed');
}

// ─── Typed AdminChat (used by listingApi.aiChat hook) ────────────────────────
// Kept for backward compatibility with the admin/tenant chat interface.

export async function sendAIMessage(params: {
  message: string;
  sessionToken?: string | null;
  token?: string | null;
}) {
  const ts = Math.floor(Date.now() / 1000);
  const headers = await aiHeaders(ts);
  if (params.token) headers['Authorization'] = `Bearer ${params.token}`;

  const res = await fetch(aiUrl('/ai/chat'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: params.message,
      session_token: params.sessionToken ?? undefined,
    }),
  });
  return readJsonResponse<AIChatResponse>(res, 'AI request failed');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when the chat response has enough confidence and no missing fields. */
export function isIntentReady(data: PublicChatResponse['data']): boolean {
  const intent = data.context?.fuzzy_intent;
  return (data.confidence_score ?? 0) >= 0.70 && (intent?.missing?.length ?? 1) === 0;
}

/** Convert FuzzyIntent → SearchFilters for the Laravel GET /listings call. */
export function fuzzyIntentToFilters(
  intent: FuzzyIntent | undefined,
  fallbackQuery: string,
): SearchFilters {
  if (!intent) return { search: fallbackQuery, sort: 'smart', per_page: 20 };
  return {
    search: fallbackQuery,
    location: intent.location ?? undefined,
    city: intent.location ?? undefined,
    house_type: intent.house_type ?? undefined,
    budget_min: intent.budget_min ?? undefined,
    min_price: intent.budget_min ?? undefined,
    budget_max: intent.budget_max ?? undefined,
    max_price: intent.budget_max ?? undefined,
    amenities: intent.amenities.length > 0 ? intent.amenities : undefined,
    sort: 'smart',
    per_page: 20,
  };
}

/** Returns context-aware clarification chips when the AI needs more info. */
export function clarificationChipsFor(missing: string[]): string[] {
  const chips: string[] = [];
  if (missing.includes('location'))
    chips.push('Westlands', 'Kilimani', 'Kasarani', 'Lavington');
  if (missing.includes('budget'))
    chips.push('Under 15k', '15k–25k', '25k–40k', 'Over 40k');
  if (missing.includes('house_type'))
    chips.push('Bedsitter', '1 Bedroom', '2 Bedrooms', 'Studio');
  return chips;
}

export function typeWords(
  text: string,
  speedMs: number,
  onUpdate: (value: string) => void,
  onDone?: () => void,
) {
  const words = text.split(' ');
  let index = 0;

  const timer = window.setInterval(() => {
    index += 1;
    onUpdate(words.slice(0, index).join(' '));
    if (index >= words.length) {
      window.clearInterval(timer);
      onDone?.();
    }
  }, speedMs);

  return () => window.clearInterval(timer);
}

export function fallbackMessage(action: string) {
  switch (action) {
    case 'property_search':
      return 'I could not find matching houses yet. Try widening your budget, changing location, or removing one amenity.';
    default:
      return 'I could not find matching houses yet. Try widening your budget, the location, or removing one amenity.';
  }
}

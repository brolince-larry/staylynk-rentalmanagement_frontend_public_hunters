import axios from 'axios';
import type {
  HunterSessionData,
  HunterChatData,
  HunterBookPayload,
  HunterBookResponse,
  HunterProperty,
  HunterListing,
  HunterMatchData,
  HunterCompareData,
} from '../types/hunter';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { API_CONFIG } from '../config/api';

// ─── Hunter axios instance (separate from the auth API) ──────────────────────

const hunterHttp = axios.create({
  baseURL:         API_CONFIG.API_V1,
  timeout:         15_000,
  withCredentials: false,
  headers:         { Accept: 'application/json' },
});

// Attach device fingerprint to every hunter request.
hunterHttp.interceptors.request.use(async config => {
  config.headers['X-Device-FP'] = await getDeviceFingerprint();
  return config;
});

// Normalize errors — never expose stack traces or raw validation arrays.
hunterHttp.interceptors.response.use(
  r => r,
  err => {
    if (axios.isCancel(err)) return Promise.reject(err);
    return Promise.reject({
      status:  err.response?.status  ?? 0,
      message: err.response?.data?.message ?? '',
    });
  },
);

// ─── Session storage (always sessionStorage — clears on tab close) ────────────

const SESSION_KEY = 'staylynk_hunter_session';

export function getStoredHunterSession(): string | null {
  try {
    // Check sessionStorage first, then migrate any stale localStorage copy.
    return (
      window.sessionStorage.getItem(SESSION_KEY) ??
      window.localStorage.getItem(SESSION_KEY)
    );
  } catch { return null; }
}

export function storeHunterSession(token: string): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, token);
    // Remove any stale copy from localStorage.
    window.localStorage.removeItem(SESSION_KEY);
  } catch { /* storage unavailable */ }
}

export function clearHunterSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch { /* storage unavailable */ }
}

// ─── API ──────────────────────────────────────────────────────────────────────

interface ApiOk<T> {
  success: boolean;
  data: T;
  message?: string;
  session_expired?: boolean;
}

export const hunterApi = {
  session: (sessionToken?: string | null) =>
    hunterHttp
      .post<ApiOk<HunterSessionData>>(
        '/hunter/session',
        sessionToken ? { session_token: sessionToken } : {},
      )
      .then(r => r.data),

  chat: (sessionToken: string | null, message: string, extras?: { selected_listing_uuid?: string | null }) =>
    hunterHttp
      .post<ApiOk<HunterChatData>>('/hunter/chat', {
        message,
        ...(sessionToken ? { session_token: sessionToken } : {}),
        ...extras,
      })
      .then(r => r.data),

  book: (payload: HunterBookPayload) =>
    hunterHttp
      .post<ApiOk<HunterBookResponse>>('/hunter/book', payload)
      .then(r => r.data),

  property: (slug: string, sessionToken: string) =>
    hunterHttp
      .get<ApiOk<HunterProperty>>(`/hunter/property/${slug}`, {
        params: { session_token: sessionToken },
      })
      .then(r => r.data),

  match: (params: {
    location?: string;
    budget_min?: number;
    budget_max?: number;
    type?: string;
    amenities?: string[];
    bedrooms?: number;
  }) =>
    hunterHttp
      .post<ApiOk<HunterMatchData>>('/hunter/match', params)
      .then(r => r.data),

  compare: (room_ids: string[]) =>
    hunterHttp
      .post<ApiOk<HunterCompareData>>('/hunter/compare', { room_ids })
      .then(r => r.data),

  search: (params: {
    city?: string;
    neighbourhood?: string;
    budget_min?: number;
    budget_max?: number;
    house_type?: string;
    bedrooms?: number;
    amenities?: string[];
    page?: number;
  }) =>
    hunterHttp
      .get<ApiOk<{ items: HunterListing[]; total: number; page: number; has_more: boolean }>>(
        '/hunter/search',
        { params },
      )
      .then(r => r.data),
};

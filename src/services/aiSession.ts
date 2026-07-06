export const AI_SESSION_STORAGE_KEY = 'staylynk_ai_session';
const LEGACY_AI_SESSION_STORAGE_KEY = 'staylynk_public_ai_session';

/**
 * Authenticated users get a persistent session (localStorage).
 * Guest users get a tab-scoped session (sessionStorage — cleared on tab close).
 */
function getStorage(): Storage {
  if (typeof window === 'undefined') return null!;
  const isAuth = !!window.localStorage.getItem('auth_token');
  return isAuth ? window.localStorage : window.sessionStorage;
}

export function getStoredAiSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Check the appropriate storage first
  const primary = getStorage().getItem(AI_SESSION_STORAGE_KEY);
  if (primary) return primary;
  // Legacy: guests who had a token in localStorage before this change
  return (
    window.localStorage.getItem(AI_SESSION_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_AI_SESSION_STORAGE_KEY)
  );
}

export function storeAiSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  const storage = getStorage();
  storage.setItem(AI_SESSION_STORAGE_KEY, token);
  // Remove from the other storage to avoid stale copies
  if (storage === window.sessionStorage) {
    window.localStorage.removeItem(AI_SESSION_STORAGE_KEY);
  }
  window.localStorage.removeItem(LEGACY_AI_SESSION_STORAGE_KEY);
}

export function clearAiSessionToken(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(AI_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(AI_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_AI_SESSION_STORAGE_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('auth_token');
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('auth_token');
}

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const KEY = 'staylynk-theme';

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  // isManual: true when the user has explicitly set a preference via toggle
  const [isManual, setIsManual] = useState<boolean>(() => getStoredTheme() !== null);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

  // Keep the DOM in sync
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // When there is no user override, track OS preference changes in real-time
  useEffect(() => {
    if (isManual) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'dark' : 'light');

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [isManual]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setIsManual(true);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  /** Reset to OS preference and clear stored override */
  const resetToSystem = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setIsManual(false);
    setTheme(getSystemTheme());
  };

  return { theme, isManual, toggle, resetToSystem };
}

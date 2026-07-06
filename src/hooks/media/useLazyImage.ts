import { useEffect, useState } from 'react';

export type LazyImageState = 'idle' | 'loading' | 'loaded' | 'error';

export function useLazyImage(src: string | null, enabled: boolean, retryKey = 0) {
  const [state, setState] = useState<LazyImageState>('idle');

  useEffect(() => {
    let active = true;
    const timers: number[] = [];
    const deferState = (next: LazyImageState) => {
      const timer = window.setTimeout(() => {
        if (active) setState(next);
      }, 0);
      timers.push(timer);
    };
    const cleanupTimers = () => {
      active = false;
      timers.forEach(timer => window.clearTimeout(timer));
    };

    if (!src || !enabled) {
      deferState('idle');
      return cleanupTimers;
    }

    const image = new Image();
    image.decoding = 'async';
    deferState('loading');

    image.onload = () => {
      if (active) setState('loaded');
    };
    image.onerror = () => {
      if (active) setState('error');
    };
    image.src = src;

    return () => {
      cleanupTimers();
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
    };
  }, [enabled, retryKey, src]);

  return state;
}

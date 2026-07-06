import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '../stores/listingStore';
import { qk } from '../api/listingApi';
import type { VacancyUpdatedEvent } from '../types';
import { API_CONFIG } from '../config/api';

type PusherChannel = {
  bind: (event: string, callback: (data: unknown) => void) => void;
};

type PusherClient = {
  subscribe: (name: string) => PusherChannel;
  unsubscribe: (name: string) => void;
  disconnect: () => void;
};

type PusherConstructor = new (
  key: string,
  options: Record<string, unknown>,
) => PusherClient;

declare global {
  interface Window {
    Pusher?: PusherConstructor;
  }
}

export function useRealtimeListings(city?: string) {
  const pusherRef       = useRef<PusherClient | null>(null);
  const qc              = useQueryClient();
  const applyVacancy    = useStore(s => s.applyVacancyUpdate);
  const markRemoved     = useStore(s => s.markListingRemoved);

  useEffect(() => {
    // Guard: don't connect if Reverb key not configured
    const key = import.meta.env.VITE_REVERB_APP_KEY;
    const Pusher = window.Pusher;
    if (!key) return;
    if (!Pusher) return;

    const pusher = new Pusher(key, {
      wsHost:            API_CONFIG.REVERB.HOST,
      wsPort:            API_CONFIG.REVERB.PORT,
      wssPort:           API_CONFIG.REVERB.PORT,
      forceTLS:          API_CONFIG.REVERB.FORCE_TLS,
      enabledTransports: [API_CONFIG.REVERB.FORCE_TLS ? 'wss' : 'ws'],
      disableStats:      true,
    });

    pusherRef.current = pusher;

    const channels = ['listings'];
    if (city) channels.push(`city.${city.toLowerCase().replace(/\s+/g, '-')}`);

    channels.forEach(name => {
      const ch = pusher.subscribe(name);

      // Room became available or occupied → update unit count in store + cache
      ch.bind('vacancy.updated', data => {
        const vacancy = data as VacancyUpdatedEvent;
        applyVacancy(vacancy);
        // Invalidate specific detail and broad search cache
        qc.invalidateQueries({ queryKey: qk.detail(vacancy.id) });
        qc.invalidateQueries({ queryKey: ['listings', 'search'] });
      });

      // New listing appeared → invalidate search + home caches
      ch.bind('listing.published', () => {
        qc.invalidateQueries({ queryKey: ['listings', 'search'] });
        qc.invalidateQueries({ queryKey: ['listings', 'home'] });
        qc.invalidateQueries({ queryKey: ['listings', 'featured'] });
      });

      // Listing removed → mark gone in store, remove from cache
      ch.bind('listing.unpublished', data => {
        const unpublished = data as { id: string };
        markRemoved(unpublished.id);
        qc.removeQueries({ queryKey: qk.detail(unpublished.id) });
        qc.invalidateQueries({ queryKey: ['listings', 'search'] });
      });
    });

    return () => {
      channels.forEach(c => pusher.unsubscribe(c));
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [applyVacancy, city, markRemoved, qc]); // re-subscribe only if city changes
}

/**
 * Returns real-time vacancy state for a single listing.
 * Falls back to static data from API response if no WS update yet.
 */
export function useVacancyState(uuid: string, staticUnits: number) {
  const ws = useStore(s => s.vacancyMap.get(uuid));
  return {
    availableUnits: ws?.available_units ?? staticUnits,
    isAvailable:    ws?.is_available    ?? staticUnits > 0,
    isRealtime:     !!ws,
  };
}

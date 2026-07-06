/**
 * API Configuration
 * ─────────────────
 * Centralized API endpoint configuration for Laravel backend integration.
 */

function cleanUrl(value: string | undefined, fallback = '') {
  return (value ?? fallback).replace(/\/+$/, '');
}

const API_BASE_URL = cleanUrl(import.meta.env.VITE_API_BASE_URL, window.location.origin);
const MEDIA_CDN_URL = cleanUrl(import.meta.env.VITE_MEDIA_CDN_URL);
const PROPERTY_VIDEO_MAX_UPLOAD_KB = Number(import.meta.env.VITE_PROPERTY_VIDEO_MAX_UPLOAD_KB ?? 102400);
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT ?? 80);
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_V1: `${API_BASE_URL}/api/v1`,
  TIMEOUT: 30000,
  MEDIA_CDN_URL,
  PROPERTY_VIDEO_MAX_UPLOAD_KB,
  PROPERTY_VIDEO_MAX_UPLOAD_BYTES: PROPERTY_VIDEO_MAX_UPLOAD_KB * 1024,
  REVERB: {
    HOST: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    PORT: REVERB_PORT,
    SCHEME: REVERB_SCHEME,
    FORCE_TLS: REVERB_SCHEME === 'https',
  },
};

export const API_ENDPOINTS = {
  // Public Listings
  LISTINGS: '/listings',
  LISTING_DETAIL: (slug: string) => `/listings/${slug}`,
  LISTINGS_FEATURED: '/listings?featured=true',
  LISTINGS_SEARCH: '/listings/search',
  LISTINGS_NEARBY: (lat: number, lng: number) => `/listings/nearby?lat=${lat}&lng=${lng}`,

  // AI Endpoints (Public)
  AI_SEARCH: '/ai/search',
  AI_CHAT: '/ai/chat',
  AI_RECOMMENDATIONS: '/ai/recommendations',
  AI_SESSION: '/ai/session',
  AI_HISTORY: (token: string) => `/ai/history?session_token=${token}`,

  // Favorites
  FAVORITES: '/favorites',
  FAVORITES_ADD: (id: string) => `/favorites/${id}/add`,
  FAVORITES_REMOVE: (id: string) => `/favorites/${id}/remove`,

  // Bookings
  BOOKINGS: '/bookings',
  BOOKINGS_CREATE: '/bookings',
  BOOKINGS_CANCEL: (id: string) => `/bookings/${id}/cancel`,

  // Filters & Metadata
  PROPERTY_TYPES: '/property-types',
  NEIGHBORHOODS: '/neighborhoods',
  PRICE_RANGES: '/price-ranges',
  AMENITIES: '/amenities',

  // Search
  SEARCH_SUGGESTIONS: '/search/suggestions',
  SEARCH_FILTERS: '/search/filters',
};

export default API_CONFIG;

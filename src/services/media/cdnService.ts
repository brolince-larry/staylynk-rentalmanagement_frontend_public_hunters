import type { MediaItem, OptimizedMediaUrls } from '../../types';
import { API_CONFIG } from '../../config/api';

export type MediaSize = keyof OptimizedMediaUrls;

export const mediaSizeOrder: MediaSize[] = [
  'thumbnail',
  'small',
  'medium',
  'large',
  'fullscreen',
];

export function sanitizeAltText(value: unknown, fallback = 'Property image') {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160) || fallback;
}

export function isMediaItem(value: unknown): value is MediaItem {
  return !!value && typeof value === 'object' && 'optimized_urls' in value && 'uuid' in value;
}

export function normalizePublicImageUrl(value?: string | null) {
  return normalizePublicMediaUrl(value);
}

export function normalizePublicMediaUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^javascript:/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol) ? trimmed : null;
  } catch {
    if (!API_CONFIG.MEDIA_CDN_URL) return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_CONFIG.MEDIA_CDN_URL}/${trimmed.replace(/^\/+/, '')}`;
  }
}

export function pickOptimizedUrl(
  media: MediaItem | OptimizedMediaUrls | string | null | undefined,
  preferred: MediaSize,
) {
  if (typeof media === 'string') return normalizePublicImageUrl(media);
  if (!media) return null;

  const urls = isMediaItem(media) ? media.optimized_urls : media;
  const preferredIndex = Math.max(mediaSizeOrder.indexOf(preferred), 0);
  const candidates = [
    ...mediaSizeOrder.slice(preferredIndex),
    ...mediaSizeOrder.slice(0, preferredIndex).reverse(),
  ];

  for (const size of candidates) {
    const url = normalizePublicImageUrl(urls[size]);
    if (url) return url;
  }

  return null;
}

export function buildSrcSet(media: MediaItem | OptimizedMediaUrls | string | null | undefined) {
  if (typeof media === 'string' || !media) return undefined;
  const urls = isMediaItem(media) ? media.optimized_urls : media;
  const entries: Array<[MediaSize, number]> = [
    ['thumbnail', 300],
    ['small', 600],
    ['medium', 1200],
    ['large', 1920],
    ['fullscreen', 2560],
  ];

  return entries
    .map(([size, width]) => {
      const url = normalizePublicImageUrl(urls[size]);
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean)
    .join(', ') || undefined;
}

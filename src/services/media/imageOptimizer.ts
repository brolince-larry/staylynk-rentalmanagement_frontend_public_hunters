import type { MediaItem, OptimizedMediaUrls } from '../../types';
import { buildSrcSet, pickOptimizedUrl, type MediaSize } from './cdnService';

export type ImageUseCase = 'card' | 'gallery' | 'hero' | 'fullscreen';

const sizeByUseCase: Record<ImageUseCase, MediaSize> = {
  card: 'small',
  gallery: 'medium',
  hero: 'large',
  fullscreen: 'fullscreen',
};

export function getImageCandidate(
  media: MediaItem | OptimizedMediaUrls | string | null | undefined,
  useCase: ImageUseCase,
) {
  const size = sizeByUseCase[useCase];
  return {
    src: pickOptimizedUrl(media, size),
    srcSet: buildSrcSet(media),
    size,
  };
}

export function getAspectRatioStyle(aspectRatio?: string | number) {
  if (!aspectRatio) return undefined;
  return { aspectRatio: String(aspectRatio) };
}

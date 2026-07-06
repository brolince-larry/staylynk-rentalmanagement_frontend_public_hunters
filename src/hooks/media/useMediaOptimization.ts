import type { MediaItem, OptimizedMediaUrls } from '../../types';
import { getImageCandidate, type ImageUseCase } from '../../services/media/imageOptimizer';

export function useMediaOptimization(
  media: MediaItem | OptimizedMediaUrls | string | null | undefined,
  useCase: ImageUseCase,
) {
  return getImageCandidate(media, useCase);
}

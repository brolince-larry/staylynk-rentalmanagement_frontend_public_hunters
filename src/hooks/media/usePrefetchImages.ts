import { useEffect } from 'react';
import type { MediaItem, OptimizedMediaUrls } from '../../types';
import { pickOptimizedUrl, type MediaSize } from '../../services/media/cdnService';

export function usePrefetchImages(
  media: Array<MediaItem | OptimizedMediaUrls | string | null | undefined>,
  size: MediaSize = 'small',
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return undefined;

    const links = media
      .slice(0, 4)
      .map(item => pickOptimizedUrl(item, size))
      .filter((url): url is string => !!url)
      .map(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
        return link;
      });

    return () => links.forEach(link => link.remove());
  }, [enabled, media, size]);
}

import { memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import type { MediaItem, OptimizedMediaUrls } from '../../types';
import { buildSrcSet, isMediaItem, pickOptimizedUrl, sanitizeAltText } from '../../services/media/cdnService';
import { getAspectRatioStyle } from '../../services/media/imageOptimizer';
import { useIntersection } from '../../hooks/media/useIntersection';
import { BlurPlaceholder } from './BlurPlaceholder';
import { ImageSkeleton } from './ImageSkeleton';

export interface SmartImageProps {
  src?: string | MediaItem | OptimizedMediaUrls | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: string | null;
  fallback?: string;
  aspectRatio?: string | number;
  quality?: number;
  objectFit?: 'cover' | 'contain';
  loading?: 'lazy' | 'eager';
  loadMargin?: string;
  className?: string;
  imgClassName?: string;
}

export const SmartImage = memo(function SmartImage({
  src,
  alt,
  sizes = '(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 600px',
  priority = false,
  placeholder,
  fallback,
  aspectRatio,
  objectFit = 'cover',
  loadMargin,
  className,
  imgClassName,
}: SmartImageProps) {
  const [retryKey, setRetryKey] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({
    rootMargin: loadMargin ?? (priority ? '300px' : '0px'),
    freezeOnceVisible: true,
  });
  const shouldLoad = isIntersecting;

  const { srcUrl, srcSet, dominantColor, mediaStatus } = useMemo(() => {
    const preferred = priority ? 'large' : 'small';
    return {
      srcUrl: pickOptimizedUrl(src, preferred),
      srcSet: typeof src === 'string' ? undefined : buildSrcSet(src),
      dominantColor: isMediaItem(src) ? src.dominant_color : null,
      mediaStatus: isMediaItem(src) ? src.status : undefined,
    };
  }, [priority, src]);

  const finalSrc = usingFallback ? fallback ?? null : srcUrl;
  const failed = !!finalSrc && failedSrc === `${finalSrc}-${retryKey}`;

  useEffect(() => {
    if (failed && fallback && !usingFallback) setUsingFallback(true);
  }, [failed, fallback, usingFallback]);

  useEffect(() => {
    setUsingFallback(false);
    setFailedSrc(null);
  }, [srcUrl]);

  return (
    <div
      ref={ref}
      className={clsx('relative isolate overflow-hidden bg-slate-100', className)}
      style={getAspectRatioStyle(aspectRatio)}
    >
      <BlurPlaceholder placeholder={placeholder} dominantColor={dominantColor} />
      {(!shouldLoad || !finalSrc) && <ImageSkeleton className="z-0" />}
      {mediaStatus && mediaStatus !== 'ready' && (
        <span className="absolute bottom-2 left-2 z-20 rounded bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
          Processing image...
        </span>
      )}
      {shouldLoad && finalSrc && !failed && (
        <img
          key={`${finalSrc}-${retryKey}`}
          src={finalSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={sanitizeAltText(alt)}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
          draggable={false}
          onError={() => setFailedSrc(`${finalSrc}-${retryKey}`)}
          className={clsx(
            'absolute inset-0 z-10 h-full w-full opacity-100',
            objectFit === 'cover' ? 'object-cover' : 'object-contain',
            imgClassName,
          )}
        />
      )}
      {failed && !fallback && (
        <button
          type="button"
          className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-500"
          onClick={() => setRetryKey(key => key + 1)}
        >
          Retry image
        </button>
      )}
    </div>
  );
});

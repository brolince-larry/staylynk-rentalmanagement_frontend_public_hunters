import { memo, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import clsx from 'clsx';
import type { MediaItem } from '../../types';
import { isMediaItem, sanitizeAltText } from '../../services/media/cdnService';
import { useIntersection } from '../../hooks/media/useIntersection';
import { usePrefetchImages } from '../../hooks/media/usePrefetchImages';
import { SmartImage } from './SmartImage';

interface MediaGalleryProps {
  items: Array<MediaItem | string>;
  title: string;
  className?: string;
}

export const MediaGallery = memo(function MediaGallery({ items, title, className }: MediaGalleryProps) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const current = items[index];
  const next = items.length > 1 ? items[(index + 1) % items.length] : null;
  const { ref: viewportRef, isIntersecting: viewportInView } = useIntersection<HTMLDivElement>({
    rootMargin: '0px',
    threshold: 0.01,
  });

  usePrefetchImages([next], fullscreen ? 'fullscreen' : 'large', viewportInView && !!next);

  const goTo = useCallback((next: number) => {
    if (!items.length) return;
    setIndex((next + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!fullscreen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
      if (event.key === 'ArrowLeft') goTo(index - 1);
      if (event.key === 'ArrowRight') goTo(index + 1);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [fullscreen, goTo, index]);

  if (!current) {
    return <div className={clsx('aspect-[4/3] rounded-lg bg-slate-100', className)} />;
  }

  const viewport = (
    <div
      ref={viewportRef}
      className={clsx('relative overflow-hidden bg-slate-950', fullscreen ? 'h-full w-full' : 'aspect-[4/3] rounded-lg', className)}
    >
      <SmartImage
        src={current}
        alt={sanitizeAltText(isMediaItem(current) ? current.alt_text : title, title)}
        aspectRatio={fullscreen ? undefined : '4 / 3'}
        objectFit={fullscreen ? 'contain' : 'cover'}
        loading="lazy"
        sizes={fullscreen ? '100vw' : '(max-width: 768px) 100vw, 65vw'}
        className="h-full w-full bg-slate-950"
      />

      {items.length > 1 && (
        <>
          <GalleryButton label="Previous image" className="left-3" onClick={() => goTo(index - 1)}>
            <ChevronLeft size={18} />
          </GalleryButton>
          <GalleryButton label="Next image" className="right-3" onClick={() => goTo(index + 1)}>
            <ChevronRight size={18} />
          </GalleryButton>
        </>
      )}

      <button
        type="button"
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setFullscreen(value => !value)}
        aria-label={fullscreen ? 'Close fullscreen gallery' : 'Open fullscreen gallery'}
      >
        {fullscreen ? <X size={18} /> : <Maximize2 size={17} />}
      </button>

      <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
        {index + 1} / {items.length}
      </div>
    </div>
  );

  return (
    <>
      {!fullscreen && viewport}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
        >
          {viewport}
        </div>
      )}
    </>
  );
});

function GalleryButton({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(
        'absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
        className,
      )}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}

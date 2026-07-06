import { useCallback, useMemo, useRef } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { useActiveVideoObserver } from '../../hooks/useActiveVideoObserver';
import { useSeekerStore } from '../../stores/seekerStore';
import type { Listing, PublicListingVideo } from '../../types';
import { PropertyVideoItem } from './PropertyVideoItem';

interface PropertyShortVideoFeedProps {
  videos: PublicListingVideo[];
  listing?: Listing;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PropertyShortVideoFeed({ videos, listing }: PropertyShortVideoFeedProps) {
  // Featured video first, then by sort_order
  const sortedVideos = useMemo(
    () =>
      [...videos].sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return a.sort_order - b.sort_order;
      }),
    [videos],
  );

  const { activeIndex, registerItem, scrollToIndex } = useActiveVideoObserver(sortedVideos.length);
  const feedRef = useRef<HTMLElement | null>(null);
  const displayIndex = activeIndex >= 0 ? activeIndex : 0;

  const slug = listing?.slug || listing?.id;
  const isSaved = useSeekerStore(s => (slug ? s.isSaved(slug) : false));
  const toggleSaved = useSeekerStore(s => s.toggleSaved);

  const scrollToVideo = useCallback(
    (index: number) => scrollToIndex(index, !prefersReducedMotion()),
    [scrollToIndex],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        scrollToVideo(displayIndex + 1);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollToVideo(displayIndex - 1);
      }
    },
    [displayIndex, scrollToVideo],
  );

  if (sortedVideos.length === 0) return null;

  return (
    <section
      ref={feedRef}
      className="relative overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/50"
      aria-label="Property videos"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Scroll container — TikTok-style vertical snap */}
      <div className="relative mx-auto h-[82vh] max-h-[860px] min-h-[560px] w-full max-w-[520px] snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth bg-black motion-reduce:scroll-auto sm:h-[78vh]">
        {sortedVideos.map((video, index) => {
          const distanceFromActive = Math.abs(index - activeIndex);
          const hasActiveVideo = activeIndex >= 0;

          return (
            <div
              key={video.id}
              ref={registerItem(index)}
              data-video-index={index}
              className="relative h-full w-full snap-start snap-always"
            >
              <PropertyVideoItem
                video={video}
                index={index}
                total={sortedVideos.length}
                isActive={index === activeIndex}
                isNext={hasActiveVideo && index === activeIndex + 1}
                isNearViewport={hasActiveVideo && distanceFromActive <= 1}
              />
            </div>
          );
        })}
      </div>

      {/* Right-side TikTok action column */}
      <div className="pointer-events-none absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 sm:right-4">
        {slug && (
          <ActionButton
            onClick={() => toggleSaved(slug)}
            active={isSaved}
            activeClass="bg-rose-500 text-white"
            aria-label={isSaved ? 'Remove saved' : 'Save property'}
          >
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved && <span className="mt-0.5 text-[10px] font-black">Saved</span>}
          </ActionButton>
        )}
        <ActionButton
          onClick={() => {
            void navigator.share?.({
              title: listing?.title,
              url: window.location.href,
            });
          }}
          aria-label="Share"
        >
          <Share2 size={20} />
        </ActionButton>

        {/* Video counter pill */}
        <div className="pointer-events-none flex flex-col items-center gap-1 pt-1">
          {sortedVideos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`pointer-events-auto h-1 rounded-full transition-all duration-300 ${
                i === displayIndex ? 'w-4 bg-white' : 'w-1 bg-white/30 hover:bg-white/60'
              }`}
              onClick={() => scrollToVideo(i)}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint pill — bottom centre */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-black text-white/60 backdrop-blur">
          {displayIndex + 1} / {sortedVideos.length} · swipe to browse
        </span>
      </div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  active = false,
  activeClass = '',
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      className={`pointer-events-auto flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-full backdrop-blur transition ${
        active ? activeClass : 'bg-white/15 text-white hover:bg-white/25'
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

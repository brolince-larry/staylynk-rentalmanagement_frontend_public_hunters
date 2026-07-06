import { memo, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Play, Volume2, VolumeX } from 'lucide-react';
import type { PublicListingVideo } from '../../types';
import { normalizePublicMediaUrl } from '../../services/media/cdnService';

interface PropertyVideoItemProps {
  video: PublicListingVideo;
  index: number;
  total: number;
  isActive: boolean;
  isNext: boolean;
  isNearViewport: boolean;
  muted?: boolean;
  onToggleMuted?: () => void;
}

function formatDuration(duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return null;

  const totalSeconds = Math.round(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function PropertyVideoItemComponent({
  video,
  index,
  total,
  isActive,
  isNext,
  isNearViewport,
  muted = true,
  onToggleMuted,
}: PropertyVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [localMuted, setLocalMuted] = useState(muted);
  const duration = formatDuration(video.duration);
  const shouldAttachSource = isActive || isNext;
  // Respect delivery hint from API; fall back to intelligent load
  const deliveryPreload = video.delivery?.preload;
  const preload: 'none' | 'metadata' | 'auto' =
    deliveryPreload ?? (isActive || isNext ? 'metadata' : 'none');
  const effectiveMuted = onToggleMuted ? muted : localMuted;
  const handleMuteToggle = onToggleMuted ?? (() => setLocalMuted(v => !v));
  const videoUrl = normalizePublicMediaUrl(video.video_url);
  const posterUrl = normalizePublicMediaUrl(video.thumbnail_url);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = effectiveMuted;
  }, [effectiveMuted]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || hasError) return;

    if (isActive) {
      const play = async () => {
        try {
          await element.play();
          setIsPaused(false);
        } catch {
          setIsPaused(true);
        }
      };

      void play();
      return;
    }

    element.pause();
    queueMicrotask(() => setIsPaused(true));

    if (!isNearViewport) {
      element.currentTime = 0;
    }
  }, [hasError, isActive, isNearViewport]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoading(true);
      setHasError(false);
      setIsPaused(true);
    });
  }, [video.video_url]);

  return (
    <article className="relative h-full w-full overflow-hidden rounded-none bg-black text-white sm:rounded-lg">
      {shouldAttachSource && !hasError && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl ?? undefined}
          muted={effectiveMuted}
          playsInline
          loop
          preload={preload}
          className="h-full w-full object-cover"
          onClick={handleMuteToggle}
          onLoadedMetadata={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          aria-label={`Property video ${index + 1} of ${total}`}
        />
      ) : (
        <div className="h-full w-full bg-slate-950" />
      )}

      {isLoading && !hasError && shouldAttachSource && (
        <div className="absolute inset-0 animate-pulse bg-slate-950">
          <div className="absolute inset-x-6 bottom-8 h-2 rounded-full bg-white/15" />
          <div className="absolute bottom-14 left-6 h-3 w-28 rounded-full bg-white/15" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 px-8 text-center">
          <AlertTriangle className="text-amber-300" size={30} />
          <p className="text-sm font-black">Video unavailable</p>
          <p className="text-xs font-medium text-white/60">This property video could not be loaded.</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
            {index + 1} / {total}
          </span>
          {video.is_featured && (
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black uppercase tracking-normal">
              Featured
            </span>
          )}
        </div>
        {duration && (
          <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-bold text-white/85 backdrop-blur">
            {duration}
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4">
        <button
          type="button"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70"
          onClick={handleMuteToggle}
          aria-label={effectiveMuted ? 'Unmute video' : 'Mute video'}
        >
          {effectiveMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {isPaused && isActive && !hasError && (
          <div className="rounded-full bg-white/15 p-3 backdrop-blur">
            <Play size={22} fill="currentColor" />
          </div>
        )}
      </div>
    </article>
  );
}

export const PropertyVideoItem = memo(PropertyVideoItemComponent);

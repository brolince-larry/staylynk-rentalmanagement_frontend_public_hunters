import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bed, Heart, MapPin, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useListings } from '../api/listingApi';
import { Seo } from '../components/seo/Seo';
import { SmartImage } from '../components/media/SmartImage';
import { useSeekerStore } from '../stores/seekerStore';
import { toArray } from '../utils/collection';
import type { Listing } from '../types';
import { normalizePublicMediaUrl } from '../services/media/cdnService';

export default function FeedPage() {
  const { data, isLoading, isError } = useListings({ sort: 'smart', per_page: 20 });
  const listings = toArray(data?.data);
  const [globalMuted, setGlobalMuted] = useState(true);
  const toggleMuted = useCallback(() => setGlobalMuted(m => !m), []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Seo
        title="StayLynk Video Feed | Short Property Tours"
        description="Swipe through short rental video tours, save favourites, and open verified property pages."
        canonicalPath="/feed"
      />

      {/* Back button */}
      <div className="fixed left-4 top-[4.75rem] z-40">
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-black/50 px-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-black/70"
        >
          <ArrowLeft size={15} />
          Home
        </Link>
      </div>

      {isLoading && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold text-white/60">Unable to load the video feed right now.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <section
          className="mx-auto h-[calc(100svh-4rem)] max-w-[520px] snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth"
          aria-label="Property video feed"
        >
          {listings.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-white/50">
              No tours available yet.
            </div>
          ) : (
            listings.map((listing, index) => (
              <FeedListing
                key={listing.id}
                listing={listing}
                index={index}
                globalMuted={globalMuted}
                onToggleMuted={toggleMuted}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}

const FeedListing = memo(function FeedListing({
  listing,
  index,
  globalMuted,
  onToggleMuted,
}: {
  listing: Listing;
  index: number;
  globalMuted: boolean;
  onToggleMuted: () => void;
}) {
  const itemRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Ref keeps the current muted value visible inside IntersectionObserver without stale closure
  const mutedRef = useRef(globalMuted);
  const slug = listing.slug || listing.id;

  const videos = toArray(listing.media?.videos);
  // Featured video first
  const featuredVideo = videos.find(v => v.is_featured) ?? videos[0];
  const videoUrl = normalizePublicMediaUrl(featuredVideo?.video_url);
  const videoPoster = normalizePublicMediaUrl(featuredVideo?.thumbnail_url);

  // Cover fallback: cover → gallery[0] → video thumbnail
  const rawCover =
    listing.media?.cover ||
    toArray(listing.media?.gallery)[0] ||
    featuredVideo?.thumbnail_url ||
    '/images/property-placeholder.webp';
  const coverSrc = typeof rawCover === 'string' ? rawCover : (rawCover as { url?: string })?.url ?? '/images/property-placeholder.webp';

  const isSaved = useSeekerStore(s => s.isSaved(slug));
  const toggleSaved = useSeekerStore(s => s.toggleSaved);
  const location = [listing.location?.neighbourhood, listing.location?.city]
    .filter(Boolean)
    .join(', ');

  // Keep ref in sync and apply to video element directly — no re-render needed
  useEffect(() => {
    mutedRef.current = globalMuted;
    const el = videoRef.current;
    if (el) el.muted = globalMuted;
  }, [globalMuted]);

  // IntersectionObserver auto-play/pause — reads mutedRef (always current, no stale closure)
  useEffect(() => {
    const item = itemRef.current;
    const video = videoRef.current;
    if (!item || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
          video.muted = mutedRef.current;
          void video.play().catch(() => undefined);
        } else {
          video.pause();
          if (entry.intersectionRatio < 0.1) video.currentTime = 0;
        }
      },
      { threshold: [0.1, 0.65, 0.95] },
    );

    observer.observe(item);
    return () => observer.disconnect();
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: listing.title, url: `${window.location.origin}/listing/${slug}` });
    } catch { /* user cancelled or not supported */ }
  };

  return (
    <article
      ref={itemRef}
      className="relative h-[calc(100svh-4rem)] snap-start snap-always overflow-hidden bg-black"
    >
      {/* Media */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={videoPoster ?? coverSrc}
          muted={globalMuted}
          loop
          playsInline
          autoPlay={index === 0}
          preload={index <= 1 ? 'metadata' : 'none'}
          className="h-full w-full object-cover"
          onClick={onToggleMuted}
        />
      ) : (
        <SmartImage
          src={coverSrc}
          alt={listing.title}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
          sizes="100vw"
        />
      )}

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

      {/* Right-side TikTok actions */}
      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
        <TikAction
          onClick={() => toggleSaved(slug)}
          active={isSaved}
          activeClass="bg-rose-500"
          aria-label={isSaved ? 'Remove saved' : 'Save property'}
        >
          <Heart size={22} fill={isSaved ? 'currentColor' : 'none'} />
        </TikAction>
        <TikAction
          as={Link}
          to={`/listing/${slug}`}
          aria-label="Ask about property"
        >
          <MessageCircle size={22} />
        </TikAction>
        <TikAction onClick={handleShare} aria-label="Share">
          <Share2 size={21} />
        </TikAction>
        <TikAction onClick={onToggleMuted} aria-label={globalMuted ? 'Unmute' : 'Mute'}>
          {globalMuted ? <VolumeX size={21} /> : <Volume2 size={21} />}
        </TikAction>
      </div>

      {/* Bottom info */}
        <motion.div
          className="absolute bottom-0 left-0 right-16 z-10 p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-2">
            {listing.visibility?.is_featured && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                Featured
              </span>
            )}
            {listing.trust?.is_verified && (
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-black">
                Verified
              </span>
            )}
            {videos.length > 0 && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
                {videos.length} tour{videos.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <Link
            to={`/listing/${slug}`}
            className="block text-2xl font-black leading-tight text-white transition hover:text-violet-200"
          >
            {listing.title}
          </Link>

          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/70">
            <MapPin size={14} />
            {location || 'Kenya'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-base font-black text-white">
              {listing.pricing?.display ?? 'Price on request'}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-white/60">
              <Bed size={14} />
              {listing.units?.available ?? 0} vacant
            </span>
          </div>

          <Link
            to={`/listing/${slug}`}
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            View property
          </Link>
        </motion.div>
    </article>
  );
});

// Polymorphic TikTok-style action button
function TikAction({
  children,
  onClick,
  as: Tag = 'button',
  active = false,
  activeClass = '',
  'aria-label': ariaLabel,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  as?: React.ElementType;
  active?: boolean;
  activeClass?: string;
  'aria-label': string;
  [key: string]: unknown;
}) {
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition ${
        active ? `${activeClass} text-white` : 'bg-black/40 text-white hover:bg-black/60'
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </Tag>
  );
}

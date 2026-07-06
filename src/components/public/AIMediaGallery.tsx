import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AIActionIntent, AIMediaItem } from '../../types';

export function AIMediaGallery({
  media,
  actionIntent,
}: {
  media: AIMediaItem[];
  actionIntent?: AIActionIntent;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  if (!media.length) return null;

  // Show up to 6 items, images before videos
  const sorted = [
    ...media.filter(m => m.type === 'image'),
    ...media.filter(m => m.type === 'video'),
  ].slice(0, 6);

  return (
    <>
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {sorted.map((item, i) => (
            <motion.div
              key={`${item.url}-${i}`}
              className="relative aspect-square overflow-hidden rounded-xl bg-white/[0.04]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.055, duration: 0.22 }}
            >
              {item.type === 'image' ? (
                <button
                  type="button"
                  className="group h-full w-full"
                  onClick={() => setLightboxUrl(item.url)}
                  aria-label={item.alt ?? `View photo from ${item.property}`}
                >
                  <img
                    src={item.thumbnail ?? item.url}
                    alt={item.alt ?? item.property}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  {item.cover && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                    <ExternalLink
                      size={17}
                      className="text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </button>
              ) : playingUrl === item.url ? (
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <button
                  type="button"
                  className="group relative h-full w-full"
                  onClick={() => setPlayingUrl(item.url)}
                  aria-label={`Play video from ${item.property}`}
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.property}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-900" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 transition-colors group-hover:bg-black/45">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform group-hover:scale-105">
                      <Play
                        size={19}
                        className="ml-0.5 text-slate-900"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </div>
                    {item.duration && (
                      <span className="mt-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
                        {item.duration}
                      </span>
                    )}
                  </div>
                  {item.featured && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-violet-600/85 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
                      Featured
                    </span>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {actionIntent && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sorted.length * 0.055 + 0.1 }}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] py-2.5 text-sm font-black text-white/65 transition hover:border-violet-500/30 hover:bg-violet-500/[0.08] hover:text-violet-300"
          >
            {actionIntent.label}
          </motion.button>
        )}
      </div>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxUrl && (
            <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white/70 transition hover:bg-white/20 hover:text-white"
        onClick={onClose}
        aria-label="Close image"
      >
        <X size={18} />
      </button>
      <motion.img
        src={url}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl shadow-black/70"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        alt="Full size property photo"
      />
    </motion.div>
  );
}

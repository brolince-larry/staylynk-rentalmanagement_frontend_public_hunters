import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, MapPin, X } from 'lucide-react';
import type { HunterCompareData, HunterMatchRoom } from '../../types/hunter';
import { HunterChartBlock } from './HunterChartBlock';

function RoomColumn({ room }: { room: HunterMatchRoom }) {
  return (
    <div className="min-w-[180px] flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      {room.cover_image && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={room.cover_image}
            alt={room.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-black text-white">{room.title}</p>
        {room.property_name && room.property_name !== room.title && (
          <p className="mt-0.5 text-[11px] text-white/40">{room.property_name}</p>
        )}
        {(room.area || room.city) && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white/40">
            <MapPin size={9} />
            {[room.area, room.city].filter(Boolean).join(', ')}
          </p>
        )}
        <p className="mt-2 text-base font-black text-violet-300">
          {room.currency ?? 'KES'} {room.monthly_rent.toLocaleString()}
          <span className="text-[10px] font-semibold text-white/30">/mo</span>
        </p>
        {room.bedrooms != null && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white/40">
            <BedDouble size={10} />
            {room.bedrooms} bedroom{room.bedrooms !== 1 ? 's' : ''}
          </p>
        )}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-2 space-y-1">
            {room.amenities.map(a => (
              <p key={a} className="text-[11px] font-semibold text-emerald-400">
                ✓ {a}
              </p>
            ))}
          </div>
        )}
        {room.available_from && (
          <p className="mt-2 text-[10px] font-semibold text-white/35">
            Available{' '}
            {new Date(room.available_from).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

interface HunterComparePanelProps {
  open: boolean;
  data: HunterCompareData | null;
  onClose: () => void;
}

export function HunterComparePanel({ open, data, onClose }: HunterComparePanelProps) {
  return createPortal(
    <AnimatePresence>
      {open && data && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[201] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-[#0d0d14] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            {/* Handle + header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
                <p className="text-sm font-black text-white">
                  Comparing {data.rooms.length} Properties
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Side-by-side room cards */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {data.rooms.map(room => (
                  <RoomColumn key={room.id} room={room} />
                ))}
              </div>

              {/* Visuals */}
              {data.visuals.length > 0 && (
                <div className="mt-4 space-y-3">
                  {data.visuals.map((visual, i) => (
                    <HunterChartBlock key={i} visual={visual} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

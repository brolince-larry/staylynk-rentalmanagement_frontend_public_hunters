import { useEffect, useRef, type FormEvent } from 'react';
import { X, Send, Loader2, CalendarDays } from 'lucide-react';
import { useBookRoom } from '../../api/listingApi';
import type { PublicVacantRoom } from '../../types';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: PublicVacantRoom;
  listingSlug: string;
  listingTitle: string;
}

function tomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function errorMessageForStatus(status: unknown): string {
  const s = typeof status === 'number' ? status : 0;
  if (s === 409) return 'You already have a pending request for this room.';
  if (s === 429) return 'Too many requests. Try again in an hour.';
  return null as unknown as string;
}

export function BookingRequestModal({
  isOpen,
  onClose,
  room,
  listingSlug,
  listingTitle,
}: BookingRequestModalProps) {
  const bookRoom = useBookRoom();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => firstInputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = bookRoom.isSuccess;
  const bookingRef = bookRoom.data?.data?.booking_reference;
  const apiError = bookRoom.error as { status?: number; message?: string; errors?: Record<string, string[]> } | null;
  const statusMsg = apiError?.status ? errorMessageForStatus(apiError.status) : null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    bookRoom.mutate({
      slug: listingSlug,
      data: {
        room_uuid: room.id,
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        move_in_date: String(form.get('move_in_date') ?? ''),
        message: String(form.get('message') ?? '').trim() || undefined,
      },
    });
  };

  const inputCls =
    'h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-violet-500/60 focus:bg-white/[0.07] transition disabled:opacity-40';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg overflow-hidden rounded-t-2xl bg-[#0f1520] shadow-2xl sm:inset-0 sm:m-auto sm:max-h-[90vh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-violet-400" />
            <h2 id="booking-modal-title" className="text-base font-black text-white">
              Book This Room
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Room summary */}
        <div className="border-b border-white/[0.07] px-5 py-3">
          <p className="text-xs font-semibold text-white/40">{listingTitle}</p>
          <p className="mt-0.5 text-sm font-black text-white">
            {room.room_type || room.display_name} · Room {room.room_number}
          </p>
          <p className="text-sm font-black text-violet-300">
            KES {Number(room.pricing?.monthly_rent ?? 0).toLocaleString()}/mo
            <span className="ml-2 text-xs font-semibold text-white/35">
              + KES {Number(room.pricing?.security_deposit ?? 0).toLocaleString()} deposit
            </span>
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:max-h-none">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <p className="text-sm font-black text-emerald-300">
                  ✅ Your request has been received!
                </p>
                {bookingRef && (
                  <p className="mt-1.5 text-xs font-semibold text-emerald-200/70">
                    Reference: <span className="font-black text-emerald-200">{bookingRef}</span>
                  </p>
                )}
                <p className="mt-3 text-xs font-medium leading-5 text-white/55">
                  We'll contact you within 24 hours to confirm your booking.
                  <br />
                  Note: Your data will be deleted if not confirmed within 30 days.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-white/[0.07] py-2.5 text-sm font-black text-white/60 transition hover:bg-white/[0.05]"
              >
                Close
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* 422 field errors */}
              {apiError?.errors && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                  {Object.values(apiError.errors).flat().map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              {/* 409 / 429 */}
              {statusMsg && !apiError?.errors && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                  {statusMsg}
                </div>
              )}

              {/* Generic server error */}
              {bookRoom.isError && !statusMsg && !apiError?.errors && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                  {apiError?.message ?? 'Something went wrong. Please try again.'}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">
                    Full Name *
                  </label>
                  <input
                    ref={firstInputRef}
                    name="name"
                    required
                    placeholder="John Doe"
                    disabled={bookRoom.isPending}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    disabled={bookRoom.isPending}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="0712 345 678"
                    disabled={bookRoom.isPending}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">
                    Preferred Move-in Date *
                  </label>
                  <input
                    name="move_in_date"
                    type="date"
                    required
                    min={tomorrowString()}
                    disabled={bookRoom.isPending}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">
                    Message (optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Any questions or special requirements…"
                    disabled={bookRoom.isPending}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-violet-500/60 focus:bg-white/[0.07] transition disabled:opacity-40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookRoom.isPending}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 py-3 text-sm font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
              >
                {bookRoom.isPending ? (
                  <><Loader2 size={15} className="animate-spin" /> Sending…</>
                ) : (
                  <><Send size={15} /> Send Booking Request</>
                )}
              </button>

              <p className="text-center text-[10px] font-medium text-white/25">
                Your data is stored securely and deleted if your booking is not confirmed within 30 days.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

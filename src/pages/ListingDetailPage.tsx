import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bed,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Car,
  GraduationCap,
  Baby,
  PawPrint,
  Droplets,
  Shield,
  Zap,
  Camera,
  Flame,
} from 'lucide-react';
import { useListing, useListings, useSubmitInquiry } from '../api/listingApi';
import { MediaGallery } from '../components/media/MediaGallery';
import { SmartImage } from '../components/media/SmartImage';
import { PropertyShortVideoFeed } from '../components/listings/PropertyShortVideoFeed';
import { MockMapBlock } from '../components/listings/MockMapBlock';
import { BookingRequestModal } from '../components/listings/BookingRequestModal';
import { CompareButton } from '../components/shared/CompareButton';
import { ListingCard } from '../components/shared/ListingCard';
import { Seo } from '../components/seo/Seo';
import { toArray } from '../utils/collection';
import type { Listing, MediaItem, NearbyItem, PublicVacantRoom } from '../types';

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, refetch } = useListing(slug ?? null);
  const listing = data?.data;

  const gallery = useMemo(() => (listing ? buildListingGallery(listing) : []), [listing]);
  const rooms = toArray(listing?.units?.rooms);
  const amenities = toArray(listing?.amenities);
  const videos = toArray(listing?.media?.videos);
  const nearbyItems = normalizeNearby(listing?.nearby);
  const similarQuery = useListings({
    city: listing?.location?.city,
    house_type: listing?.house_type ?? undefined,
    sort: 'smart',
    per_page: 4,
  });
  const similarListings = toArray(similarQuery.data?.data)
    .filter(item => item.id !== listing?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090f] px-4 py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 h-4 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-white/[0.06]" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090f] px-4 text-center">
        <p className="mb-2 text-lg font-black text-white">Listing unavailable</p>
        <p className="mb-5 text-sm font-medium text-white/45">We could not load this listing right now.</p>
        <button
          type="button"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-violet-500"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const unitsAvailable = listing.units?.available ?? 0;
  const isShared = isSharedRoomType(listing.house_type);

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <Seo
        title={`${listing.title} | StayLynk`}
        description={
          listing.description ??
          `View ${listing.title} — pricing, amenities, video tours, and book a viewing on StayLynk.`
        }
        canonicalPath={`/listing/${listing.slug || listing.id}`}
        image={mediaToUrl(listing.media?.cover)}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Accommodation',
          name: listing.title,
          description: listing.description,
          address: {
            '@type': 'PostalAddress',
            addressLocality: listing.location?.city,
            addressRegion: listing.location?.neighbourhood,
            addressCountry: listing.location?.country ?? 'KE',
          },
          image: gallery.map(mediaToUrl).filter(Boolean),
          offers: {
            '@type': 'Offer',
            priceCurrency: listing.pricing?.currency ?? 'KES',
            price: listing.pricing?.min,
            availability: listing.visibility?.is_available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Back nav */}
        <Link
          to="/browse"
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-white/40 transition hover:text-white/80"
        >
          <ArrowLeft size={15} />
          Back to listings
        </Link>

        {/* ── Hero grid ─────────────────────────────────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_360px]">
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl">
            <MediaGallery items={gallery} title={listing.title} />
          </div>

          {/* Sticky info panel */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {listing.visibility?.is_featured && (
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-black text-violet-300">
                  Featured
                </span>
              )}
              {listing.trust?.is_trusted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-400">
                  <ShieldCheck size={11} />
                  Trusted Landlord
                </span>
              )}
              {listing.trust?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-black text-sky-400">
                  <Check size={11} />
                  Verified
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
              {listing.title}
            </h1>

            <p className="flex items-center gap-1.5 text-sm font-semibold text-white/50">
              <MapPin size={14} />
              {[listing.location?.neighbourhood, listing.location?.city, listing.location?.country]
                .filter(Boolean)
                .join(', ')}
            </p>

            {/* Price card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
              <p className="text-3xl font-black text-white">
                {listing.pricing?.display ?? 'Price on request'}
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-400">
                {unitsAvailable} vacant room{unitsAvailable === 1 ? '' : 's'}
              </p>

              <CompareButton slug={listing.slug ?? listing.id} className="mt-4 w-full" />

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-white/55">
                <StatPill icon={<Building2 size={13} />} label={formatType(listing.house_type)} />
                <StatPill
                  icon={<Bed size={13} />}
                  label={`${listing.units?.total ?? rooms.length} rooms total`}
                />
                {isShared ? (
                  <StatPill
                    icon={<Users size={13} />}
                    label={`${rooms.reduce((s, r) => s + (r.available_beds ?? 0), 0)} beds free`}
                  />
                ) : (
                  <StatPill icon={<Users size={13} />} label={`${unitsAvailable} available`} />
                )}
                {amenities.length > 0 && (
                  <StatPill icon={<Sparkles size={13} />} label={`${amenities.length} amenities`} />
                )}
                {(listing.specs?.bathrooms?.min ?? 0) > 0 && (
                  <StatPill
                    icon={<Droplets size={13} />}
                    label={
                      listing.specs.bathrooms.min === listing.specs.bathrooms.max
                        ? `${listing.specs.bathrooms.min} bathroom${listing.specs.bathrooms.min === 1 ? '' : 's'}`
                        : `${listing.specs.bathrooms.min}–${listing.specs.bathrooms.max} bathrooms`
                    }
                  />
                )}
                {listing.features?.security_level && listing.features.security_level !== 'standard' && (
                  <StatPill
                    icon={<Shield size={13} />}
                    label={`${listing.features.security_level.charAt(0).toUpperCase() + listing.features.security_level.slice(1)} security`}
                  />
                )}
              </div>
            </div>

            {/* Feature icons */}
            {(listing.features?.internet ||
              listing.features?.parking ||
              listing.features?.water ||
              listing.features?.family_friendly ||
              listing.features?.student_friendly ||
              listing.features?.pets_allowed ||
              listing.features?.quiet) && (
              <div className="flex flex-wrap gap-2">
                {listing.features.water    && <FeatureTag icon={<Droplets size={12} />} label="Running water" />}
                {listing.features.internet && <FeatureTag icon={<Wifi size={12} />} label="WiFi" />}
                {listing.features.parking  && <FeatureTag icon={<Car size={12} />} label="Parking" />}
                {listing.features.quiet    && <FeatureTag icon={<Zap size={12} />} label="Quiet environment" />}
                {listing.features.family_friendly && (
                  <FeatureTag icon={<Baby size={12} />} label="Family friendly" />
                )}
                {listing.features.student_friendly && (
                  <FeatureTag icon={<GraduationCap size={12} />} label="Student friendly" />
                )}
                {listing.features.pets_allowed && (
                  <FeatureTag icon={<PawPrint size={12} />} label="Pets allowed" />
                )}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
                <p className="text-sm font-medium leading-6 text-white/60">
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Video Tours ────────────────────────────────────────────────── */}
        {videos.length > 0 && (
          <section className="mt-8" aria-label="Property video tours">
            <SectionHeading
              title="Video Tours"
              subtitle={`${videos.length} short tour${videos.length === 1 ? '' : 's'} of this property`}
            />
            <PropertyShortVideoFeed videos={videos} listing={listing} />
          </section>
        )}

        {/* ── Amenities ─────────────────────────────────────────────────── */}
        {amenities.length > 0 && (
          <section className="mt-8">
            <SectionHeading title="Amenities" />
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <AmenityChip key={a} label={a} />
              ))}
            </div>
          </section>
        )}

        {/* ── Location + Booking ─────────────────────────────────────────── */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
          {/* Location with mock map */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <MapPin size={17} className="text-violet-400" />
              Location
            </h2>
            <MockMapBlock title={listing.title} coverPhoto={mediaToUrl(listing.media?.cover)} location={listing.location} nearbyItems={nearbyItems} />
          </div>

          <ViewingBookingCard slug={listing.slug || listing.id} listing={listing} />
        </section>

        {/* ── Vacant Rooms ───────────────────────────────────────────────── */}
        <section className="mt-8" aria-label="Vacant rooms">
          <div className="mb-4 flex items-end justify-between gap-3">
            <SectionHeading
              title="Vacant Rooms"
              subtitle="Available rooms synced from the property inventory"
            />
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">
              {rooms.length} room{rooms.length === 1 ? '' : 's'}
            </span>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 text-center text-sm font-medium text-white/30">
              No vacant room details are available yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  listing={listing}
                  houseType={listing.house_type}
                  listingCover={listing.media?.cover}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Similar Properties ─────────────────────────────────────────── */}
        {similarListings.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <SectionHeading
                title="Similar Properties"
                subtitle="Smart recommendations near this listing"
              />
              <Link
                to="/browse"
                className="inline-flex items-center gap-1 text-sm font-black text-violet-400 transition hover:text-violet-300"
              >
                View more <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarListings.map(item => (
                <ListingCard key={item.id} listing={item} variant="featured" />
              ))}
            </div>
          </section>
        )}

        <div className="h-12" />
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm font-medium text-white/40">{subtitle}</p>}
    </div>
  );
}

function StatPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2">
      <span className="text-violet-400">{icon}</span>
      <span className="truncate text-xs font-semibold text-white/55">{label}</span>
    </div>
  );
}

function FeatureTag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/55">
      <span className="text-violet-400">{icon}</span>
      {label}
    </span>
  );
}

// Amenity icon lookup
const AMENITY_ICON_MAP: Array<[RegExp, ReactNode]> = [
  [/wifi|internet|broadband/i, <Wifi size={12} />],
  [/parking|garage|car/i, <Car size={12} />],
  [/water|borehole/i, <Droplets size={12} />],
  [/security|cctv|guard/i, <Shield size={12} />],
  [/generator|backup power|power/i, <Zap size={12} />],
  [/camera|surveillance/i, <Camera size={12} />],
  [/gym|fitness/i, <Flame size={12} />],
  [/student/i, <GraduationCap size={12} />],
  [/family|kid|child/i, <Baby size={12} />],
  [/pet/i, <PawPrint size={12} />],
];

function amenityIcon(label: string): ReactNode | null {
  for (const [regex, icon] of AMENITY_ICON_MAP) {
    if (regex.test(label)) return icon;
  }
  return null;
}

function AmenityChip({ label }: { label: string }) {
  const icon = amenityIcon(label);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-white/65">
      {icon && <span className="text-violet-400">{icon}</span>}
      {label}
    </span>
  );
}

function ViewingBookingCard({ slug, listing }: { slug: string; listing: Listing }) {
  const submitInquiry = useSubmitInquiry();
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    submitInquiry.mutate(
      {
        slug,
        form: {
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          move_in_date: String(form.get('date') ?? ''),
          budget: listing.pricing?.min,
          message: `Viewing request for ${listing.title}. Preferred time: ${String(form.get('time') ?? 'Flexible')}`,
        },
      },
      { onSuccess: () => setSent(true) },
    );
  };

  const inputCls =
    'h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-violet-500/60 focus:bg-white/[0.07] transition';

  return (
    <aside className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
        <CalendarDays size={17} className="text-violet-400" />
        Schedule a Visit
      </h2>
      {sent ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold leading-6 text-emerald-300">
          Viewing request sent. The landlord or StayLynk team will follow up with confirmation.
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input name="name" required placeholder="Full name" className={inputCls} />
          <input name="email" type="email" required placeholder="Email" className={inputCls} />
          <input name="phone" placeholder="Phone" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" className={inputCls} />
            <select
              name="time"
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm font-semibold text-white/80 outline-none focus:border-violet-500/60 transition"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitInquiry.isPending}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
          >
            <Send size={15} />
            {submitInquiry.isPending ? 'Sending…' : 'Request viewing'}
          </button>
        </form>
      )}
    </aside>
  );
}

function RoomCard({
  room,
  listing,
  houseType,
  listingCover,
}: {
  room: PublicVacantRoom;
  listing: Listing;
  houseType: string | null | undefined;
  listingCover?: string | MediaItem | null;
}) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const cover = room.media?.cover || listingCover || '/images/room-placeholder.webp';
  const location = [room.block, room.floor].filter(Boolean).join(' · ');
  const isShared = isSharedRoomType(houseType);
  const availLabel = isShared
    ? room.available_beds > 0
      ? `${room.available_beds} bed${room.available_beds === 1 ? '' : 's'} free`
      : 'Full'
    : 'Available';
  const availColor = isShared && room.available_beds === 0 ? 'text-rose-400' : 'text-emerald-400';

  const whatsappPhone = listing.contact?.whatsapp
    ?.replace(/\D/g, '')
    .replace(/^0/, '254');
  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in Room ${room.room_number} at ${listing.title}. ` +
    `Could you provide details about availability and how to proceed with booking? Thank you.`,
  );
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${whatsappText}`
    : null;

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
        <SmartImage
          src={cover}
          alt={room.display_name || room.room_type || `Room ${room.room_number}`}
          aspectRatio="4 / 3"
          loading="lazy"
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 48vw, 320px"
        />
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-black text-white">
              {room.room_type || room.display_name}
            </h3>
            <span className={`shrink-0 text-xs font-black ${availColor}`}>{availLabel}</span>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-white/35">Room {room.room_number}</p>

          {/* Pending requests ahead */}
          {(room.pending_bookings_count ?? 0) > 0 && (
            <p className="mt-1 text-[11px] font-bold text-amber-400">
              {room.pending_bookings_count} request{(room.pending_bookings_count ?? 0) === 1 ? '' : 's'} ahead of you
            </p>
          )}

          <p className="mt-2 text-base font-black text-white sm:text-lg">
            {room.pricing?.currency ?? 'KES'}{' '}
            {Number(room.pricing?.monthly_rent ?? 0).toLocaleString()}
            <span className="text-xs font-semibold text-white/35"> /mo</span>
          </p>

          <p className="mt-1.5 text-xs font-medium text-white/40">
            Capacity {room.capacity}
            {location && ` · ${location}`}
          </p>

          {toArray(room.amenities).length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {toArray(room.amenities)
                .slice(0, 3)
                .map(a => (
                  <span
                    key={a}
                    className="rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-white/45"
                  >
                    {a}
                  </span>
                ))}
            </div>
          )}

          {/* CTAs */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="flex-1 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 py-2 text-xs font-black text-white shadow-sm shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Book Room
            </button>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/20"
                aria-label="Contact via WhatsApp"
              >
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </article>

      <BookingRequestModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        room={room}
        listingSlug={listing.slug || listing.id}
        listingTitle={listing.title}
      />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSharedRoomType(houseType: string | null | undefined): boolean {
  return ['hostel', 'dormitory', 'student_hostel'].includes(
    (houseType ?? '').toLowerCase().replace(/ /g, '_'),
  );
}

/** Normalize both old Record<string,number> and new NearbyItem[] shapes */
function normalizeNearby(
  nearby: NearbyItem[] | Record<string, number> | undefined,
): NearbyItem[] {
  if (!nearby) return [];
  if (Array.isArray(nearby)) return nearby;
  return Object.entries(nearby).map(([name, distance_km]) => ({
    type: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    distance_km,
  }));
}

function mediaToUrl(media: string | MediaItem | null | undefined): string | null {
  if (!media) return null;
  if (typeof media === 'string') return media;
  return (
    media.optimized_urls?.large ??
    media.optimized_urls?.medium ??
    media.optimized_urls?.small ??
    media.optimized_urls?.thumbnail ??
    null
  );
}

function buildListingGallery(listing: Listing): Array<string | MediaItem> {
  const rooms = toArray(listing.units?.rooms);
  const candidates = [
    listing.media?.cover,
    ...toArray(listing.media?.gallery),
    ...rooms.flatMap(room => [room.media?.cover, ...toArray(room.media?.gallery)]),
  ];
  return candidates.filter(
    (img): img is string | MediaItem =>
      (typeof img === 'string' && img.length > 0) || !!(img && typeof img === 'object'),
  );
}

function formatType(value?: string | null): string {
  if (!value) return 'Property';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

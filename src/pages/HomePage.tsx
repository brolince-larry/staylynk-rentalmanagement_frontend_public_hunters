import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, BadgeCheck, Building2, Clock, Heart, Map as MapIcon, Play, Star } from 'lucide-react';
import { useHomeData } from '../api/listingApi';
import { useStore } from '../stores/listingStore';
import { ListingCard } from '../components/shared/ListingCard';
import { CardSkeleton } from '../components/shared/Skeletons';
// AI search box — disabled on the public frontend until v2, see PlainSearchBox.
import { PlainSearchBox } from '../components/public/PlainSearchBox';
import { Seo } from '../components/seo/Seo';
import { PROPERTY_CATEGORY_OPTIONS } from '../constants/propertyTypes';
import { toArray } from '../utils/collection';
import heroBackdrop from '../assets/hero-backdrop.jpg';
import phoneScreen from '../assets/phone-screen.jpg';

// Shared scroll-reveal presets — keeps every section's entrance consistent
// without repeating the same object literal everywhere.
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const staggerContainer = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: containerVariants,
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};
const staggerItem = { variants: itemVariants };

// Distinct color per lifestyle category card — cycles if there are ever more
// than 6 categories shown.
const CATEGORY_STYLES = [
  { bg: 'bg-violet-50 dark:bg-violet-500/[0.07]',   ring: 'hover:border-violet-200 dark:hover:border-violet-500/30',   chip: 'bg-gradient-to-br from-violet-500 to-fuchsia-500' },
  { bg: 'bg-amber-50 dark:bg-amber-500/[0.07]',     ring: 'hover:border-amber-200 dark:hover:border-amber-500/30',     chip: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/[0.07]', ring: 'hover:border-emerald-200 dark:hover:border-emerald-500/30', chip: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  { bg: 'bg-sky-50 dark:bg-sky-500/[0.07]',         ring: 'hover:border-sky-200 dark:hover:border-sky-500/30',         chip: 'bg-gradient-to-br from-sky-500 to-blue-500' },
  { bg: 'bg-rose-50 dark:bg-rose-500/[0.07]',       ring: 'hover:border-rose-200 dark:hover:border-rose-500/30',       chip: 'bg-gradient-to-br from-rose-500 to-pink-500' },
  { bg: 'bg-indigo-50 dark:bg-indigo-500/[0.07]',   ring: 'hover:border-indigo-200 dark:hover:border-indigo-500/30',   chip: 'bg-gradient-to-br from-indigo-500 to-violet-500' },
];

const TESTIMONIALS = [
  { name: 'Amina H.',    quote: 'The short videos made it obvious which homes were worth viewing.',                    rating: 5 },
  { name: 'Brian K.',    quote: 'I searched in plain English and found a verified apartment the same day.',            rating: 5 },
  { name: 'Wanjiku M.',  quote: 'The map and nearby recommendations helped me avoid bad commutes.',                    rating: 5 },
  { name: 'Kevin O.',    quote: 'Booking a viewing took seconds. No back-and-forth calls with agents.',                rating: 5 },
  { name: 'Faith N.',    quote: 'Every listing I clicked on was actually still available. First time that\'s happened.', rating: 4 },
  { name: 'Peter M.',    quote: 'The trust badges saved me from two sketchy landlords before I even called them.',     rating: 5 },
  { name: 'Grace W.',    quote: 'Found a bedsitter near campus with WiFi already confirmed. Moved in within a week.',  rating: 5 },
  { name: 'Samuel K.',   quote: 'Comparing three apartments side by side made the decision so much easier.',           rating: 4 },
  { name: 'Cynthia A.',  quote: 'The verified landlord tag gave me the confidence to pay a deposit remotely.',         rating: 5 },
  { name: 'Dennis R.',   quote: 'Switched from another site after wasting a weekend on dead listings there.',          rating: 5 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const setFilters = useStore(s => s.setFilters);
  const { data, isLoading, isError } = useHomeData();
  const home = data?.data;
  const featuredListings = toArray(home?.featured);
  const categories = toArray(home?.categories);
  const categoryCounts = new Map(categories.map(c => [c.type, c.count]));
  const stats = [
    { label: 'Verified homes',  value: `${(home?.stats?.verified_listings ?? 1200).toLocaleString()}+` },
    { label: 'Live vacancies',  value: `${(home?.stats?.total_listings ?? 5400).toLocaleString()}+` },
    { label: 'Featured picks',  value: `${(home?.stats?.featured_listings ?? 220).toLocaleString()}+` },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-slate-950 dark:bg-[#0d0d14] dark:text-white">
      <Seo
        title="StayLynk | Verified House Hunting in Kenya"
        description="Find verified rentals with smart search, short video tours, smart filters, maps, and viewing booking on StayLynk."
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f7f7f4] to-transparent dark:from-[#0d0d14]" />

        {/* Ambient brand glow blobs — pure CSS, no extra assets */}
        <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-[110px] animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold-500/20 blur-[100px] animate-glow-pulse [animation-delay:1.2s]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1480px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="max-w-4xl">
            <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white/85 backdrop-blur"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Kenya's premium rental marketplace
            </motion.div>
            <motion.h1
              className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              Find the home that matches how you actually live.
            </motion.h1>
            <motion.p
              className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/70 sm:text-lg"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              Search naturally, watch short tours, compare verified homes, and book viewings without chasing stale listings.
            </motion.p>

            <motion.div
              className="mt-8 max-w-3xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <PlainSearchBox />
            </motion.div>

            <motion.div
              className="mt-8 grid max-w-2xl grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-premium-sm backdrop-blur transition hover:border-gold-400/40 hover:bg-white/[0.14]"
                >
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold text-white/55">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Phone mockup ──────────────────────────────────────────────────── */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.92, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow behind the device */}
            <div className="absolute inset-6 rounded-[3rem] bg-brand-gradient opacity-30 blur-3xl animate-glow-pulse" />

            <div className="relative mx-auto w-[300px] animate-float">
              {/* Device bezel */}
              <div className="relative rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-premium">
                {/* Side buttons */}
                <span className="absolute -left-[13px] top-24 h-8 w-[3px] rounded-full bg-slate-700" />
                <span className="absolute -left-[13px] top-36 h-12 w-[3px] rounded-full bg-slate-700" />
                <span className="absolute -right-[13px] top-28 h-16 w-[3px] rounded-full bg-slate-700" />

                {/* Screen */}
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-slate-900">
                  <img
                    src={phoneScreen}
                    alt="Premium apartment interior"
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />

                  {/* Notch */}
                  <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

                  <div className="absolute left-4 top-9 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
                    Short tour 01 / 20
                  </div>
                  <div className="absolute bottom-7 left-4 right-4">
                    <button
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl transition hover:scale-105"
                      aria-label="Play featured video tour"
                    >
                      <Play size={22} fill="currentColor" strokeWidth={0} />
                    </button>
                    <p className="text-xl font-black text-white">Modern Westlands apartment</p>
                    <p className="mt-1 text-sm font-semibold text-white/65">KSh 25,000 monthly · verified landlord</p>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/70" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust pillars ─────────────────────────────────────────────────────── */}
      <motion.section
        className="mx-auto grid max-w-[1480px] gap-4 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8"
        {...staggerContainer}
      >
        {[
          { icon: <BadgeCheck size={20} />, title: 'Verified only',  text: 'Trust badges, availability, and landlord checks.' },
          { icon: <Play size={20} />,       title: 'Short tours',    text: 'Swipe through up to 20 videos per property.' },
          { icon: <MapIcon size={20} />,    title: 'Map aware',      text: 'Explore nearby schools, transport, shops, and services.' },
          { icon: <Clock size={20} />,      title: 'Book viewings',  text: 'Request visits from the property page in seconds.' },
        ].map(item => (
          <motion.article
            key={item.title}
            {...staggerItem}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-premium-sm dark:border-white/[0.07] dark:bg-[#141421] dark:hover:border-brand-500/30"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-brand-600/25 transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-white/45">{item.text}</p>
          </motion.article>
        ))}
      </motion.section>

      {/* ── Explore by lifestyle ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <motion.div className="mb-5 flex flex-wrap items-end justify-between gap-3" {...fadeUp} transition={{ duration: 0.6 }}>
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Explore by lifestyle</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/45">Fast entry points for common house-hunting missions.</p>
          </div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
          >
            Open video feed <ArrowRight size={15} />
          </Link>
        </motion.div>
        <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" {...staggerContainer}>
          {PROPERTY_CATEGORY_OPTIONS.slice(0, 6).map((category, index) => {
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
            return (
              <motion.button
                key={category.value}
                {...staggerItem}
                type="button"
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-premium-sm dark:border-white/[0.07] ${style.bg} ${style.ring}`}
                onClick={() => {
                  setFilters({ house_type: category.value, property_type: undefined });
                  navigate('/browse');
                }}
              >
                <span
                  className={`relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md animate-float transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${style.chip}`}
                  style={{ animationDelay: `${index * 0.35}s` }}
                >
                  <Building2 size={20} />
                </span>
                <span className="relative block text-sm font-black text-slate-950 dark:text-white">{category.label}</span>
                <span className="relative mt-1 block text-xs font-bold text-slate-500 dark:text-white/40">
                  {(categoryCounts.get(category.value) ?? 0).toLocaleString()}+ listings
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Featured listings ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <motion.div className="mb-5 flex flex-wrap items-end justify-between gap-3" {...fadeUp} transition={{ duration: 0.6 }}>
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Recommended right now</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/45">
              Premium cards optimized for scanning, saving, comparing, and booking. Hover a card to flip it.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-black text-slate-700 transition hover:text-brand-600 dark:text-white/60 dark:hover:text-brand-400"
          >
            View all homes
          </Link>
        </motion.div>
        <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" {...staggerContainer}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : featuredListings.slice(0, 4).map(listing => (
                <motion.div key={listing.id} {...staggerItem}>
                  <ListingCard listing={listing} variant="featured" />
                </motion.div>
              ))}
          {isError && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 dark:border-white/[0.07] dark:bg-[#141421] dark:text-white/40">
              Unable to load live recommendations right now.
            </div>
          )}
        </motion.div>
      </section>

      {/*
        ── AI search CTA ──────────────────────────────────────────────────────
        Disabled on the public frontend until v2 (AI is admin-only on the
        backend for now). Restore this section once public AI search ships.
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 dark:shadow-black/50 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/70">
                <ShieldCheck size={13} />
                Search smarter
              </div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Tell StayLynk what matters. Let AI narrow the noise.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/60">
                Combine budget, safety, commute, school, pet, and amenity needs in one sentence. The assistant converts it into filters and keeps your search lightweight.
              </p>
            </div>
            <div className="grid gap-3">
              {['Safe neighborhood for family under 40k', 'Bedsitter near university with WiFi', 'Pet friendly apartment in Kilimani'].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-black text-slate-950 transition hover:bg-brand-50"
                  onClick={() => {
                    setFilters({ search: prompt, location: prompt, sort: 'smart' });
                    navigate('/browse');
                  }}
                >
                  {prompt}
                  <Sparkles size={15} className="shrink-0 text-brand-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <motion.section className="overflow-hidden py-14" {...fadeUp} transition={{ duration: 0.6 }}>
        <div className="mx-auto mb-6 max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">What renters are saying</h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/45">Real feedback from people who found their home on StayLynk.</p>
        </div>

        <div className="marquee-fade relative">
          <div className="marquee-pause flex w-max animate-marquee gap-4 px-4 sm:px-6 lg:px-8">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((review, i) => (
              <article
                key={`${review.name}-${i}`}
                className="w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium-sm dark:border-white/[0.07] dark:bg-[#141421]"
              >
                <div className="mb-3 flex gap-1 text-gold-500">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm font-medium leading-6 text-slate-600 dark:text-white/60">"{review.quote}"</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                  <Heart size={14} className="text-rose-500" fill="currentColor" strokeWidth={0} />
                  {review.name}
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}

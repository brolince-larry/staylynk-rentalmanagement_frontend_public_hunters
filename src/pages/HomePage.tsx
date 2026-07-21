import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Building2, Clock, Heart, Map as MapIcon, Play, Star } from 'lucide-react';
import { useHomeData } from '../api/listingApi';
import { useStore } from '../stores/listingStore';
import { ListingCard } from '../components/shared/ListingCard';
import { CardSkeleton } from '../components/shared/Skeletons';
// AI search box — disabled on the public frontend until v2, see PlainSearchBox.
// import { AISearchBox } from '../components/public/AISearchBox';
import { PlainSearchBox } from '../components/public/PlainSearchBox';
import { Seo } from '../components/seo/Seo';
import { PROPERTY_CATEGORY_OPTIONS } from '../constants/propertyTypes';
import { toArray } from '../utils/collection';

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
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'StayLynk',
          url: typeof window === 'undefined' ? 'https://staylynk.co.ke' : window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${typeof window === 'undefined' ? 'https://staylynk.co.ke' : window.location.origin}/browse?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2200&q=88')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f7f7f4] to-transparent dark:from-[#0d0d14]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1480px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="max-w-4xl">
            {/* AI-guided discovery badge — disabled until v2 */}
            {/* <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-white/85 backdrop-blur"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles size={13} />
              AI guided rental discovery
            </motion.div> */}
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

            <div className="mt-8 max-w-3xl">
              <PlainSearchBox />
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold text-white/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="hidden overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:block"
            initial={{ opacity: 0, scale: 0.94, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=85"
                alt="Premium apartment interior"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
              <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
                Short tour 01 / 20
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <button className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl" aria-label="Play featured video tour">
                  <Play size={22} fill="currentColor" strokeWidth={0} />
                </button>
                <p className="text-2xl font-black text-white">Modern Westlands apartment</p>
                <p className="mt-1 text-sm font-semibold text-white/65">KSh 25,000 monthly · verified landlord</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust pillars ─────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1480px] gap-4 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          { icon: <BadgeCheck size={20} />, title: 'Verified only',  text: 'Trust badges, availability, and landlord checks.' },
          { icon: <Play size={20} />,       title: 'Short tours',    text: 'Swipe through up to 20 videos per property.' },
          { icon: <MapIcon size={20} />,    title: 'Map aware',      text: 'Explore nearby schools, transport, shops, and services.' },
          { icon: <Clock size={20} />,      title: 'Book viewings',  text: 'Request visits from the property page in seconds.' },
        ].map(item => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/20">
              {item.icon}
            </div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-white/45">{item.text}</p>
          </article>
        ))}
      </section>

      {/* ── Explore by lifestyle ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
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
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PROPERTY_CATEGORY_OPTIONS.slice(0, 6).map(category => (
            <button
              key={category.value}
              type="button"
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/60 dark:border-white/[0.07] dark:bg-[#141421] dark:hover:border-violet-500/30 dark:hover:shadow-none"
              onClick={() => {
                setFilters({ house_type: category.value, property_type: undefined });
                navigate('/browse');
              }}
            >
              <Building2 className="mb-5 text-slate-400 transition group-hover:text-violet-600 dark:text-white/25 dark:group-hover:text-violet-400" size={22} />
              <span className="block text-sm font-black text-slate-950 dark:text-white">{category.label}</span>
              <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-white/40">
                {(categoryCounts.get(category.value) ?? 0).toLocaleString()}+ listings
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured listings ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Recommended right now</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/45">
              Premium cards optimized for scanning, saving, comparing, and booking.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-black text-slate-700 transition hover:text-violet-600 dark:text-white/60 dark:hover:text-violet-400"
          >
            View all homes
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : featuredListings.slice(0, 4).map(listing => (
                <ListingCard key={listing.id} listing={listing} variant="featured" />
              ))}
          {isError && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 dark:border-white/[0.07] dark:bg-[#141421] dark:text-white/40">
              Unable to load live recommendations right now.
            </div>
          )}
        </div>
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
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-black text-slate-950 transition hover:bg-violet-50"
                  onClick={() => {
                    setFilters({ search: prompt, location: prompt, sort: 'smart' });
                    navigate('/browse');
                  }}
                >
                  {prompt}
                  <Sparkles size={15} className="shrink-0 text-violet-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'Amina H.',   quote: 'The short videos made it obvious which homes were worth viewing.',   rating: 5 },
            { name: 'Brian K.',   quote: 'I searched in plain English and found a verified apartment the same day.', rating: 5 },
            { name: 'Wanjiku M.', quote: 'The map and nearby recommendations helped me avoid bad commutes.',   rating: 5 },
          ].map(review => (
            <article key={review.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
              <div className="mb-3 flex gap-1 text-amber-400">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
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
      </section>
    </main>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useFacets, useListings } from '../api/listingApi';
import { useStore, useFilters, useActiveFilterCount } from '../stores/listingStore';
import { useRealtimeListings } from '../hooks/useRealtimeListings';
import { BrowseTopBar } from '../components/browse/BrowseTopBar';
import { BrowseFilters } from '../components/browse/BrowseFilters';
import { ListingCard } from '../components/shared/ListingCard';
import { BrowseCardSkeleton } from '../components/shared/Skeletons';
// AI search box — disabled on the public frontend until v2, see PlainSearchBox.
import { PlainSearchBox } from '../components/public/PlainSearchBox';
import { Seo } from '../components/seo/Seo';
import type { Listing } from '../types';
import { toArray } from '../utils/collection';

export default function BrowsePage() {
  const filters      = useFilters();
  const setFilters   = useStore(s => s.setFilters);
  const showMobile   = useStore(s => s.showMobileFilters);
  const toggleMobile = useStore(s => s.toggleMobileFilters);
  const activeCount  = useActiveFilterCount();

  useRealtimeListings(filters.city);

  const { data, isLoading, isFetching, isError, refetch } = useListings(filters);
  const { data: facetsData, isLoading: facetsLoading } = useFacets(filters.city);
  const listings = toArray(data?.data);
  const meta     = data?.meta;
  const facets   = facetsData?.data;

  const locationLabel = filters.city
    ? `Showing properties in ${filters.city}`
    : 'Showing all properties';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0d14]">
      <Seo
        title="Browse Verified Rentals | StayLynk"
        description="Search verified rentals with smart filters, map-aware discovery, and short video tours."
        canonicalPath="/browse"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          name: 'StayLynk rental search',
          description: 'Verified rental listings and house-hunting search results.',
        }}
      />
      <BrowseTopBar />

      {/* Breadcrumb */}
      <div className="mx-auto flex max-w-[1480px] items-center gap-2 px-4 py-4 text-xs font-medium text-slate-400 dark:text-white/30 sm:px-6 lg:px-8">
        <Link to="/" className="transition hover:text-violet-600 dark:hover:text-violet-400">Home</Link>
        <span aria-hidden="true">›</span>
        <span className="font-bold text-slate-700 dark:text-white/70">Browse</span>
      </div>

      <div className="mx-auto flex max-w-[1480px] items-start gap-5 px-4 pb-16 sm:px-6 lg:px-8">

        {/* Desktop sidebar */}
        <div className="sticky top-[148px] hidden max-h-[calc(100vh-164px)] w-72 shrink-0 overflow-y-auto lg:block">
          <BrowseFilters facets={facets} facetsLoading={facetsLoading} />
        </div>

        {/* Mobile filter drawer */}
        {showMobile && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={toggleMobile}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white shadow-2xl dark:bg-[#141421] lg:hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
                <span className="font-black text-sm text-slate-950 dark:text-white">Filters</span>
                <button
                  onClick={toggleMobile}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/[0.07]"
                  aria-label="Close filters"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <BrowseFilters facets={facets} facetsLoading={facetsLoading} />
              </div>
            </div>
          </>
        )}

        {/* Main results */}
        <main className="min-w-0 flex-1" id="results" aria-label="Property listings">

          {/* Search */}
          <section className="mb-5 overflow-hidden rounded-3xl bg-slate-950 p-4 shadow-xl dark:shadow-black/40 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <p className="text-xs font-black uppercase text-white/45">Search</p>
                <h1 className="text-2xl font-black sm:text-3xl">Find your next home</h1>
              </div>
              <Link
                to="/feed"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                Watch short tours
              </Link>
            </div>
            <PlainSearchBox compact />
          </section>

          {/* Results header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              {isLoading
                ? <div className="mb-1 h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/[0.08]" />
                : <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    {(meta?.total ?? 0).toLocaleString()} Properties Found
                  </h2>
              }
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/45">
                {locationLabel}
                {isFetching && !isLoading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-violet-500 dark:text-violet-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse dark:bg-violet-400" />
                    Updating…
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition lg:hidden ${
                  activeCount > 0
                    ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'border-slate-200 text-slate-700 dark:border-white/[0.08] dark:text-white/65'
                }`}
                onClick={toggleMobile}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-violet-600 px-1.5 text-[10px] font-black text-white">{activeCount}</span>
                )}
              </button>

              <span className="text-sm font-bold text-slate-500 dark:text-white/40">Sort by:</span>
              <select
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-black text-slate-950 shadow-sm transition focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-[#1a1a2c] dark:text-white select-caret"
                value={filters.sort ?? 'smart'}
                onChange={e => setFilters({ sort: e.target.value as typeof filters.sort })}
                aria-label="Sort results"
              >
                <option value="smart">Best Match</option>
                <option value="newest">Newest First</option>
                <option value="type_date">By Type & Date</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>


          {/* Error */}
          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-900/10" role="alert">
              <p className="mb-3 text-sm text-red-700 dark:text-red-400">Failed to load listings. Please try again.</p>
              <button
                className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </div>
          )}

          {/* Skeletons */}
          {isLoading && (
            <div className="flex flex-col gap-3" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => <BrowseCardSkeleton key={i} />)}
            </div>
          )}

          {/* Results */}
          {!isLoading && !isError && (
            <>
              {listings.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500 dark:border-white/[0.07] dark:bg-[#141421] dark:text-white/40">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p className="text-sm font-medium">No properties match your filters.</p>
                  <button
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50 dark:border-white/[0.1] dark:hover:bg-white/[0.05]"
                    onClick={() => useStore.getState().resetFilters()}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : filters.sort === 'type_date' ? (
                <GroupedListingResults listings={listings} />
              ) : (
                <VirtualizedListingResults listings={listings} />
              )}

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <nav className="flex items-center justify-center gap-1 py-8" aria-label="Results pages">
                  <PaginationBtn
                    label="‹"
                    disabled={meta.current_page === 1}
                    onClick={() => setFilters({ page: meta.current_page - 1 })}
                    ariaLabel="Previous page"
                  />
                  {buildPageNumbers(meta.current_page, meta.last_page).map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="w-9 text-center text-sm text-slate-400 dark:text-white/25">…</span>
                    ) : (
                      <PaginationBtn
                        key={p}
                        label={String(p)}
                        active={p === meta.current_page}
                        onClick={() => setFilters({ page: p as number })}
                        ariaLabel={`Page ${p}`}
                        ariaCurrent={p === meta.current_page ? 'page' : undefined}
                      />
                    )
                  )}
                  <PaginationBtn
                    label="Next ›"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => setFilters({ page: meta.current_page + 1 })}
                    ariaLabel="Next page"
                    wide
                  />
                </nav>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTypeName(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function GroupedListingResults({ listings }: { listings: Listing[] }) {
  const groups: { type: string; items: Listing[] }[] = [];
  for (const listing of listings) {
    const type = listing.house_types?.[0] ?? 'other';
    const last = groups[groups.length - 1];
    if (last && last.type === type) {
      last.items.push(listing);
    } else {
      groups.push({ type, items: [listing] });
    }
  }
  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <div key={group.type}>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs font-black text-violet-400 dark:text-violet-300">
              {formatTypeName(group.type)}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-white/30">
              {group.items.length} listing{group.items.length !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-white/[0.06]" />
          </div>
          <div className="flex flex-col gap-3">
            {group.items.map(listing => (
              <ListingCard key={listing.id} listing={listing} variant="browse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VirtualizedListingResults({ listings }: { listings: Listing[] }) {
  const parentRef    = useRef<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(parentRef.current?.offsetTop ?? 0);
  }, [listings.length]);

  const virtualizer = useWindowVirtualizer({
    count: listings.length,
    estimateSize: () => 245,
    overscan: 5,
    scrollMargin,
  });

  return (
    <div
      ref={parentRef}
      className="relative"
      style={{ height: virtualizer.getTotalSize() }}
      aria-label="Virtualized property result list"
    >
      {virtualizer.getVirtualItems().map(row => {
        const listing = listings[row.index];
        if (!listing) return null;
        return (
          <div
            key={row.key}
            ref={virtualizer.measureElement}
            data-index={row.index}
            className="absolute left-0 top-0 w-full pb-3"
            style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
          >
            <ListingCard listing={listing} variant="browse" />
          </div>
        );
      })}
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3)  pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

function PaginationBtn({
  label, onClick, disabled, active, ariaLabel, ariaCurrent, wide,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
  ariaCurrent?: 'page';
  wide?: boolean;
}) {
  return (
    <button
      className={`${wide ? 'px-3' : 'w-9'} flex h-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${
        active
          ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-600'
          : disabled
            ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-white/[0.05] dark:text-white/20'
            : 'border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {label}
    </button>
  );
}

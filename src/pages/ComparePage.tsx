import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCompareBucket, useCompareBucketActions } from '../hooks/useCompareBucket';
import { SmartImage } from '../components/media/SmartImage';
import { CompareButton } from '../components/shared/CompareButton';
import { toArray } from '../utils/collection';
import type { Listing } from '../types';

export default function ComparePage() {
  const { data: bucket, isLoading, isError, refetch } = useCompareBucket();
  const { clear } = useCompareBucketActions();
  const items = bucket?.items ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Compare Listings</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              This private comparison list belongs to this browser. No account is required.
              {' '}Saved listings expire after {bucket?.expires_in_days ?? 30} days.
              {' '}Max comparison items: {bucket?.max_items ?? 0}.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
              onClick={() => clear.mutate()}
              disabled={clear.isPending}
            >
              <Trash2 size={15} />
              Clear Bucket
            </button>
          )}
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-3 text-sm font-medium text-red-700">Unable to load your compare bucket.</p>
            <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-black text-red-700" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">No listings in your compare bucket</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Add public listings while browsing to compare rooms, prices, availability and features before choosing where to move.</p>
            <Link to="/browse" className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white">
              Browse Properties
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
              {bucket?.count ?? items.length} of {bucket?.max_items ?? items.length} comparison slots used.
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map(item => (
                <CompareCard
                  key={item.bucket_id}
                  listing={item.listing}
                  expiresAt={item.expires_at}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function CompareCard({ listing, expiresAt }: { listing: Listing; expiresAt: string }) {
  const rooms = toArray(listing.units?.rooms);
  const cover = listing.media?.cover || '/images/property-placeholder.webp';

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Link to={`/listing/${listing.slug || listing.id}`} className="block">
        <SmartImage
          src={cover}
          alt={listing.title}
          aspectRatio="4 / 3"
          sizes="(max-width: 768px) 92vw, 420px"
        />
      </Link>
      <div className="p-4">
        <Link to={`/listing/${listing.slug || listing.id}`} className="line-clamp-2 text-base font-black text-slate-950 hover:text-blue-600">
          {listing.title}
        </Link>
        <p className="mt-2 text-lg font-black text-slate-950">{listing.pricing?.display ?? 'Price on request'}</p>
        <p className="mt-1 text-sm font-bold text-emerald-600">
          {listing.units?.available ?? 0} vacant room{listing.units?.available === 1 ? '' : 's'}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
          <span className="rounded bg-slate-50 px-2 py-1">{listing.units?.total ?? rooms.length} total rooms</span>
          <span className="rounded bg-slate-50 px-2 py-1">{rooms.length} room details</span>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-400">Expires {formatDate(expiresAt)}</p>
        <CompareButton slug={listing.slug || listing.id} className="mt-4 w-full" />
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

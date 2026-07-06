function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 dark:bg-white/[0.07] ${className}`} />;
}

export function CategorySkeleton() {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
      <Pulse className="h-8 w-8 rounded-full" />
      <Pulse className="h-3 w-20" />
      <Pulse className="h-3 w-16" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
      <Pulse className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Pulse className="h-3 w-2/3" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function BrowseCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#141421] max-sm:flex-col">
      <Pulse className="h-48 w-full rounded-none sm:h-56 sm:w-72" />
      <div className="flex-1 space-y-4 p-5">
        <div className="flex justify-between gap-4">
          <div className="w-full space-y-3">
            <Pulse className="h-5 w-2/3" />
            <Pulse className="h-3 w-40" />
            <Pulse className="h-5 w-36" />
          </div>
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Pulse className="h-4 w-16" />
          <Pulse className="h-4 w-16" />
          <Pulse className="h-4 w-20" />
          <Pulse className="h-4 w-14" />
        </div>
        <Pulse className="h-px w-full rounded-none" />
        <Pulse className="h-4 w-28" />
      </div>
    </div>
  );
}

export function FilterCountSkeleton() {
  return <Pulse className="h-3 w-7" />;
}

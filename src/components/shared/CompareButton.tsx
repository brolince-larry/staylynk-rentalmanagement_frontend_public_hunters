import clsx from 'clsx';
import { GitCompareArrows, Loader2, X } from 'lucide-react';
import { useCompareBucketActions, useIsCompared } from '../../hooks/useCompareBucket';

interface CompareButtonProps {
  slug: string;
  className?: string;
  compact?: boolean;
}

export function CompareButton({ slug, className, compact = false }: CompareButtonProps) {
  const compared = useIsCompared(slug);
  const { add, remove } = useCompareBucketActions();
  const pending = add.isPending || remove.isPending;

  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-black transition-colors disabled:cursor-wait disabled:opacity-70',
        compared
          ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-white/[0.08] dark:bg-white/[0.07] dark:text-white/70 dark:hover:bg-white/[0.1]'
          : 'border-violet-600 bg-violet-600 text-white hover:bg-violet-500 dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500',
        className,
      )}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        if (pending) return;
        if (compared) remove.mutate(slug);
        else add.mutate(slug);
      }}
      disabled={pending}
      aria-pressed={compared}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : compared ? <X size={14} /> : <GitCompareArrows size={14} />}
      {compact ? (compared ? 'Remove' : 'Compare') : compared ? 'Remove' : 'Add to Compare'}
    </button>
  );
}

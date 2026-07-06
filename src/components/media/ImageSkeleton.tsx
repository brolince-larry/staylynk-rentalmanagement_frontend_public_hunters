import { memo } from 'react';
import type { CSSProperties } from 'react';
import clsx from 'clsx';

interface ImageSkeletonProps {
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export const ImageSkeleton = memo(function ImageSkeleton({
  className,
  style,
  label = 'Loading image',
}: ImageSkeletonProps) {
  return (
    <div
      className={clsx('absolute inset-0 overflow-hidden bg-slate-200', className)}
      style={style}
      role="status"
      aria-label={label}
    >
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
    </div>
  );
});

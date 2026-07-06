import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import type { MediaItem } from '../../types';
import { SmartImage } from './SmartImage';

interface MasonryGridProps {
  items: MediaItem[];
  columns?: number;
  className?: string;
  getHref?: (item: MediaItem) => string | undefined;
}

export const MasonryGrid = memo(function MasonryGrid({
  items,
  columns = 3,
  className,
  getHref,
}: MasonryGridProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const rows = Math.ceil(items.length / columns);

  useLayoutEffect(() => {
    setScrollMargin(parentRef.current?.offsetTop ?? 0);
  }, [items.length]);

  const virtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => 360,
    overscan: 3,
    scrollMargin,
  });

  return (
    <div
      ref={parentRef}
      className={clsx('relative w-full', className)}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map(row => {
        const rowItems = items.slice(row.index * columns, row.index * columns + columns);
        return (
          <div
            key={row.key}
            ref={virtualizer.measureElement}
            data-index={row.index}
            className="absolute left-0 top-0 grid w-full gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              transform: `translateY(${row.start - scrollMargin}px)`,
            }}
          >
            {rowItems.map((item, itemIndex) => {
              const ratio = itemIndex % 3 === 1 ? '4 / 5' : itemIndex % 3 === 2 ? '1 / 1' : '3 / 4';
              const image = (
                <SmartImage
                  src={item}
                  alt={item.alt_text ?? 'Property image'}
                  aspectRatio={ratio}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
                  className="rounded-lg"
                />
              );
              const href = getHref?.(item);
              return href ? (
                <a key={item.uuid} href={href} className="block focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {image}
                </a>
              ) : (
                <div key={item.uuid}>{image}</div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

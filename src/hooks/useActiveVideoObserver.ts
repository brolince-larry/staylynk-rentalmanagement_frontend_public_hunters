import { useCallback, useEffect, useRef, useState } from 'react';

export function useActiveVideoObserver(itemCount: number) {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visibleRatios = useRef(new Map<number, number>());
  const [activeIndex, setActiveIndex] = useState(-1);

  const registerItem = useCallback((index: number) => (node: HTMLDivElement | null) => {
    itemRefs.current[index] = node;
  }, []);

  useEffect(() => {
    if (itemCount === 0) {
      queueMicrotask(() => setActiveIndex(-1));
      return;
    }

    const ratios = visibleRatios.current;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = Number((entry.target as HTMLElement).dataset.videoIndex);
          if (Number.isInteger(index)) {
            ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
        });

        const [index, ratio] = [...ratios.entries()]
          .sort((a, b) => b[1] - a[1])[0] ?? [-1, 0];

        setActiveIndex(ratio >= 0.35 ? index : -1);
      },
      { threshold: [0.35, 0.55, 0.75, 0.9] }
    );

    const nodes = itemRefs.current.filter((node): node is HTMLDivElement => node !== null);
    nodes.forEach(node => observer.observe(node));

    return () => {
      ratios.clear();
      observer.disconnect();
    };
  }, [itemCount]);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const targetIndex = Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));
    itemRefs.current[targetIndex]?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'nearest',
    });
  }, [itemCount]);

  return { activeIndex, registerItem, scrollToIndex };
}

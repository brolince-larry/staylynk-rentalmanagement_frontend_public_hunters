import { useEffect, useRef, useState } from 'react';

export function useIntersection<T extends Element>({
  root = null,
  rootMargin = '300px',
  threshold = 0.01,
  freezeOnceVisible = true,
}: IntersectionObserverInit & { freezeOnceVisible?: boolean } = {}) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || (freezeOnceVisible && isIntersecting)) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setIntersecting(true));
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry?.isIntersecting ?? false),
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [freezeOnceVisible, isIntersecting, root, rootMargin, threshold]);

  return { ref, isIntersecting };
}

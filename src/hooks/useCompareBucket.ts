import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCompare, clearCompareBucket, getBucketToken, getCompareBucket, removeFromCompare } from '../services/compareBucket';

export const compareBucketKey = ['listings', 'compare-bucket'] as const;

export function useCompareBucket(enabled = true) {
  return useQuery({
    queryKey: compareBucketKey,
    queryFn: getCompareBucket,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    enabled,
  });
}

export function useCompareBucketActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: compareBucketKey });

  const add = useMutation({
    mutationFn: addToCompare,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: removeFromCompare,
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: clearCompareBucket,
    onSuccess: invalidate,
  });

  return { add, remove, clear };
}

export function useIsCompared(slug: string) {
  const hasToken = !!getBucketToken();
  const { data } = useCompareBucket(hasToken);

  return useMemo(
    () => !!data?.items?.some(item => item.listing?.slug === slug),
    [data?.items, slug],
  );
}

import axios, { type AxiosInstance } from 'axios';
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import type {
  Listing, SearchFilters, PaginatedResponse, ApiResponse,
  MapMarker, Facets, HomeData, InquiryForm, AiChatRequest, AiChatResponse,
  AiSessionResponse, AiSearchRequest, AiSearchResponse, AiRecommendationsRequest,
  AiRecommendationsResponse, AiHistoryResponse, BookRoomRequest, BookRoomResponse,
} from '../types';
import { clearAuthSession } from '../services/aiSession';
import { API_CONFIG } from '../config/api';

// ─── Secure Axios instance ────────────────────────────────────────────────────
// In dev, use Vite's same-origin proxy to avoid browser CORS failures.
export const api: AxiosInstance = axios.create({
  baseURL:         API_CONFIG.API_V1,
  timeout:         12_000,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
  },
});

// Normalise errors — never expose stack traces to the client
api.interceptors.response.use(
  r => r,
  err => {
    if (axios.isCancel(err)) return Promise.reject(err);
    if (err.response?.status === 401) clearAuthSession();
    return Promise.reject({
      status:  err.response?.status  ?? 0,
      message: err.response?.data?.message ?? messageForStatus(err.response?.status),
      errors:  err.response?.data?.errors,
    });
  }
);

function messageForStatus(status?: number) {
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 413) return 'That upload is too large.';
  if (status === 422) return 'Please check the highlighted fields.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  return 'An error occurred';
}

function aiHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

// ─── Raw API calls ────────────────────────────────────────────────────────────
export const listingApi = {
  home: (city?: string, signal?: AbortSignal) =>
    api.get<ApiResponse<HomeData>>('/listings/home', {
      params: city ? { city } : undefined,
      signal,
    }).then(r => r.data),

  search: (filters: SearchFilters, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Listing>>('/listings', { params: filters, signal })
       .then(r => r.data),

  featured: (signal?: AbortSignal) =>
    api.get<ApiResponse<Listing[]>>('/listings/featured', { signal })
       .then(r => r.data),

  facets: (city?: string, signal?: AbortSignal) =>
    api.get<ApiResponse<Facets>>('/listings/facets', {
      params: city ? { city } : undefined,
      signal,
    }).then(r => r.data),

  mapMarkers: (
    bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number },
    filters?: SearchFilters,
    signal?: AbortSignal,
  ) =>
    api.get<{ success: boolean; count: number; markers: MapMarker[] }>('/listings/map', {
      params: { ...bounds, ...filters },
      signal,
    }).then(r => r.data),

  show: (slug: string, signal?: AbortSignal) =>
    api.get<ApiResponse<Listing>>(`/listings/${slug}`, { signal })
       .then(r => r.data),

  inquire: (slug: string, form: InquiryForm) =>
    api.post<ApiResponse<null>>(`/listings/${slug}/inquire`, form, {
      headers: { 'Content-Type': 'application/json' },
    })
       .then(r => r.data),

  bookRoom: (slug: string, data: BookRoomRequest) =>
    api.post<ApiResponse<BookRoomResponse>>(`/listings/${slug}/book-request`, data, {
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.data),

  aiSession: (payload: { session_token?: string } = {}) =>
    api.post<ApiResponse<AiSessionResponse>>('/ai/session', payload, {
      headers: aiHeaders(),
    }).then(r => r.data),

  aiChat: (payload: AiChatRequest) =>
    api.post<ApiResponse<AiChatResponse> | AiChatResponse>('/ai/chat', payload, {
      headers: aiHeaders(),
    }).then(r => r.data),

  aiSearch: (payload: AiSearchRequest) =>
    api.post<ApiResponse<AiSearchResponse>>('/ai/search', payload, {
      headers: aiHeaders(),
    }).then(r => r.data),

  aiRecommendations: (payload: AiRecommendationsRequest) =>
    api.post<ApiResponse<AiRecommendationsResponse>>('/ai/recommendations', payload, {
      headers: aiHeaders(),
    }).then(r => r.data),

  aiHistory: (sessionToken: string) =>
    api.get<ApiResponse<AiHistoryResponse>>('/ai/history', {
      params: { session_token: sessionToken },
      headers: aiHeaders(),
    }).then(r => r.data),

  publish: (
    propertyId: string,
    payload: { title: string; description?: string; address_display?: string },
  ) =>
    api.post<ApiResponse<Listing>>(`/admin/listings/publish/${propertyId}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.data),
};

// ─── Query keys — deterministic, used for cache invalidation ─────────────────
export const qk = {
  home:     (city?: string)     => ['listings', 'home', city ?? '']       as const,
  search:   (f: SearchFilters)  => ['listings', 'search', f]              as const,
  featured:                        ['listings', 'featured']               as const,
  facets:   (city?: string)     => ['listings', 'facets', city ?? '']     as const,
  map:      (b: object, f?: object) => ['listings', 'map', b, f ?? {}]    as const,
  detail:   (slug: string)      => ['listings', 'detail', slug]           as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Home page data — hero, categories, featured, testimonials
 * staleTime 5 min: home data is heavy; never re-fetch on every render
 */
export function useHomeData(city?: string) {
  return useQuery({
    queryKey:  qk.home(city),
    queryFn:   ({ signal }) => listingApi.home(city, signal),
    staleTime: 15 * 60_000,
    gcTime:    60 * 60_000,
    refetchOnMount: false,
  });
}

/**
 * Browse search — keepPreviousData so list never flashes empty on filter change
 * Cached by full filter set; route changes reuse previous successful searches.
 */
export function useListings(filters: SearchFilters) {
  return useQuery({
    queryKey:        qk.search(filters),
    queryFn:         ({ signal }) => listingApi.search(filters, signal),
    staleTime:       30 * 60_000,
    gcTime:          4 * 60 * 60_000,
    refetchOnMount:  false,
    placeholderData: keepPreviousData,
  });
}

/**
 * Infinite scroll variant (mobile)
 */
export function useInfiniteListings(base: SearchFilters) {
  return useInfiniteQuery({
    queryKey:       qk.search(base),
    queryFn:        ({ signal, pageParam }) =>
      listingApi.search({ ...base, page: pageParam as number }, signal),
    getNextPageParam: last =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 15 * 60_000,
    gcTime:    60 * 60_000,
    refetchOnMount: false,
  });
}

/**
 * Facets — cached 10 min; never re-fetch unless city changes
 */
export function useFacets(city?: string) {
  return useQuery({
    queryKey:  qk.facets(city),
    queryFn:   ({ signal }) => listingApi.facets(city, signal),
    staleTime: 60 * 60_000,
    gcTime:    2 * 60 * 60_000,
    refetchOnMount: false,
  });
}

/**
 * Single listing — enabled only when slug is defined
 */
export function useListing(slug: string | null) {
  const queryClient = useQueryClient();

  return useQuery<ApiResponse<Listing>>({
    queryKey: qk.detail(slug ?? ''),
    queryFn:  ({ signal }) => listingApi.show(slug!, signal),
    placeholderData: () => {
      if (!slug) return undefined;

      const cachedSearches = queryClient.getQueriesData<PaginatedResponse<Listing>>({
        queryKey: ['listings', 'search'],
      });

      for (const [, page] of cachedSearches) {
        const listing = page?.data?.find(item => item.slug === slug || item.id === slug);
        if (listing) return { success: true, data: listing };
      }

      const cachedFeatured = queryClient.getQueryData<ApiResponse<Listing[]>>(qk.featured);
      const featuredListing = cachedFeatured?.data?.find(item => item.slug === slug || item.id === slug);
      if (featuredListing) return { success: true, data: featuredListing };

      const cachedHomeEntries = queryClient.getQueriesData<ApiResponse<HomeData>>({
        queryKey: ['listings', 'home'],
      });

      for (const [, home] of cachedHomeEntries) {
        const listing = home?.data?.featured?.find(item => item.slug === slug || item.id === slug);
        if (listing) return { success: true, data: listing };
      }

      return undefined;
    },
    staleTime: 15 * 60_000,
    gcTime:    60 * 60_000,
    refetchOnMount: true,
    enabled:   !!slug,
  });
}

/**
 * Map markers — only when bounds are known, 30s stale
 */
export function useMapMarkers(
  bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number } | null,
  filters?: SearchFilters,
) {
  return useQuery({
    queryKey: qk.map(bounds ?? {}, filters),
    queryFn:  ({ signal }) => listingApi.mapMarkers(bounds!, filters, signal),
    staleTime: 15 * 60_000,
    gcTime:    60 * 60_000,
    refetchOnMount: false,
    enabled:   !!bounds,
  });
}

/**
 * Inquiry mutation
 */
export function useSubmitInquiry() {
  return useMutation({
    mutationFn: ({ slug, form }: { slug: string; form: InquiryForm }) =>
      listingApi.inquire(slug, form),
  });
}

/**
 * Book a room (public hunter flow)
 */
export function useBookRoom() {
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: BookRoomRequest }) =>
      listingApi.bookRoom(slug, data),
  });
}

/**
 * Public AI assistant — backend-owned response, frontend handles presentation.
 */
export function useAiChat() {
  return useMutation({
    mutationFn: (payload: AiChatRequest) => listingApi.aiChat(payload),
  });
}

export function useAiSession() {
  return useMutation({
    mutationFn: (payload: { session_token?: string } = {}) => listingApi.aiSession(payload),
  });
}

export function useAiSearch() {
  return useMutation({
    mutationFn: (payload: AiSearchRequest) => listingApi.aiSearch(payload),
  });
}

export function useAiRecommendations() {
  return useMutation({
    mutationFn: (payload: AiRecommendationsRequest) => listingApi.aiRecommendations(payload),
  });
}

export function useAiHistory() {
  return useMutation({
    mutationFn: (sessionToken: string) => listingApi.aiHistory(sessionToken),
  });
}

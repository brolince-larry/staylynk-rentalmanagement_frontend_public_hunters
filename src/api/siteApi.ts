import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_CONFIG } from '../config/api';

// ─── Secure axios instance — mirrors listingApi's conventions ────────────────
const api = axios.create({
  baseURL: API_CONFIG.API_V1,
  timeout: 15_000,
  withCredentials: false,
  headers: { Accept: 'application/json' },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    return Promise.reject({
      status: err.response?.status ?? 0,
      message: err.response?.data?.message ?? messageForStatus(err.response?.status),
    });
  },
);

function messageForStatus(status?: number) {
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 422) return 'Please check the highlighted fields.';
  return 'Something went wrong. Please try again.';
}

// ─── Types ─────────────────────────────────────────────────────────────────
export interface SiteSettings {
  support_email: string;
  support_phone: string;
  support_phone_display: string;
  support_hours: string;
  whatsapp_number: string;
  whatsapp_url: string;
  office_address: string;
  office_address_full: string;
  landlord_portal_url: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Raw API calls ────────────────────────────────────────────────────────
export const siteApi = {
  settings: (signal?: AbortSignal) =>
    api.get<ApiEnvelope<SiteSettings>>('/site-settings', { signal }).then((r) => r.data.data as SiteSettings),

  submitContact: (data: ContactFormInput) =>
    api.post<ApiEnvelope<never>>('/contact', data).then((r) => r.data),
};

// ─── React Query hooks ──────────────────────────────────────────────────────
export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: ({ signal }) => siteApi.settings(signal),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactFormInput) => siteApi.submitContact(data),
  });
}

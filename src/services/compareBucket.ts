import { api } from '../api/listingApi';
import type { ApiResponse, CompareBucket } from '../types';

const BUCKET_KEY = 'listing_bucket';

export function getBucketToken() {
  return localStorage.getItem(BUCKET_KEY);
}

export function saveBucketToken(token: string) {
  localStorage.setItem(BUCKET_KEY, token);
}

function createBucketToken() {
  if (crypto.randomUUID) return crypto.randomUUID();

  const random = new Uint8Array(24);
  crypto.getRandomValues(random);
  return Array.from(random, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function ensureBucketToken() {
  const existing = getBucketToken();
  if (existing) return existing;

  const token = createBucketToken();
  saveBucketToken(token);
  return token;
}

export function bucketHeaders() {
  const token = ensureBucketToken();

  return token
    ? { 'X-Listing-Bucket': token }
    : {};
}

function persistBucketToken(bucket?: CompareBucket) {
  if (bucket?.bucket_token) saveBucketToken(bucket.bucket_token);
}

export async function addToCompare(slug: string) {
  const res = await api.post<ApiResponse<CompareBucket>>(
    `/listings/${slug}/bucket`,
    {},
    { headers: bucketHeaders() },
  );

  persistBucketToken(res.data.data);
  return res.data.data;
}

export async function removeFromCompare(slug: string) {
  const res = await api.delete<ApiResponse<CompareBucket>>(`/listings/${slug}/bucket`, {
    headers: bucketHeaders(),
  });

  persistBucketToken(res.data.data);
  return res.data.data;
}

export async function getCompareBucket() {
  const res = await api.get<ApiResponse<CompareBucket>>('/listings/bucket', {
    headers: bucketHeaders(),
  });

  persistBucketToken(res.data.data);
  return res.data.data;
}

export async function clearCompareBucket() {
  const res = await api.delete<ApiResponse<CompareBucket>>('/listings/bucket', {
    headers: bucketHeaders(),
  });

  return res.data.data;
}

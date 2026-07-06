import type { AxiosProgressEvent } from 'axios';
import { api } from '../../api/listingApi';
import type { ApiResponse, MediaEntityType, MediaItem, MediaType } from '../../types';
import { API_CONFIG } from '../../config/api';

export const MAX_BULK_GALLERY_FILES = 25;

export const mediaFileLimits = {
  galleryImage: 5 * 1024 * 1024,
  profileImage: 2 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  propertyVideo: API_CONFIG.PROPERTY_VIDEO_MAX_UPLOAD_BYTES,
} as const;

export interface UploadMediaInput {
  file: File;
  media_type: MediaType;
  entity_type: MediaEntityType;
  entity_id: string | number;
  is_public?: boolean;
  is_cover?: boolean;
  alt_text?: string;
}

export interface BulkUploadMediaInput {
  files: File[];
  media_type: MediaType;
  entity_type: MediaEntityType;
  entity_id: string | number;
  is_public?: boolean;
  cover_index?: number;
}

export function validateMediaFiles(
  files: File[],
  kind: keyof typeof mediaFileLimits,
  maxFiles = kind === 'galleryImage' ? MAX_BULK_GALLERY_FILES : 1,
) {
  if (files.length > maxFiles) {
    return `Upload up to ${maxFiles} file${maxFiles === 1 ? '' : 's'} at a time.`;
  }

  const maxSize = mediaFileLimits[kind];
  const oversized = files.find(file => file.size > maxSize);
  if (oversized) {
    return `${oversized.name} exceeds the ${formatFileSize(maxSize)} limit.`;
  }

  return null;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

function appendCommonMediaFields(
  form: FormData,
  input: Pick<UploadMediaInput, 'media_type' | 'entity_type' | 'entity_id' | 'is_public'>,
) {
  form.append('media_type', input.media_type);
  form.append('entity_type', input.entity_type);
  form.append('entity_id', String(input.entity_id));
  form.append('is_public', input.is_public === false ? '0' : '1');
}

export const mediaService = {
  upload(input: UploadMediaInput, onUploadProgress?: (event: AxiosProgressEvent) => void) {
    const form = new FormData();
    form.append('file', input.file);
    appendCommonMediaFields(form, input);
    form.append('is_cover', input.is_cover ? '1' : '0');
    if (input.alt_text) form.append('alt_text', input.alt_text);

    return api.post<ApiResponse<MediaItem>>('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }).then(res => res.data);
  },

  bulkUpload(input: BulkUploadMediaInput, onUploadProgress?: (event: AxiosProgressEvent) => void) {
    const form = new FormData();
    input.files.slice(0, MAX_BULK_GALLERY_FILES).forEach(file => form.append('files[]', file));
    appendCommonMediaFields(form, input);
    form.append('cover_index', String(input.cover_index ?? 0));

    return api.post<ApiResponse<MediaItem[]>>('/media/bulk-upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }).then(res => res.data);
  },

  getPrivateUrl(uuid: string, reason: string) {
    return api.get<ApiResponse<{ url: string }>>(`/media/private/${encodeURIComponent(uuid)}/url`, {
      params: { reason },
    }).then(res => res.data);
  },

  reorder(entity_type: MediaEntityType, entity_id: string | number, items: MediaItem[]) {
    return api.patch<ApiResponse<MediaItem[]>>('/media/reorder', {
      entity_type,
      entity_id,
      items: items.map((item, index) => ({
        uuid: item.uuid,
        sort_order: index,
      })),
    }).then(res => res.data);
  },

  setCover(uuid: string) {
    return api.post<ApiResponse<MediaItem>>('/media/set-cover', { uuid }).then(res => res.data);
  },

  delete(uuid: string) {
    return api.delete<ApiResponse<null>>(`/media/${encodeURIComponent(uuid)}`).then(res => res.data);
  },
};

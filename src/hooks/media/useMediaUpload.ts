import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mediaService, type BulkUploadMediaInput, type UploadMediaInput } from '../../services/media/mediaService';
import type { ApiResponse, MediaItem } from '../../types';

type UploadPhase = 'idle' | 'uploading' | 'processing' | 'complete' | 'failed';

type UploadError = {
  status?: number;
  message?: string;
};

export function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const lastSingleInput = useRef<UploadMediaInput | null>(null);
  const lastBulkInput = useRef<BulkUploadMediaInput | null>(null);

  const handleProgress = (event: { loaded: number; total?: number }) => {
    setPhase('uploading');
    if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
  };

  const handleSuccess = (response: ApiResponse<MediaItem | MediaItem[]>) => {
    const items = Array.isArray(response.data) ? response.data : [response.data];
    setErrorMessage(null);
    setCanRetry(false);
    setPhase(items.some(item => item?.status === 'pending' || item?.status === 'processing') ? 'processing' : 'complete');
  };

  const handleError = (error: UploadError) => {
    setPhase('failed');
    setCanRetry(true);
    setErrorMessage(errorMessageForStatus(error));
  };

  const single = useMutation({
    mutationFn: (input: UploadMediaInput) => {
      lastSingleInput.current = input;
      setCanRetry(false);
      setErrorMessage(null);
      return mediaService.upload(input, handleProgress);
    },
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const bulk = useMutation({
    mutationFn: (input: BulkUploadMediaInput) => {
      lastBulkInput.current = input;
      setCanRetry(false);
      setErrorMessage(null);
      return mediaService.bulkUpload(input, handleProgress);
    },
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return {
    progress,
    phase,
    errorMessage,
    uploadSingle: single,
    uploadBulk: bulk,
    isUploading: single.isPending || bulk.isPending,
    isProcessing: phase === 'processing',
    canRetry,
    retrySingle: () => {
      if (lastSingleInput.current) single.mutate(lastSingleInput.current);
    },
    retryBulk: () => {
      if (lastBulkInput.current) bulk.mutate(lastBulkInput.current);
    },
    resetUploadState: () => {
      setProgress(0);
      setPhase('idle');
      setErrorMessage(null);
      setCanRetry(false);
    },
  };
}

function errorMessageForStatus(error: UploadError) {
  if (error.message) return error.message;
  if (error.status === 401) return 'Please sign in before uploading media.';
  if (error.status === 403) return 'You do not have permission to upload media for this listing.';
  if (error.status === 413) return 'This file is too large for the upload limit.';
  if (error.status === 422) return 'Please check the selected file and try again.';
  if (error.status === 429) return 'Too many upload attempts. Please wait a moment and try again.';
  return 'Upload failed. Please try again.';
}

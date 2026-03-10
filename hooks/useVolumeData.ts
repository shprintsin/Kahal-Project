"use client";

import { useState, useEffect } from 'react';
import type { IVolumeEntry } from '@/types/collections';

interface UseVolumeDataResult {
  volume: IVolumeEntry | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching and managing volume data
 * @param collectionId - Collection ID
 * @param volumeId - Volume ID
 * @returns Volume data, loading state, error, and refetch function
 */
export function useVolumeData(
  collectionId: string,
  volumeId: string
): UseVolumeDataResult {
  const [volume, setVolume] = useState<IVolumeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVolume = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/collections/${collectionId}/volumes/${volumeId}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch volume: ${response.statusText}`);
      }

      const data = await response.json();
      if (!signal?.aborted) {
        setVolume(data);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!signal?.aborted) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!collectionId || !volumeId) return;

    const controller = new AbortController();
    fetchVolume(controller.signal);

    return () => controller.abort();
  }, [collectionId, volumeId]);

  return {
    volume,
    loading,
    error,
    refetch: fetchVolume,
  };
}

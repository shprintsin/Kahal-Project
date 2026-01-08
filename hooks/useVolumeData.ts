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

  const fetchVolume = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/collections/${collectionId}/volumes/${volumeId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch volume: ${response.statusText}`);
      }

      const data = await response.json();
      setVolume(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId && volumeId) {
      fetchVolume();
    }
  }, [collectionId, volumeId]);

  return {
    volume,
    loading,
    error,
    refetch: fetchVolume,
  };
}

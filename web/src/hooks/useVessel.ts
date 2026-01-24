import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';

export interface Vessel {
  id: string;
  tag_id: string;
  sender_id: string | null;
  created_at: string;
}

export interface Memory {
  id: string;
  vessel_id: string;
  media_url: string;
  media_type: string;
  gifter_name: string;
  note_text: string | null;
  created_at: string;
}

export function useVessel(tagId: string | undefined) {
  return useQuery({
    queryKey: ['vessel', tagId],
    queryFn: async () => {
      if (!tagId) throw new Error('No tag ID provided');
      return apiFetch<Vessel>(`/vessels/${tagId}`);
    },
    enabled: !!tagId,
    retry: false, // Don't retry if vessel not found (likely a 404)
  });
}

export function useMemoryByTagId(tagId: string | undefined) {
  return useQuery({
    queryKey: ['memory', tagId],
    queryFn: async () => {
      if (!tagId) throw new Error('No tag ID provided');
      try {
        return await apiFetch<Memory>(`/vessels/${tagId}/memory`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!tagId,
    retry: false,
  });
}

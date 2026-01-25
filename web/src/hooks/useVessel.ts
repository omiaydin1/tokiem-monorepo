import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';

export interface Capsule {
  id: string;
  tag_id: string;
  name: string | null;
  jewelry_type: 'ring' | 'necklace' | 'bracelet' | null;
  sender_id: string | null;
  created_at: string;
  memory_count?: number;
}

export interface Memory {
  id: string;
  vessel_id: string;
  media_url: string;
  media_type: string;
  gifter_name?: string | null;
  note_text: string | null;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useCapsule(tagId: string | undefined) {
  return useQuery({
    queryKey: ['capsule', tagId],
    queryFn: async () => {
      if (!tagId) throw new Error('No tag ID provided');
      return apiFetch<Capsule>(`/vessels/${tagId}`);
    },
    enabled: !!tagId,
    retry: false, // Don't retry if capsule not found (likely a 404)
  });
}

export function useUpdateCapsuleName(tagId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, token }: { name: string; token: string }) => {
      if (!tagId) throw new Error('No tag ID provided');
      return apiFetch<Capsule>(`/vessels/${tagId}/name`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule', tagId] });
    },
  });
}

export function useProfile(token: string | undefined) {
  return useQuery({
    queryKey: ['profile', token],
    queryFn: async () => {
      if (!token) return null;
      return apiFetch<any>('/profiles/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    enabled: !!token,
  });
}

export function useMemoryByTagId(tagId: string | undefined) {
  return useQuery({
    queryKey: ['memory', tagId],
    queryFn: async () => {
      if (!tagId) throw new Error('No tag ID provided');
      try {
        const response = await apiFetch<Memory[] | null>(`/vessels/${tagId}/memory`);
        // If 204 No Content, response might be undefined or null depending on apiFetch implementation
        return response || [];
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!tagId,
    retry: false,
  });
}

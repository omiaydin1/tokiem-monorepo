export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  // Debug log for authentication
  if (options?.headers && (options.headers as any)['Authorization']) {
    console.log(`[apiFetch] Sending request to ${endpoint} with Authorization header (token len: ${(options.headers as any)['Authorization'].length})`);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `API error: ${response.statusText}` }));
    throw new ApiError(error.message || `API error: ${response.statusText}`, response.status);
  }

  // Handle 204 No Content or empty bodies safely
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // If it's not JSON, return the raw text if T is string, otherwise null
    return text as unknown as T;
  }
}

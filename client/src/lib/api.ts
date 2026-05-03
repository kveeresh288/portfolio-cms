import { Project, Skill, ApiResponse } from './types';

// Browser-side: uses /api which Next.js proxies to Express → cookies work same-origin.
// Server-side (serverFetch): talks directly to Express to avoid an extra hop.
const CLIENT_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${CLIENT_BASE}${path}`, {
    credentials: 'include',          // send cookies on every request
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (res.status === 401) {
    // Let the caller handle 401 (admin page redirects to login)
    throw new Error(data.message || 'Unauthorized');
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (body: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Project>) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },

  skills: {
    list: () => request<Skill[]>('/skills'),
    create: (body: Omit<Skill, '_id'>) =>
      request<Skill>('/skills', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Skill>) =>
      request<Skill>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/skills/${id}`, { method: 'DELETE' }),
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ requiresMfa: boolean; preAuthToken?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    verifyTotp: (preAuthToken: string, totpCode: string) =>
      request<void>('/auth/verify-totp', {
        method: 'POST',
        body: JSON.stringify({ preAuthToken, totpCode }),
      }),
    setupTotp: () =>
      request<{ qrCode: string; secret: string }>('/auth/setup-totp'),
    confirmTotp: (totpCode: string) =>
      request<void>('/auth/confirm-totp', {
        method: 'POST',
        body: JSON.stringify({ totpCode }),
      }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ email: string; isTotpEnabled: boolean }>('/auth/me'),
  },

  contact: {
    send: (name: string, email: string, message: string) =>
      request<void>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      }),
  },
};

// ── Server Component helper ───────────────────────────────────────────────────
// Called inside async Server Components (page.tsx). Talks directly to Express
// because there is no browser proxy involved on the server side.
export async function serverFetch<T>(path: string): Promise<T | null> {
  const apiUrl = process.env.API_URL || 'http://localhost:5001/api';
  try {
    const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json: ApiResponse<T> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

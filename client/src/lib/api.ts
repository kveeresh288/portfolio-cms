import { Project, Skill, ApiResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Projects
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
    setupTotp: () => request<{ qrCode: string; secret: string }>('/auth/setup-totp'),
    confirmTotp: (totpCode: string) =>
      request<void>('/auth/confirm-totp', { method: 'POST', body: JSON.stringify({ totpCode }) }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ email: string; isTotpEnabled: boolean }>('/auth/me'),
  },

  contact: {
    send: (name: string, email: string, message: string) =>
      request<void>('/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) }),
  },
};

// Server-side fetch helper (no credentials, used in Next.js Server Components)
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

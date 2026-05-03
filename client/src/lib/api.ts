import { Project, Skill, SiteProfile, MfaChannel, ApiResponse } from './types';

const CLIENT_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${CLIENT_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (res.status === 401) throw new Error(data.message || 'Unauthorized');
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  profile: {
    get: () => request<SiteProfile>('/profile'),
    update: (body: Partial<SiteProfile>) =>
      request<SiteProfile>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },

  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (body: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Project>) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },

  skills: {
    list: () => request<Skill[]>('/skills'),
    create: (body: Omit<Skill, '_id'>) =>
      request<Skill>('/skills', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Skill>) =>
      request<Skill>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/skills/${id}`, { method: 'DELETE' }),
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ requiresMfa: boolean; mfaChannel?: MfaChannel; sessionToken?: string; preAuthToken?: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    verifyEmailOtp: (sessionToken: string, otp: string) =>
      request<void>('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ sessionToken, otp }),
      }),
    verifyTotp: (preAuthToken: string, totpCode: string) =>
      request<void>('/auth/verify-totp', {
        method: 'POST',
        body: JSON.stringify({ preAuthToken, totpCode }),
      }),
    setupTotp: () => request<{ qrCode: string; secret: string }>('/auth/setup-totp'),
    confirmTotp: (totpCode: string) =>
      request<void>('/auth/confirm-totp', { method: 'POST', body: JSON.stringify({ totpCode }) }),
    enableEmailMfa: () => request<void>('/auth/enable-email-mfa', { method: 'POST' }),
    disableMfa: () => request<void>('/auth/disable-mfa', { method: 'POST' }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ email: string; mfaChannel: MfaChannel; isMfaEnabled: boolean }>('/auth/me'),
  },

  contact: {
    send: (name: string, email: string, message: string) =>
      request<void>('/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) }),
  },
};

// Server Component helper — talks directly to Express (server-to-server, no proxy)
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

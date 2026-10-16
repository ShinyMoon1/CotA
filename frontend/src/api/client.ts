// Typed client for the Go backend. Base URL '/api' — Vite-прокси перенаправит на :8080.

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type StatType = 'strength' | 'agility' | 'intellect' | 'vitality' | 'occultism';

export interface Habit {
  id: number;
  user_id: number;
  title: string;
  description: string;
  base_exp: number;
  stat_type: StatType;
  stat_gain: number;
  created_at: string;
}

export const register = (d: { nick_name: string; email: string; password: string }) =>
  apiFetch<{ id: number }>('/users', { method: 'POST', body: JSON.stringify(d) });

export const login = (d: { email: string; password: string }) =>
  apiFetch<{ token: string }>('/login', { method: 'POST', body: JSON.stringify(d) });

export const authTelegram = (initData: string) =>
  apiFetch<{ token: string }>('/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: initData,
  });

export const getUser = (id: number) =>
  apiFetch<{ id: number; nick_name: string; email: string; created_at: string }>(`/users/${id}`);

export const getHabits = (userId: number, limit = 20, offset = 0) =>
  apiFetch<Habit[]>(`/habits?user_id=${userId}&limit=${limit}&offset=${offset}`);

export const createHabit = (d: {
  user_id: number;
  title: string;
  description: string;
  base_exp: number;
  stat_type: StatType;
  stat_gain: number;
}) => apiFetch<{ id: number }>('/habits', { method: 'POST', body: JSON.stringify(d) });

export const getHabit = (id: number) => apiFetch<Habit>(`/habits/${id}`);

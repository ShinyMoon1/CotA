# Project: Runic Habit Tracker — Telegram Mini App (CotA)

## 🚨 КРИТИЧЕСКИ ВАЖНО: БЭКЕНД НЕ ТРОГАТЬ

- Бэкенд (Go) находится в: `cmd/todoapp/main.go`, `internal/`, `migrations/`, `go.mod`, `docker-compose.yaml`, `.env`
- **НИКОГДА** не редактируй, не создавай и не удаляй файлы в этих директориях.
- Твоя зона ответственности — только `frontend/`.
- Если нужен новый эндпоинт — **остановись и напиши мне**, я добавлю его на бэкенде вручную.
- Любая попытка изменения файлов вне `frontend/` считается ошибкой.

---

## Backend API Contract (реальный Go-бэкенд, только для чтения)

**База:** Postgres, схема `CotA`.
**Префикс:** в Go префикса `/api` НЕТ. `/api` добавляет только Vite-прокси (`frontend/vite.config.ts`: `/api -> http://localhost:8080`).
**Авторизация:** `Authorization: Bearer <JWT HS256, sub=user_id, exp 24h>`.
**CORS:** нет (работаем через Vite-прокси).

### Публичные эндпоинты
- `POST /users` — `{ nick_name, email, password }` → `201 { id }`.
  - Ошибки: `400` плохой JSON, `409` email already taken.
  - Создаёт `CotA.users` + через воркер-пул `CotA.character_stats` (1/1/1/1/0).
- `POST /login` — `{ email, password }` → `200 { token }`.
  - Ошибка: `401` login is failed (bcrypt).
- `POST /auth/telegram` — body = **raw initData строкой** (`text/plain`, НЕ JSON) → `200 { token }`.
  - Валидация `init-data-golang` по `TELEGRAM_BOT_TOKEN` (окно 24ч).
  - Если `telegram_id` нет — автосоздаёт юзера: `nick=FirstName|tg_{id}`, `email=tg_{id}@telegram.local`.
  - Ошибка: `401` failed to auth.
- `GET /users/{id}` — → `{ id, nick_name, email, created_at }`.
  - Ошибки: `400` invalid id, `404` user not found.
- `GET /health` — → `Hello!`
- `GET /metrics` — счётчик запросов.

### Приватные эндпоинты (требуют `Authorization: Bearer`)
- `POST /habits` — `{ user_id, title, description, base_exp, stat_type, stat_gain }` → `201 { id }`.
  - `stat_type`: `strength | agility | intellect | vitality | occultism` (таблица `CotA.character_statue`).
- `GET /habits?user_id=X&limit=20&offset=0` → `[{ id, user_id, title, description, base_exp, stat_type, stat_gain, created_at }]`.
  - `user_id` обязателен, `limit` 1..100 (default 20), `offset` >= 0.
- `GET /habits/{id}` → `{ id, user_id, title, description, base_exp, stat_type, stat_gain, created_at }`.
  - Ошибки: `400` invalid id, `404` habit not found.

### 🚫 Чего в бэкенде НЕТ (НЕ ВЫДУМЫВАТЬ!)

Следующих эндпоинтов **не существует**. Не пытайся их вызывать:

- ❌ `GET /api/auth/me`
- ❌ `POST /habits/:id/complete`
- ❌ `GET /api/stats`
- ❌ `GET /api/daily-quests`
- ❌ `GET /api/achievements`
- ❌ `GET /api/analytics/*`

**Прогресс, серии, XP, уровень, квесты, реликвии, ачивки, классы — фронтенд считает ЛОКАЛЬНО.**

Хранилище: `src/game/store.ts` → `localStorage` ключ `dayliki_progress_{uid}`.
Формула уровня: `level = Math.floor(xp / 300) + 1`.

Таблица `CotA.habit_logs` в API **не используется** — логи выполнения привычек тоже храни локально.

---

## Frontend Stack

- React 18 + Vite + TypeScript
- Telegram UI (`@telegram-apps/telegram-ui`)
- Recharts (pie + bar charts)
- Rusich font (runic cyrillic) for headings
- State: локальный стор в `src/game/store.ts` поверх `localStorage`

## Design Language

- Dark fantasy + Slavic runic elements
- Colors: bg `#17191e`, gold `#c9a227`, pale bone `#e8e0d0`
- Runic headings, system sans for body


---

## Rules

1. **НЕ ТРОГАЙ БЭКЕНД.** Только читай его для понимания API.
2. **НЕ ВЫДУМЫВАЙ эндпоинты.** Если чего-то нет в Backend API Contract выше — считай это локально на фронтенде.
3. Все запросы к Go-бэкенду — через `frontend/src/api/client.ts`. Base URL: `/api` (Vite-прокси перенаправит на `:8080`).
4. Авторизация: JWT в `localStorage`, заголовок `Authorization: Bearer <token>`.
5. Telegram-авторизация: `POST /auth/telegram` с **raw initData как text/plain**, НЕ JSON.
6. `stat_type` — строго одно из: `strength | agility | intellect | vitality | occultism`.
7. Прогресс, XP, уровни, ачивки, ежедневные квесты — **локально** в `src/game/store.ts` (ключ `dayliki_progress_{uid}`).
8. Recharts: `<PieChart>` для распределения по статам, `<BarChart>` для истории выполнения.
9. Заголовки — шрифт Rusich, цвет `#c9a227`.
10. Стиль: dark fantasy + славянские руны, фон `#17191e`.

---

## API Client Pattern (пример)

```typescript
// frontend/src/api/client.ts
const API_BASE = '/api'; // Vite-прокси → http://localhost:8080

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

// Auth
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

// Habits
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

## Frontend Structure (where you CAN edit)

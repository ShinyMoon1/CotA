import { addXp, loadProgress, saveProgress } from './store';
import type { Habit } from '../api/client';

export interface TodayQuest {
  id: string;
  date: string;
  title: string;
  xpReward: number;
  done: boolean;
  /** Подсказка прогресса, например «2/3». */
  hint?: string;
}

/** Сегодняшние свершения с привязкой к характеристикам. */
interface QuestCheckCtx {
  deeds: { habitId: number; at: string; stat: string }[];
}

interface QuestTemplate {
  key: string;
  title: string;
  xpReward: number;
  check: (ctx: QuestCheckCtx) => boolean;
  progress?: (ctx: QuestCheckCtx) => string | null;
}

const countAll = (ctx: QuestCheckCtx) => ctx.deeds.length;
const countStat = (ctx: QuestCheckCtx, stat: string) =>
  ctx.deeds.filter((d) => d.stat === stat).length;

const QUEST_POOL: QuestTemplate[] = [
  {
    key: 'first-deed',
    title: 'Первая кровь: заверши 1 привычку',
    xpReward: 20,
    check: (ctx) => countAll(ctx) >= 1,
    progress: (ctx) => `${Math.min(countAll(ctx), 1)}/1`,
  },
  {
    key: 'triple',
    title: 'Три подвига за день',
    xpReward: 50,
    check: (ctx) => countAll(ctx) >= 3,
    progress: (ctx) => `${Math.min(countAll(ctx), 3)}/3`,
  },
  {
    key: 'five',
    title: 'Неудержимый: 5 подвигов',
    xpReward: 80,
    check: (ctx) => countAll(ctx) >= 5,
    progress: (ctx) => `${Math.min(countAll(ctx), 5)}/5`,
  },
  {
    key: 'strength',
    title: 'Прокачай силу',
    xpReward: 30,
    check: (ctx) => countStat(ctx, 'strength') >= 1,
    progress: (ctx) => `${Math.min(countStat(ctx, 'strength'), 1)}/1`,
  },
  {
    key: 'agility',
    title: 'Прокачай ловкость',
    xpReward: 30,
    check: (ctx) => countStat(ctx, 'agility') >= 1,
    progress: (ctx) => `${Math.min(countStat(ctx, 'agility'), 1)}/1`,
  },
  {
    key: 'intellect',
    title: 'Прокачай разум',
    xpReward: 30,
    check: (ctx) => countStat(ctx, 'intellect') >= 1,
    progress: (ctx) => `${Math.min(countStat(ctx, 'intellect'), 1)}/1`,
  },
  {
    key: 'vitality',
    title: 'Прокачай живучесть',
    xpReward: 30,
    check: (ctx) => countStat(ctx, 'vitality') >= 1,
    progress: (ctx) => `${Math.min(countStat(ctx, 'vitality'), 1)}/1`,
  },
  {
    key: 'occult',
    title: 'Коснись неизведанного',
    xpReward: 40,
    check: (ctx) => countStat(ctx, 'occultism') >= 1,
    progress: (ctx) => `${Math.min(countStat(ctx, 'occultism'), 1)}/1`,
  },
  {
    key: 'early',
    title: 'Ранняя пташка: подвиг до полудня',
    xpReward: 40,
    check: (ctx) => ctx.deeds.some((d) => new Date(d.at).getHours() < 12),
  },
];

function todayKey(d: Date = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDaily(uid: number, date: string): QuestTemplate[] {
  const rand = mulberry32(hashSeed(`${uid}:${date}`));
  const pool = [...QUEST_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

function buildCtx(uid: number, habits: Habit[], date: string): QuestCheckCtx {
  const p = loadProgress(uid);
  const byId = new Map(habits.map((h) => [h.id, h]));
  const deeds: QuestCheckCtx['deeds'] = [];
  for (const [habitIdStr, dates] of Object.entries(p.completions)) {
    const habit = byId.get(Number(habitIdStr));
    if (!habit) continue;
    for (const at of dates) {
      if (at.slice(0, 10) === date) deeds.push({ habitId: Number(habitIdStr), at, stat: habit.stat_type });
    }
  }
  return { deeds };
}

function toView(
  templates: QuestTemplate[],
  date: string,
  doneById: Map<string, boolean>,
  ctx: QuestCheckCtx,
): TodayQuest[] {
  return templates.map((t, i) => {
    const id = `${date}:${i}`;
    return {
      id,
      date,
      title: t.title,
      xpReward: t.xpReward,
      done: doneById.get(id) ?? false,
      hint: t.progress?.(ctx) ?? undefined,
    };
  });
}

/** Только чтение: шаблоны дня + сохранённые флаги. Без начисления наград. */
export function getTodayQuests(uid: number): TodayQuest[] {
  const date = todayKey();
  const templates = pickDaily(uid, date);
  const p = loadProgress(uid);
  const doneById = new Map(
    p.dailyQuests.filter((q) => q.date === date).map((q) => [q.id, q.done] as const),
  );
  return toView(templates, date, doneById, { deeds: [] });
}

/**
 * Проверка квестов по реальным действиям: сверяет условия, отмечает
 * выполненные и один раз начисляет награду. Вызывать после каждого
 * выполнения привычки и при открытии насчитывающей панели.
 */
export function evaluateDailyQuests(
  uid: number,
  habits: Habit[],
): { quests: TodayQuest[]; newlyDone: TodayQuest[] } {
  const date = todayKey();
  const templates = pickDaily(uid, date);

  const p = loadProgress(uid);
  let stored = p.dailyQuests.filter((q) => q.date === date);
  if (stored.length === 0) {
    const fresh = templates.map((_, i) => ({ id: `${date}:${i}`, date, done: false, claimed: false }));
    p.dailyQuests = [...p.dailyQuests, ...fresh];
    saveProgress(uid, p);
    stored = p.dailyQuests.filter((q) => q.date === date);
  }

  const ctx = buildCtx(uid, habits, date);
  const doneById = new Map<string, boolean>();
  const newlyKeys = new Set<string>();

  for (let i = 0; i < templates.length; i++) {
    const id = `${date}:${i}`;
    const rec = stored.find((q) => q.id === id);
    const done = (rec?.done ?? false) || templates[i].check(ctx);
    doneById.set(id, done);
    if (done && !rec?.done) {
      newlyKeys.add(id);
      if (rec) rec.done = true;
    }
  }
  saveProgress(uid, p);

  // Награды — свежими чтениями, чтобы не затереть чужой save.
  for (let i = 0; i < templates.length; i++) {
    const id = `${date}:${i}`;
    if (!doneById.get(id)) continue;
    const fresh = loadProgress(uid);
    const rec = fresh.dailyQuests.find((q) => q.id === id);
    if (rec && !rec.claimed) {
      rec.claimed = true;
      saveProgress(uid, fresh);
      addXp(uid, templates[i].xpReward);
    }
  }

  const quests = toView(templates, date, doneById, ctx);
  return { quests, newlyDone: quests.filter((q) => newlyKeys.has(q.id)) };
}

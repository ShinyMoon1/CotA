import type { Habit, StatType } from '../api/client';

export interface DailyQuest {
  id: string;
  date: string;
  done: boolean;
  /** Награда уже выдана (защита от повторного начисления). */
  claimed: boolean;
}

export interface Progress {
  xp: number;
  level: number;
  stats: Record<StatType, number>;
  /** Максимум характеристики: прокачка выше упирается в предел. */
  statCaps: Record<StatType, number>;
  completions: Record<number, string[]>;
  achievements: string[];
  dailyQuests: DailyQuest[];
  /** Прошёл ли игрок онбординг (установку лимитов после регистрации). */
  onboarded: boolean;
  /** Локальный архив: id привычек, скрытых из списка (бэкенд DELETE не умеет). */
  hiddenHabits: number[];
}

export const DEFAULT_STAT_CAPS: Record<StatType, number> = {
  strength: 100,
  agility: 100,
  intellect: 100,
  vitality: 100,
  occultism: 100,
};

function storeKey(uid: number): string {
  return `dayliki_progress_${uid}`;
}

export function calcLevel(xp: number): number {
  return Math.floor(xp / 300) + 1;
}

function defaultProgress(): Progress {
  return {
    xp: 0,
    level: 1,
    stats: {
      strength: 1,
      agility: 1,
      intellect: 1,
      vitality: 1,
      occultism: 0,
    },
    completions: {},
    achievements: [],
    dailyQuests: [],
    statCaps: { ...DEFAULT_STAT_CAPS },
    onboarded: false,
    hiddenHabits: [],
  };
}

export function loadProgress(uid: number): Progress {
  const def = defaultProgress();
  try {
    const raw = localStorage.getItem(storeKey(uid));
    if (!raw) return def;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : def.xp,
      level: typeof parsed.level === 'number' && parsed.level >= 1 ? parsed.level : def.level,
      stats: { ...def.stats, ...(parsed.stats ?? {}) },
      statCaps: { ...def.statCaps, ...(parsed.statCaps ?? {}) },
      completions: parsed.completions ?? {},
      achievements: parsed.achievements ?? [],
      dailyQuests: (parsed.dailyQuests ?? []).map((q) => ({ ...q, claimed: !!q.claimed })),
      onboarded: parsed.onboarded ?? false,
      hiddenHabits: parsed.hiddenHabits ?? [],
    };
  } catch {
    return def;
  }
}

export function saveProgress(uid: number, p: Progress): void {
  localStorage.setItem(storeKey(uid), JSON.stringify(p));
}

export function addXp(uid: number, amount: number): { leveledUp: boolean; newLevel: number } {
  const p = loadProgress(uid);
  const oldLevel = p.level;
  p.xp += amount;
  p.level = calcLevel(p.xp);
  saveProgress(uid, p);
  return { leveledUp: p.level > oldLevel, newLevel: p.level };
}

export function completeHabit(uid: number, habit: Habit, date: string = new Date().toISOString()): void {
  const p = loadProgress(uid);
  const list = p.completions[habit.id] ?? [];
  list.push(date);
  p.completions[habit.id] = list;
  p.xp += habit.base_exp;
  const stat = habit.stat_type as StatType;
  p.stats[stat] = Math.min(p.statCaps[stat] ?? Infinity, p.stats[stat] + habit.stat_gain);
  p.level = calcLevel(p.xp);
  saveProgress(uid, p);
}

/** Полный сброс прогресса (Danger Zone в профиле). */
export function resetProgress(uid: number): void {
  localStorage.removeItem(storeKey(uid));
}

/** Убрать привычку из списка (локальный архив, история сохраняется). */
export function hideHabit(uid: number, habitId: number): void {
  const p = loadProgress(uid);
  if (!p.hiddenHabits.includes(habitId)) {
    p.hiddenHabits.push(habitId);
    saveProgress(uid, p);
  }
}

/** Вернуть привычку из архива в список. */
export function unhideHabit(uid: number, habitId: number): void {
  const p = loadProgress(uid);
  p.hiddenHabits = p.hiddenHabits.filter((id) => id !== habitId);
  saveProgress(uid, p);
}

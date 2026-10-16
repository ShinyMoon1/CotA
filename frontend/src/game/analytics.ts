import { getHabits, type Habit, type StatType } from '../api/client';
import { loadProgress } from './store';

const STAT_ORDER: StatType[] = ['strength', 'agility', 'intellect', 'vitality', 'occultism'];

async function loadAllHabits(uid: number): Promise<Habit[]> {
  const all: Habit[] = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const page = await getHabits(uid, limit, offset);
    all.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return all;
}

function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export async function getStatDistribution(uid: number): Promise<{ stat: StatType; count: number }[]> {
  const habits = await loadAllHabits(uid);
  const p = loadProgress(uid);
  const counts: Record<StatType, number> = {
    strength: 0,
    agility: 0,
    intellect: 0,
    vitality: 0,
    occultism: 0,
  };
  for (const h of habits) {
    const n = p.completions[h.id]?.length ?? 0;
    counts[h.stat_type] += n;
  }
  return STAT_ORDER.map((stat) => ({ stat, count: counts[stat] }));
}

export async function getCompletionHistory(
  uid: number,
  days = 30,
): Promise<{ date: string; completed: number; xp: number }[]> {
  const habits = await loadAllHabits(uid);
  const p = loadProgress(uid);
  const byId = new Map<number, Habit>(habits.map((h) => [h.id, h]));

  const perDay = new Map<string, { completed: number; xp: number }>();
  for (const [habitIdStr, dates] of Object.entries(p.completions)) {
    const habit = byId.get(Number(habitIdStr));
    if (!habit) continue;
    for (const iso of dates) {
      const key = iso.slice(0, 10);
      const entry = perDay.get(key) ?? { completed: 0, xp: 0 };
      entry.completed += 1;
      entry.xp += habit.base_exp;
      perDay.set(key, entry);
    }
  }

  const out: { date: string; completed: number; xp: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = dayKey(d);
    const entry = perDay.get(key) ?? { completed: 0, xp: 0 };
    out.push({ date: key, ...entry });
  }
  return out;
}

export function getTotalStats(uid: number): Record<StatType, number> {
  return loadProgress(uid).stats;
}

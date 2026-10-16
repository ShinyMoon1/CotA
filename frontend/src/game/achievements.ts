import { loadProgress, saveProgress, type Progress } from './store';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  relic?: string;
  classGranted?: string;
  check: (p: Progress) => boolean;
}

function totalCompletions(p: Progress): number {
  return Object.values(p.completions).reduce((sum, days) => sum + days.length, 0);
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-spark',
    title: 'Первая Искра',
    description: 'Зажечь кузницу: завершить первую привычку.',
    check: (p) => totalCompletions(p) >= 1,
  },
  {
    id: 'mudrets',
    title: 'Мудрец',
    description: 'Постичь руны разума: интеллект 10.',
    classGranted: 'Мудрец',
    check: (p) => p.stats.intellect >= 10,
  },
  {
    id: 'titan',
    title: 'Титан',
    description: 'Сокрушить наковальню: сила 15.',
    classGranted: 'Титан',
    check: (p) => p.stats.strength >= 15,
  },
  {
    id: 'skory',
    title: 'Скорый',
    description: 'Обогнать ветер степей: ловкость 10.',
    classGranted: 'Вихрь',
    check: (p) => p.stats.agility >= 10,
  },
  {
    id: 'strazh-korney',
    title: 'Страж Корней',
    description: 'Укорениться в земле предков: выносливость 10.',
    classGranted: 'Страж',
    check: (p) => p.stats.vitality >= 10,
  },
  {
    id: 'voevoda',
    title: 'Воевода',
    description: 'Возглавить дружину привычек: достичь 5 уровня.',
    classGranted: 'Воевода',
    check: (p) => p.level >= 5,
  },
  {
    id: 'ratnaya-nedelya',
    title: 'Ратная Неделя',
    description: 'Семь свершений в гримуаре привычек.',
    check: (p) => totalCompletions(p) >= 7,
  },
  {
    id: 'kuznya-mesyatsa',
    title: 'Кузня Месяца',
    description: 'Тридцать свершений: месяц у горна.',
    check: (p) => totalCompletions(p) >= 30,
  },
  {
    id: 'runa-peruna',
    title: 'Реликвия: Руна Перуна',
    description: 'Громовержец благоволит упорным: 50 свершений.',
    relic: 'Руна Перуна',
    check: (p) => totalCompletions(p) >= 50,
  },
  {
    id: 'pechat-velesa',
    title: 'Реликвия: Печать Велеса',
    description: 'Тайные тропы открыты: оккультизм 5.',
    relic: 'Печать Велеса',
    check: (p) => p.stats.occultism >= 5,
  },
];

const BY_ID: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function checkAchievements(uid: number): string[] {
  const p = loadProgress(uid);
  const fresh: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!p.achievements.includes(a.id) && a.check(p)) {
      p.achievements.push(a.id);
      fresh.push(a.id);
    }
  }
  if (fresh.length > 0) saveProgress(uid, p);
  return fresh;
}

export function getUnlockedRelics(uid: number): string[] {
  const p = loadProgress(uid);
  return p.achievements
    .map((id) => BY_ID[id]?.relic)
    .filter((r): r is string => typeof r === 'string');
}

export function getActiveClass(uid: number): string | null {
  const p = loadProgress(uid);
  let active: string | null = null;
  for (const id of p.achievements) {
    const cls = BY_ID[id]?.classGranted;
    if (cls) active = cls;
  }
  return active;
}

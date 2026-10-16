import type { StatType } from '../api/client';

export const STAT_ORDER: StatType[] = ['strength', 'agility', 'intellect', 'vitality', 'occultism'];

export const STAT_LABELS: Record<StatType, string> = {
  strength: 'Сила',
  agility: 'Ловкость',
  intellect: 'Интеллект',
  vitality: 'Живучесть',
  occultism: 'Оккультизм',
};

export const STAT_COLORS: Record<StatType, string> = {
  strength: '#c0392b',
  agility: '#4f9d5d',
  intellect: '#7c5cd6',
  vitality: '#e8c547',
  occultism: '#5fb3b3',
};

export const STAT_RUNES: Record<StatType, string> = {
  strength: 'ᛏ',
  agility: 'ᚱ',
  intellect: 'ᚨ',
  vitality: 'ᛒ',
  occultism: 'ᛉ',
};

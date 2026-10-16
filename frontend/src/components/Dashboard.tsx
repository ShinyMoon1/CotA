import { useEffect, useState, type CSSProperties } from 'react';
import { getHabits, getUser } from '../api/client';
import { loadProgress } from '../game/store';
import { getTotalStats } from '../game/analytics';
import { evaluateDailyQuests, getTodayQuests, type TodayQuest } from '../game/daily';
import { checkAchievements, getActiveClass } from '../game/achievements';
import { STAT_COLORS, STAT_LABELS, STAT_ORDER, STAT_RUNES } from './statMeta';
import type { StatType } from '../api/client';

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

export default function Dashboard({ uid }: { uid: number }) {
  const [nickname, setNickname] = useState('Странник');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [heroClass, setHeroClass] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<StatType, number>>(() => getTotalStats(uid));
  const [caps, setCaps] = useState<Record<StatType, number>>(() => loadProgress(uid).statCaps);
  const [quests, setQuests] = useState<TodayQuest[]>(() => getTodayQuests(uid));

  useEffect(() => {
    let cancelled = false;
    getUser(uid)
      .then((u) => {
        if (!cancelled) setNickname(u.nick_name);
      })
      .catch(() => {});
    const p = loadProgress(uid);
    setXp(p.xp);
    setLevel(p.level);
    setHeroClass(getActiveClass(uid));
    setStats(getTotalStats(uid));
    setCaps(p.statCaps);
    setQuests(getTodayQuests(uid));
    // Авто-проверка квестов по реальным действиям + тихое досчитывание ачивок.
    getHabits(uid, 100, 0)
      .then((list) => {
        if (cancelled) return;
        const { quests } = evaluateDailyQuests(uid, list);
        checkAchievements(uid);
        if (cancelled) return;
        const p2 = loadProgress(uid);
        setXp(p2.xp);
        setLevel(p2.level);
        setHeroClass(getActiveClass(uid));
        setStats(getTotalStats(uid));
        setCaps(p2.statCaps);
        setQuests(quests);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const xpInto = xp % 300;
  const ringOff = RING_C * (1 - xpInto / 300);

  const barPct = (s: StatType) => {
    const cap = Math.max(1, caps[s] ?? 1);
    return Math.min(100, (stats[s] / cap) * 100);
  };

  return (
    <div className="page">
      <div className="tablet tablet-gold hero anim" style={{ '--d': '0ms' } as CSSProperties}>
        <div className="level-ring">
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={RING_R} fill="none" stroke="#0c0e13" strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={RING_R}
              fill="none"
              stroke="url(#lvlGold)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={ringOff}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
            />
            <defs>
              <linearGradient id="lvlGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f0d060" />
                <stop offset="100%" stopColor="#8a6d1c" />
              </linearGradient>
            </defs>
          </svg>
          <span className="lvl">{level}</span>
        </div>
        <div>
          <h1 style={{ fontSize: 26 }}>{nickname}</h1>
          <div className="hero-sub">
            {heroClass ? `Класс: ${heroClass}` : 'Без класса — совершай подвиги'} · {xp} XP
          </div>
          <div className="xp-track" style={{ marginTop: 10 }}>
            <div className="xp-fill" style={{ width: `${(xpInto / 300) * 100}%` }} />
          </div>
          <div className="xp-nums">{xpInto} / 300 до уровня {level + 1}</div>
        </div>
      </div>

      <div className="rune-strip anim" style={{ '--d': '60ms' } as CSSProperties}>
        ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ
      </div>

      <div className="tablet anim" style={{ '--d': '120ms' } as CSSProperties}>
        <div className="chart-title">Характеристики героя</div>
        {STAT_ORDER.map((s) => (
          <div className="stat-row" key={s}>
            <div
              className="stat-sigil"
              style={{ border: `1px solid ${STAT_COLORS[s]}`, color: STAT_COLORS[s] }}
            >
              {STAT_RUNES[s]}
            </div>
            <div className="stat-body">
              <div className="stat-top">
                <span className="stat-name">{STAT_LABELS[s]}</span>
                <span className="stat-val">
                  {stats[s]} <small style={{ color: 'var(--muted)', fontSize: 11 }}>/ {caps[s]}</small>
                </span>
              </div>
              <div className="stat-track">
                <div
                  className="stat-fill"
                  style={{
                    width: `${barPct(s)}%`,
                    background: STAT_COLORS[s],
                    color: STAT_COLORS[s],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="anim" style={{ marginTop: 20, '--d': '180ms' } as CSSProperties}>
        Квесты дня
      </h2>
      <div className="tablet anim" style={{ '--d': '220ms', marginTop: 8 } as CSSProperties}>
        <div className="quests-note">Выполняются сами — за реальные подвиги</div>
        {quests.length === 0 && <div className="empty">На сегодня подвигов нет.</div>}
        {quests.map((q) => (
          <div key={q.id} className={q.done ? 'quest-row done' : 'quest-row'}>
            <span className={q.done ? 'rune-check done' : 'rune-check'}>✦</span>
            <span className="txt">
              {q.title}
              {q.hint && !q.done && <small className="quest-hint"> · {q.hint}</small>}
            </span>
            <span className="pill">+{q.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

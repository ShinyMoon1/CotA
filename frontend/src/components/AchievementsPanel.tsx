import { useEffect, useState, type CSSProperties } from 'react';
import { ACHIEVEMENTS, getActiveClass } from '../game/achievements';
import { loadProgress } from '../game/store';

const RUNES = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
  'ᛁ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ',
  'ᛜ', 'ᛞ', 'ᛟ',
];

export default function AchievementsPanel({ uid }: { uid: number }) {
  const [unlocked, setUnlocked] = useState<string[]>(() => loadProgress(uid).achievements);
  const [activeClass, setActiveClass] = useState<string | null>(() => getActiveClass(uid));

  useEffect(() => {
    setUnlocked(loadProgress(uid).achievements);
    setActiveClass(getActiveClass(uid));
  }, [uid]);

  return (
    <div className="page">
      <h1 className="anim" style={{ '--d': '0ms' } as CSSProperties}>
        Реликвии и классы
      </h1>
      <div className="rune-strip anim" style={{ '--d': '40ms' } as CSSProperties}>
        ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ
      </div>

      <div className="tablet tablet-gold class-banner anim" style={{ '--d': '80ms' } as CSSProperties}>
        <div className="class-rune">{activeClass ? 'ᛟ' : 'ᚾ'}</div>
        <div>
          <div className="class-name">{activeClass ?? 'Без класса'}</div>
          <div className="class-hint">
            {activeClass
              ? 'Твой титул в дружине'
              : 'Совершай подвиги — духи даруют титул'}
          </div>
        </div>
      </div>

      <div className="sum-row anim" style={{ '--d': '120ms', marginTop: 14 } as CSSProperties}>
        <span className="pill">
          Открыто {unlocked.length} из {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="relic-grid">
        {ACHIEVEMENTS.map((a, i) => {
          const isOpen = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={isOpen ? 'tablet relic open anim' : 'tablet relic locked anim'}
              style={{ '--d': `${140 + i * 60}ms` } as CSSProperties}
            >
              <div className="glyph">{RUNES[i % RUNES.length]}</div>
              <b>{a.title}</b>
              <small>{a.description}</small>
              {isOpen ? (
                <span className="open-badge">✦ Открыто</span>
              ) : (
                <span className="locked-badge">🔒 Закрыто</span>
              )}
              {a.relic && <span className="kind">✦ Реликвия: {a.relic}</span>}
              {a.classGranted && <span className="kind">✦ Класс: {a.classGranted}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

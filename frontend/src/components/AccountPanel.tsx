import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { getUser } from '../api/client';
import { getActiveClass } from '../game/achievements';
import { loadProgress, resetProgress } from '../game/store';
import AnalyticsPanel from './AnalyticsPanel';
import StatCapsEditor from './StatCapsEditor';

const ANIM_KEY = 'dayliki_anim';

export function isAnimOff(): boolean {
  return localStorage.getItem(ANIM_KEY) === 'off';
}

export function applyAnimPref(): void {
  document.body.classList.toggle('no-anim', isAnimOff());
}

export default function AccountPanel({ uid, onLogout }: { uid: number; onLogout: () => void }) {
  const [nickname, setNickname] = useState('Странник');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [heroClass, setHeroClass] = useState<string | null>(null);
  const [animOff, setAnimOff] = useState(isAnimOff);

  const reload = useCallback(() => {
    const p = loadProgress(uid);
    setLevel(p.level);
    setXp(p.xp);
    setHeroClass(getActiveClass(uid));
  }, [uid]);

  useEffect(() => {
    let cancelled = false;
    getUser(uid)
      .then((u) => {
        if (cancelled) return;
        setNickname(u.nick_name);
        setEmail(u.email);
      })
      .catch(() => {});
    reload();
    return () => {
      cancelled = true;
    };
  }, [uid, reload]);

  const toggleAnim = () => {
    const next = !animOff;
    setAnimOff(next);
    localStorage.setItem(ANIM_KEY, next ? 'off' : 'on');
    applyAnimPref();
  };

  const exportData = () => {
    const p = loadProgress(uid);
    const blob = new Blob([JSON.stringify({ uid, exportedAt: new Date().toISOString(), ...p }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayliki-uid${uid}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipe = () => {
    if (!window.confirm('Сжечь гримуар? Весь прогресс, реликвии и лимиты будут стёрты.')) return;
    resetProgress(uid);
    window.location.reload();
  };

  return (
    <div className="page">
      <h1 className="anim" style={{ '--d': '0ms' } as CSSProperties}>
        Чертог героя
      </h1>
      <div className="rune-strip anim" style={{ '--d': '40ms' } as CSSProperties}>
        ᛟ ᛞ ᛚ ᛜ ᛟ
      </div>

      <div className="tablet tablet-gold profile-card anim" style={{ '--d': '80ms' } as CSSProperties}>
        <div className="avatar-rune">{nickname.charAt(0).toUpperCase() || 'ᛟ'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="profile-name">{nickname}</div>
          <div className="profile-email">{email || '—'}</div>
          <div className="sum-row" style={{ marginTop: 8, marginBottom: 0 }}>
            <span className="pill">Уровень {level}</span>
            <span className="pill">{xp} XP</span>
            {heroClass && <span className="pill">{heroClass}</span>}
          </div>
        </div>
      </div>

      <h2 className="anim" style={{ marginTop: 20, '--d': '120ms' } as CSSProperties}>
        Пределы характеристик
      </h2>
      <div className="tablet anim" style={{ '--d': '140ms', marginTop: 8 } as CSSProperties}>
        <StatCapsEditor uid={uid} compact onSaved={reload} />
      </div>

      <div className="anim" style={{ '--d': '160ms', marginTop: 20 } as CSSProperties}>
        <AnalyticsPanel uid={uid} embedded />
      </div>

      <h2 className="anim" style={{ marginTop: 20, '--d': '180ms' } as CSSProperties}>
        Настройки
      </h2>
      <div className="tablet anim" style={{ '--d': '200ms', marginTop: 8 } as CSSProperties}>
        <button className="settings-row" onClick={toggleAnim} role="switch" aria-checked={!animOff}>
          <span>
            <b>Анимации</b>
            <small>Свечения, парение рун, появление карточек</small>
          </span>
          <span className={animOff ? 'switch' : 'switch on'}>
            <span className="knob" />
          </span>
        </button>
        <button className="settings-row" onClick={exportData}>
          <span>
            <b>Выгрузить гримуар</b>
            <small>Скачать прогресс в JSON</small>
          </span>
          <span className="row-glyph">⤓</span>
        </button>
        <button className="settings-row" onClick={onLogout}>
          <span>
            <b>Покинуть чертог</b>
            <small>Выйти из учётной записи</small>
          </span>
          <span className="row-glyph">⏻</span>
        </button>
        <button className="settings-row danger" onClick={wipe}>
          <span>
            <b>Сжечь гримуар</b>
            <small>Стереть весь прогресс без возврата</small>
          </span>
          <span className="row-glyph">🔥</span>
        </button>
      </div>
      <p className="anim" style={{ '--d': '220ms', marginTop: 12, textAlign: 'center', color: 'var(--muted)', fontSize: 12 } as CSSProperties}>
        Dayliki · кузница привычек · v0.1
      </p>
    </div>
  );
}

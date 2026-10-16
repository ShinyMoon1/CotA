import { useState, type CSSProperties } from 'react';
import { loadProgress, saveProgress, type Progress } from '../game/store';
import { STAT_COLORS, STAT_LABELS, STAT_ORDER, STAT_RUNES } from './statMeta';
import type { StatType } from '../api/client';

function clampCap(v: number): number {
  if (!Number.isFinite(v)) return 100;
  return Math.min(999, Math.max(1, Math.floor(v)));
}

/** Редактор пределов характеристик. Используется в онбординге и в профиле. */
export default function StatCapsEditor({
  uid,
  onSaved,
  compact = false,
}: {
  uid: number;
  onSaved?: () => void;
  compact?: boolean;
}) {
  const [caps, setCaps] = useState<Record<StatType, number>>(() => loadProgress(uid).statCaps);
  const [stats] = useState<Record<StatType, number>>(() => loadProgress(uid).stats);

  const save = () => {
    const p: Progress = loadProgress(uid);
    for (const s of STAT_ORDER) {
      p.statCaps[s] = clampCap(caps[s]);
      p.stats[s] = Math.min(p.stats[s], p.statCaps[s]);
    }
    p.onboarded = true;
    saveProgress(uid, p);
    setCaps({ ...p.statCaps });
    onSaved?.();
  };

  return (
    <div>
      {!compact && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
          Характеристики не смогут вырасти выше предела. Позже его можно изменить в профиле.
        </p>
      )}
      <div className="caps-grid">
        {STAT_ORDER.map((s, i) => (
          <div
            className="cap-row anim"
            key={s}
            style={{ '--d': `${i * 60}ms` } as CSSProperties}
          >
            <span
              className="stat-sigil"
              style={{ border: `1px solid ${STAT_COLORS[s]}`, color: STAT_COLORS[s] }}
            >
              {STAT_RUNES[s]}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>
                {STAT_LABELS[s]} <span style={{ color: 'var(--muted)' }}>· сейчас {stats[s]}</span>
              </div>
              <input
                className="num-input"
                type="number"
                min={1}
                max={999}
                value={caps[s]}
                onChange={(e) => setCaps({ ...caps, [s]: Number(e.target.value) })}
                aria-label={`Предел: ${STAT_LABELS[s]}`}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="btn-rune" style={{ marginTop: 12 }} onClick={save}>
        Высечь пределы
      </button>
    </div>
  );
}

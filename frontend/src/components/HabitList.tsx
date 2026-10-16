import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { Button, Input, Modal, Select } from '@telegram-apps/telegram-ui';
import { createHabit, getHabits, type Habit, type StatType } from '../api/client';
import { completeHabit, hideHabit, loadProgress, unhideHabit, type Progress } from '../game/store';
import { ACHIEVEMENTS, checkAchievements } from '../game/achievements';
import { evaluateDailyQuests } from '../game/daily';
import { STAT_COLORS, STAT_LABELS, STAT_RUNES } from './statMeta';

const STAT_TYPES: StatType[] = ['strength', 'agility', 'intellect', 'vitality', 'occultism'];

function showAlert(message: string): void {
  const show = window.Telegram?.WebApp?.showAlert;
  if (show) show(message);
  else window.alert(message);
}

export default function HabitList({ uid }: { uid: number }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<Progress>(() => loadProgress(uid));
  const [hidden, setHidden] = useState<number[]>(() => loadProgress(uid).hiddenHabits);
  const [showArchive, setShowArchive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseExp, setBaseExp] = useState('10');
  const [statType, setStatType] = useState<StatType>('strength');
  const [statGain, setStatGain] = useState('1');

  const refresh = useCallback(async (): Promise<Habit[]> => {
    const list = await getHabits(uid, 100, 0);
    setHabits(list);
    const p = loadProgress(uid);
    setProgress(p);
    setHidden(p.hiddenHabits);
    return list;
  }, [uid]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const doComplete = useCallback(
    async (habit: Habit) => {
      completeHabit(uid, habit);
      const list = await refresh();
      // Квесты выполняются сами: сверяем условия и начисляем награды.
      const { newlyDone } = evaluateDailyQuests(uid, list);
      const fresh = checkAchievements(uid);
      const lines = [
        ...newlyDone.map((q) => `Квест выполнен: ${q.title} (+${q.xpReward} XP)`),
        ...fresh.map((id) => `Ачивка: ${ACHIEVEMENTS.find((a) => a.id === id)?.title ?? id}`),
      ];
      if (lines.length > 0) showAlert(lines.join('\n'));
      await refresh();
    },
    [uid, refresh],
  );

  const doDelete = useCallback(
    (habit: Habit) => {
      if (!window.confirm(`Убрать «${habit.title}» из гримуара? История выполнений сохранится.`)) return;
      hideHabit(uid, habit.id);
      refresh().catch(() => {});
    },
    [uid, refresh],
  );

  const doRestore = useCallback(
    (habitId: number) => {
      unhideHabit(uid, habitId);
      refresh().catch(() => {});
    },
    [uid, refresh],
  );

  const submit = useCallback(async () => {
    await createHabit({
      user_id: uid,
      title,
      description,
      base_exp: Number(baseExp),
      stat_type: statType,
      stat_gain: Number(statGain),
    });
    setModalOpen(false);
    setTitle('');
    setDescription('');
    setBaseExp('10');
    setStatType('strength');
    setStatGain('1');
    await refresh();
  }, [uid, title, description, baseExp, statType, statGain, refresh]);

  const visibleHabits = habits.filter((h) => !hidden.includes(h.id));
  const archivedHabits = habits.filter((h) => hidden.includes(h.id));

  return (
    <div className="page" key={progress.xp}>
      <h1 className="anim" style={{ '--d': '0ms' } as CSSProperties}>
        Гримуар подвигов
      </h1>
      <div className="rune-strip anim" style={{ '--d': '40ms' } as CSSProperties}>
        ᚷ ᚹ ᚺ ᚾ ᛁ
      </div>

      <button
        className="btn-rune anim"
        style={{ '--d': '80ms' } as CSSProperties}
        onClick={() => setModalOpen(true)}
      >
        ＋ Новая привычка
      </button>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleHabits.map((h, i) => (
          <div
            key={h.id}
            className="tablet anim"
            style={{ '--d': `${120 + i * 70}ms` } as CSSProperties}
          >
            <div className="habit-row">
              <div
                className="stat-sigil"
                style={{ border: `1px solid ${STAT_COLORS[h.stat_type as StatType]}`, color: STAT_COLORS[h.stat_type as StatType] }}
              >
                {STAT_RUNES[h.stat_type as StatType] ?? 'ᚦ'}
              </div>
              <div className="habit-body">
                <div className="habit-title">{h.title}</div>
                {h.description && <div className="habit-desc">{h.description}</div>}
                <div className="habit-tags">
                  <span className="stat-tag" style={{ color: STAT_COLORS[h.stat_type as StatType] }}>
                    {STAT_LABELS[h.stat_type as StatType] ?? h.stat_type}
                  </span>
                  <span className="pill">+{h.base_exp} XP</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn-rune small"
                style={{ flex: 1 }}
                onClick={() => doComplete(h)}
              >
                Свершить
              </button>
              <button
                className="btn-rune small danger"
                onClick={() => doDelete(h)}
                aria-label={`Убрать ${h.title}`}
                title="Убрать из гримуара"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {visibleHabits.length === 0 && (
          <div className="tablet empty anim" style={{ '--d': '120ms' } as CSSProperties}>
            <div className="big-rune">ᚦ</div>
            <p style={{ marginTop: 8 }}>Гримуар пуст — впиши первый подвиг.</p>
          </div>
        )}
        {archivedHabits.length > 0 && (
          <div className="tablet anim" style={{ '--d': '160ms' } as CSSProperties}>
            <button className="settings-row" onClick={() => setShowArchive((v) => !v)}>
              <span>
                <b>Архив ({archivedHabits.length})</b>
                <small>Убранные привычки · история сохранена</small>
              </span>
              <span className="row-glyph">{showArchive ? '▾' : '▸'}</span>
            </button>
            {showArchive &&
              archivedHabits.map((h) => (
                <div key={h.id} className="archived-row">
                  <span>{h.title}</span>
                  <button className="btn-rune small ghost" onClick={() => doRestore(h.id)}>
                    Вернуть
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} header="Новый подвиг">
        <div className="sheet-form">
          <Input header="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            header="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            header="Опыт (base_exp)"
            type="number"
            value={baseExp}
            onChange={(e) => setBaseExp(e.target.value)}
          />
          <Select
            header="Характеристика"
            value={statType}
            onChange={(e) => setStatType(e.target.value as StatType)}
          >
            {STAT_TYPES.map((s) => (
              <option key={s} value={s}>
                {STAT_RUNES[s]} {STAT_LABELS[s]}
              </option>
            ))}
          </Select>
          <Input
            header="Прирост (stat_gain)"
            type="number"
            value={statGain}
            onChange={(e) => setStatGain(e.target.value)}
          />
          <Button onClick={submit}>Высечь в камне</Button>
        </div>
      </Modal>
    </div>
  );
}

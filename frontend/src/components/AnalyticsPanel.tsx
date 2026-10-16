import { useEffect, useState, type CSSProperties } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getCompletionHistory, getStatDistribution } from '../game/analytics';
import { STAT_COLORS, STAT_LABELS } from './statMeta';
import type { StatType } from '../api/client';

interface DistEntry {
  stat: string;
  count: number;
}

interface HistoryEntry {
  date: string;
  completed: number;
  xp: number;
}

const tooltipStyle = {
  backgroundColor: '#10131a',
  border: '1px solid #8a6d1c',
  borderRadius: 10,
  color: '#e8e0d0',
  fontSize: 12,
};

export default function AnalyticsPanel({ uid, embedded = false }: { uid: number; embedded?: boolean }) {
  const [dist, setDist] = useState<DistEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    getStatDistribution(uid)
      .then((d) => {
        if (!cancelled) setDist(d);
      })
      .catch(() => {});
    getCompletionHistory(uid, 30)
      .then((h) => {
        if (!cancelled) setHistory(h);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const totalDone = history.reduce((s, h) => s + h.completed, 0);
  const totalXp = history.reduce((s, h) => s + h.xp, 0);
  const hasDist = dist.some((d) => d.count > 0);

  return (
    <div className={embedded ? undefined : 'page'}>
      {!embedded && (
        <>
          <h1 className="anim" style={{ '--d': '0ms' } as CSSProperties}>
            Веды свершений
          </h1>
          <div className="rune-strip anim" style={{ '--d': '40ms' } as CSSProperties}>
            ᛊ ᛏ ᛒ ᛖ ᛗ
          </div>
        </>
      )}
      <div className="sum-row anim" style={{ '--d': '80ms' } as CSSProperties}>
        <span className="pill">30 дней: {totalDone} подвигов</span>
        <span className="pill">{totalXp} XP</span>
      </div>

      <div className="tablet chart-card anim" style={{ '--d': '120ms' } as CSSProperties}>
        <div className="chart-title">Круг характеристик</div>
        {hasDist ? (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="count"
                  nameKey="stat"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="#10131a"
                  strokeWidth={2}
                  animationDuration={900}
                >
                  {dist.map((d) => (
                    <Cell
                      key={d.stat}
                      fill={STAT_COLORS[d.stat as StatType] ?? '#c9a227'}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              {dist.map((d) => (
                <span key={d.stat}>
                  <i
                    style={{
                      background: STAT_COLORS[d.stat as StatType] ?? '#c9a227',
                      color: STAT_COLORS[d.stat as StatType] ?? '#c9a227',
                    }}
                  />
                  {STAT_LABELS[d.stat as StatType] ?? d.stat}: {d.count}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">Выполняй привычки — круг начертит себя сам.</div>
        )}
      </div>

      <div className="tablet chart-card anim" style={{ '--d': '180ms' } as CSSProperties}>
        <div className="chart-title">Летопись дней</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={history} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#9a917f', fontSize: 9 }}
              tickFormatter={(v: string) => v.slice(5)}
              interval={6}
              axisLine={{ stroke: '#2a2f3b' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9a917f', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(201,162,39,0.08)' }} />
            <Bar
              dataKey="completed"
              fill="#c9a227"
              radius={[6, 6, 2, 2]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

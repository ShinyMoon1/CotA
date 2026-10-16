import { useEffect, useState } from 'react';
import { AppRoot, Input } from '@telegram-apps/telegram-ui';
import './styles/global.css';
import { authTelegram, login, register } from './api/client';
import { loadProgress } from './game/store';
import Dashboard from './components/Dashboard';
import HabitList from './components/HabitList';
import AchievementsPanel from './components/AchievementsPanel';
import AccountPanel, { applyAnimPref } from './components/AccountPanel';
import StatCapsEditor from './components/StatCapsEditor';

function userIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    return typeof payload.sub === 'number' && payload.sub > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

type Tab = 'dashboard' | 'habits' | 'achievements' | 'account';

const TABS: { id: Tab; label: string; glyph: string }[] = [
  { id: 'dashboard', label: 'Герой', glyph: 'ᚺ' },
  { id: 'habits', label: 'Подвиги', glyph: 'ᚦ' },
  { id: 'achievements', label: 'Реликвии', glyph: 'ᚱ' },
  { id: 'account', label: 'Чертог', glyph: 'ᛟ' },
];

export default function App() {
  const [uid, setUid] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('dashboard');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [needCaps, setNeedCaps] = useState(false);

  const enterAs = (id: number) => {
    setUid(id);
    if (!loadProgress(id).onboarded) setNeedCaps(true);
  };

  useEffect(() => {
    applyAnimPref();
    // Сообщаем Telegram, что Mini App загрузился, и разворачиваем на всю высоту.
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const id = userIdFromToken(token);
        if (id) {
          enterAs(id);
          setChecking(false);
          return;
        }
        localStorage.removeItem('token');
      }
      const initData = window.Telegram?.WebApp?.initData;
      if (initData) {
        try {
          const { token: tgToken } = await authTelegram(initData);
          localStorage.setItem('token', tgToken);
          const id = userIdFromToken(tgToken);
          if (id) enterAs(id);
        } catch {
          /* остаёмся на экране логина */
        }
      }
      setChecking(false);
    })();
  }, []);

  const submitAuth = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({ nick_name: nickname, email, password });
      }
      const { token } = await login({ email, password });
      localStorage.setItem('token', token);
      const id = userIdFromToken(token);
      if (!id) throw new Error('bad token');
      enterAs(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'auth failed');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUid(null);
    setTab('dashboard');
  };

  if (checking) {
    return (
      <AppRoot appearance="dark">
        <div className="loading-veil">
          <div className="big-rune">ᛟ</div>
        </div>
      </AppRoot>
    );
  }

  if (uid === null) {
    return (
      <AppRoot appearance="dark">
        <div className="login-wrap anim">
          <div className="login-sigil">ᛟ</div>
          <h1 className="login-title">Dayliki</h1>
          <p className="login-sub">КУЗНИЦА ПРИВЫЧЕК</p>
          <div className="tablet">
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>
              {mode === 'login' ? 'Вход в чертог' : 'Посвящение'}
            </h2>
            {mode === 'register' && (
              <Input
                header="Никнейм героя"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            )}
            <Input header="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              header="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="auth-error">{error}</p>}
            <div className="auth-row">
              <button className="btn-rune" onClick={submitAuth} disabled={busy}>
                {mode === 'login' ? 'Войти' : 'Клянусь'}
              </button>
            </div>
            <div className="auth-row">
              <button
                className="btn-rune ghost"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Я новенький' : 'Уже посвящён'}
              </button>
            </div>
          </div>
        </div>
      </AppRoot>
    );
  }

  if (needCaps && uid !== null) {
    return (
      <AppRoot appearance="dark">
        <div className="login-wrap anim">
          <div className="login-sigil">ᚨ</div>
          <h1 className="login-title">Закалка</h1>
          <p className="login-sub">ПРЕДЕЛЫ ХАРАКТЕРИСТИК</p>
          <div className="tablet">
            <StatCapsEditor uid={uid} onSaved={() => setNeedCaps(false)} />
          </div>
        </div>
      </AppRoot>
    );
  }

  return (
    <AppRoot appearance="dark">
      <div style={{ paddingBottom: 84 }}>
        {tab === 'dashboard' && <Dashboard uid={uid} />}
        {tab === 'habits' && <HabitList uid={uid} />}
        {tab === 'achievements' && <AchievementsPanel uid={uid} />}
        {tab === 'account' && <AccountPanel uid={uid} onLogout={logout} />}

        <nav className="tabbar" aria-label="Основная">
          <div className="tabbar-inner">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'tab active' : 'tab'}
                onClick={() => setTab(t.id)}
              >
                <span className="glyph">{t.glyph}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </AppRoot>
  );
}

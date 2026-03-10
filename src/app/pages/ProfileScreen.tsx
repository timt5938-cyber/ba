import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft, User, Settings, RefreshCw, Download, Link2, Smartphone,
  Trash2, Bell, ChevronRight, Eye, EyeOff, Check, AlertTriangle, LogOut,
  X, Plus, Shield, FileText, Monitor, Star, Zap, CheckCircle2,
  Clock, Calendar, AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLAYER, SYNC_HISTORY, DEVICES, ACHIEVEMENTS, formatTime } from '../data/mockData';
import { Badge, StatusDot } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

type Section =
  | 'cabinet'
  | 'settings'
  | 'sync-history'
  | 'export'
  | 'linked'
  | 'devices'
  | 'notifications'
  | 'delete';

const SUB_SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc?: string }[] = [
  { id: 'cabinet',      label: 'Личный кабинет',         icon: <User size={16} />,       desc: 'Профиль, статистика, достижения' },
  { id: 'settings',     label: 'Настройки',               icon: <Settings size={16} />,   desc: 'Тема, безопасность, синхронизация' },
  { id: 'linked',       label: 'Steam аккаунты',          icon: <Link2 size={16} />,      desc: 'Управление подключёнными аккаунтами' },
  { id: 'export',       label: 'Экспорт данных',          icon: <Download size={16} />,   desc: 'PDF, CSV — матчи, аналитика, сборки' },
  { id: 'devices',      label: 'Устройства',              icon: <Smartphone size={16} />, desc: 'Активные сессии и устройства' },
  { id: 'sync-history', label: 'История синхронизаций',   icon: <RefreshCw size={16} />,  desc: 'Лог синхронизаций с OpenDota' },
  { id: 'notifications',label: 'Уведомления',             icon: <Bell size={16} />,       desc: 'Push-настройки' },
  { id: 'delete',       label: 'Удаление аккаунта',       icon: <Trash2 size={16} />,     desc: 'Безвозвратное удаление' },
];

function SectionHeader({ label, onBack, action }: { label: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
      style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}>
      <button type="button" onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ArrowLeft size={18} color="rgba(255,255,255,0.8)" />
      </button>
      <p className="text-white flex-1" style={{ fontSize: 15, fontWeight: 700 }}>{label}</p>
      {action}
    </div>
  );
}

// ─── Cabinet ─────────────────────────────────────────────────────────────────
function CabinetSection({ onBack }: { onBack: () => void }) {
  const { accentColor, showToast, logout, syncNow } = useApp();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNow();
      showToast(result.message || 'Статистика обновлена!', result.status === 'success' ? 'success' : 'warning');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <SectionHeader label="Личный кабинет" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {/* Profile card */}
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}45)`, border: `2px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 28 }}>🧙</span>
            </div>
            <div>
              <p className="text-white" style={{ fontSize: 18, fontWeight: 700 }}>{PLAYER.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/{PLAYER.steamId}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="gold">⚡ {PLAYER.rank}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Матчей', value: PLAYER.totalMatches.toLocaleString() },
              { label: 'Винрейт', value: `${PLAYER.winrate}%` },
              { label: 'Avg KDA', value: PLAYER.avgKDA.toFixed(2) },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Steam ID', value: PLAYER.id },
            { label: 'Steam URL', value: `/${PLAYER.steamId}` },
            { label: 'Дата регистрации', value: '15 янв 2024' },
            { label: 'Последняя синхронизация', value: formatTime(PLAYER.lastSync) },
            { label: 'Последняя активность', value: formatTime(PLAYER.lastMatch) },
            { label: 'Страна', value: `🇷🇺 ${PLAYER.country}` },
          ].map((s, i) => (
            <div key={s.label} className="flex justify-between items-center px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
              <span className="text-white" style={{ fontSize: 12, maxWidth: 160, textAlign: 'right', wordBreak: 'break-all' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Достижения</p>
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{ background: a.completed ? `${accentColor}08` : 'rgba(255,255,255,0.03)', border: `1px solid ${a.completed ? accentColor + '20' : 'rgba(255,255,255,0.06)'}`, opacity: a.completed ? 1 : 0.45 }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <p className="text-white text-center" style={{ fontSize: 10, lineHeight: 1.3 }}>{a.title}</p>
                {a.completed && a.date && <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{a.date}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={handleSync} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Обновляем...' : 'Обновить статистику'}
          </button>
          <button onClick={() => showToast('Форма редактирования открыта', 'info')}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>
            Изменить профиль
          </button>
          <button onClick={() => { logout(); navigate('/auth'); }}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 14, fontWeight: 600, color: '#F87171' }}>
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Settings (incl. Security) ────────────────────────────────────────────────
function SettingsSection({ onBack }: { onBack: () => void }) {
  const { theme, setTheme, showToast } = useApp();
  const [lang, setLang] = useState('ru');
  const [syncFreq, setSyncFreq] = useState('Каждые 6 часов');
  const [notifications, setNotifications] = useState({ matches: true, winrate: true, builds: false, system: true });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [twoFa, setTwoFa] = useState(false);

  const themes = [
    { id: 'bw' as const,    label: 'Чёрно-белая',   accent: '#FFFFFF', bg: '#1A1A1A' },
    { id: 'red' as const,   label: 'Красно-чёрная', accent: '#EF4444', bg: '#1A0808' },
    { id: 'green' as const, label: 'Зелено-чёрная', accent: '#22C55E', bg: '#081A0D' },
  ];

  return (
    <>
      <SectionHeader label="Настройки" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {/* Theme */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Тема оформления</p>
          <div className="flex flex-col gap-2">
            {themes.map(t => (
              <button key={t.id} onClick={() => { setTheme(t.id); showToast(`Тема "${t.label}" применена`, 'success'); }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: theme === t.id ? `${t.accent}10` : 'rgba(255,255,255,0.03)', border: `1px solid ${theme === t.id ? t.accent + '35' : 'rgba(255,255,255,0.07)'}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, border: `2px solid ${t.accent}` }} />
                <span className="text-white flex-1 text-left" style={{ fontSize: 14 }}>{t.label}</span>
                {theme === t.id && <Check size={16} color={t.accent} />}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Язык интерфейса</p>
          {['ru', 'en', 'zh'].map(l => (
            <button key={l} onClick={() => setLang(l)} className="w-full flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                {l === 'ru' ? '🇷🇺 Русский' : l === 'en' ? '🇺🇸 English' : '🇨🇳 中文'}
              </span>
              {lang === l && <Check size={15} color="#4ADE80" />}
            </button>
          ))}
        </div>

        {/* Sync */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Синхронизация данных</p>
          {['Каждый час', 'Каждые 6 часов', 'Каждые 12 часов', 'Вручную'].map(f => (
            <button key={f} onClick={() => setSyncFreq(f)} className="w-full flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
              {syncFreq === f && <Check size={15} color="#4ADE80" />}
            </button>
          ))}
        </div>

        {/* Push notifications */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Push-уведомления</p>
          {[
            { key: 'matches' as const,  label: 'Новые матчи' },
            { key: 'winrate' as const,  label: 'Падение винрейта' },
            { key: 'builds' as const,   label: 'Новые рекомендации сборок' },
            { key: 'system' as const,   label: 'Системные уведомления' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{n.label}</span>
              <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors"
                style={{ background: notifications[n.key] ? '#4ADE80' : 'rgba(255,255,255,0.15)', justifyContent: notifications[n.key] ? 'flex-end' : 'flex-start' }}>
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>

        {/* ── Security (merged here) ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.8 }}>БЕЗОПАСНОСТЬ</p>

        {/* Change password */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Смена пароля</p>
          {[{ label: 'Текущий пароль', show: showOldPw, setShow: setShowOldPw }, { label: 'Новый пароль', show: showNewPw, setShow: setShowNewPw }].map(f => (
            <div key={f.label} className="relative mb-3">
              <input type={f.show ? 'text' : 'password'} placeholder={f.label}
                className="w-full pr-12 pl-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14 }} />
              <button type="button" onClick={() => f.setShow(!f.show)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {f.show ? <EyeOff size={16} color="rgba(255,255,255,0.35)" /> : <Eye size={16} color="rgba(255,255,255,0.35)" />}
              </button>
            </div>
          ))}
          <button onClick={() => showToast('Пароль успешно изменён', 'success')}
            className="w-full py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            Изменить пароль
          </button>
        </div>

        {/* Biometric & 2FA */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Биометрическая блокировка', state: biometric, toggle: () => setBiometric(!biometric) },
            { label: 'Двухфакторная защита (2FA)', state: twoFa, toggle: () => setTwoFa(!twoFa) },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center justify-between py-3"
              style={{ borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{item.label}</span>
              <button onClick={item.toggle} className="w-11 h-6 rounded-full flex items-center px-0.5"
                style={{ background: item.state ? '#4ADE80' : 'rgba(255,255,255,0.15)', justifyContent: item.state ? 'flex-end' : 'flex-start' }}>
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>

        {/* Other */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['Кэш и офлайн-данные', 'Политика конфиденциальности', 'О приложении'].map((item, i) => (
            <button key={item} onClick={() => showToast(item, 'info')}
              className="w-full flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
              <ChevronRight size={15} color="rgba(255,255,255,0.25)" />
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>Dota Scope v2.4.1 · Build 241</p>
      </div>
    </>
  );
}

// ─── Linked Steam Accounts ────────────────────────────────────────────────────
function LinkedSection({ onBack }: { onBack: () => void }) {
  const { steamAccounts, activeAccountId, switchAccount, removeAccount, addAccountByUrl, showToast } = useApp();
  const [addingNew, setAddingNew] = useState(false);
  const [newSteamId, setNewSteamId] = useState('');
  const [loadingSwitch, setLoadingSwitch] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSwitch = async (id: string) => {
    if (id === activeAccountId) return;
    setLoadingSwitch(id);
    try {
      await switchAccount(id);
      showToast('Аккаунт переключён. Данные обновлены!', 'success');
    } finally {
      setLoadingSwitch(null);
    }
  };

  const handleAdd = async () => {
    if (!newSteamId.trim()) return;
    const input = newSteamId.startsWith('http')
      ? newSteamId
      : `https://steamcommunity.com/id/${newSteamId}/`;
    try {
      await addAccountByUrl(input);
      setAddingNew(false);
      setNewSteamId('');
    } catch {
      // Error toast already shown by service layer.
    }
  };

  const handleRemove = (id: string) => {
    removeAccount(id);
    setConfirmDelete(null);
    showToast('Аккаунт удалён', 'info');
  };

  const RANK_COLORS: Record<string, string> = {
    'Immortal': '#EF4444', 'Divine': '#A855F7', 'Ancient': '#3B82F6',
    'Legend': '#22C55E', 'Archon': '#F59E0B', 'Crusader': '#EC4899', 'Guardian': '#6B7280',
  };

  return (
    <>
      <SectionHeader
        label="Steam аккаунты"
        onBack={onBack}
        action={
          <button onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            <Plus size={13} /> Добавить
          </button>
        }
      />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {/* Info */}
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <Zap size={14} color="#60A5FA" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            При переключении аккаунта обновляются: матчи, сборки, аналитика, цели и статистика.
          </p>
        </div>

        {/* Accounts list */}
        {steamAccounts.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div style={{ fontSize: 52 }}>🔗</div>
            <p className="text-white" style={{ fontSize: 17, fontWeight: 600 }}>Нет привязанных аккаунтов</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              Добавьте Steam аккаунт чтобы начать отслеживать статистику
            </p>
            <button onClick={() => setAddingNew(true)}
              className="px-6 py-3 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 14, fontWeight: 600, color: 'white' }}>
              <Plus size={16} /> Добавить аккаунт
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {steamAccounts.map(acc => {
              const isActive = acc.id === activeAccountId;
              const isLoading = loadingSwitch === acc.id;
              const rankColor = RANK_COLORS[acc.rank] ?? '#94A3B8';
              return (
                <div key={acc.id} className="rounded-2xl p-4"
                  style={{ background: isActive ? 'rgba(255,255,255,0.05)' : '#111', border: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}` }}>
                  {/* Account header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${rankColor}25, ${rankColor}45)`, border: `2px solid ${rankColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 22 }}>🧙</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>{acc.name}</p>
                        {isActive && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)' }}>
                            <CheckCircle2 size={9} /> Активный
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/{acc.steamId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontSize: 11, color: rankColor, fontWeight: 600 }}>⚡ {acc.rank}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{acc.mmr.toLocaleString()} MMR</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Матчей', value: acc.totalMatches.toLocaleString() },
                      { label: 'Побед',  value: acc.wins.toLocaleString(), color: '#4ADE80' },
                      { label: 'WR%',    value: `${acc.winrate}%`, color: acc.winrate >= 55 ? '#4ADE80' : '#FBBF24' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: (s as any).color ?? 'white' }}>{s.value}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sync info */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock size={11} color="rgba(255,255,255,0.3)" />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      Синхронизировано {formatTime(acc.lastSync)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isActive ? (
                      <button onClick={() => handleSwitch(acc.id)}
                        disabled={!!loadingSwitch}
                        className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 600, color: 'white', opacity: loadingSwitch ? 0.6 : 1 }}>
                        {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                        {isLoading ? 'Переключение...' : 'Сделать активным'}
                      </button>
                    ) : (
                      <button onClick={() => showToast('Синхронизация запущена', 'info')}
                        className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                        style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', fontSize: 13, fontWeight: 600, color: '#4ADE80' }}>
                        <RefreshCw size={13} /> Обновить данные
                      </button>
                    )}
                    {steamAccounts.length > 1 && (
                      <button onClick={() => setConfirmDelete(acc.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Trash2 size={14} color="#F87171" />
                      </button>
                    )}
                  </div>

                  {/* Confirm delete */}
                  {confirmDelete === acc.id && (
                    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                        Удалить аккаунт <strong className="text-white">{acc.name}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleRemove(acc.id)}
                          className="flex-1 py-2 rounded-lg"
                          style={{ background: 'rgba(239,68,68,0.2)', fontSize: 13, fontWeight: 700, color: '#F87171', border: '1px solid rgba(239,68,68,0.4)' }}>
                          Удалить
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="flex-1 py-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.07)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add account form */}
        {addingNew && (
          <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Добавить Steam аккаунт</p>
              <button onClick={() => setAddingNew(false)}>
                <X size={16} color="rgba(255,255,255,0.4)" />
              </button>
            </div>
            <input value={newSteamId} onChange={e => setNewSteamId(e.target.value)}
              placeholder="Steam ID или vanity URL (напр. thposw)"
              className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none mb-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 14 }} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              Данные загружаются через OpenDota API. Убедитесь что профиль открыт.
            </p>
            <div className="flex gap-2">
              <button onClick={handleAdd}
                className="flex-1 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 600, color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                Привязать аккаунт
              </button>
              <button onClick={() => setAddingNew(false)}
                className="px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Export Data ──────────────────────────────────────────────────────────────
function ExportSection({ onBack }: { onBack: () => void }) {
  const { showToast, exportData } = useApp();
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [sections, setSections] = useState({ stats: true, matches: true, analytics: true, builds: false });
  const [dateRange, setDateRange] = useState('30d');
  const [exportState, setExportState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleSection = (key: keyof typeof sections) =>
    setSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleExport = async () => {
    const selected = Object.values(sections).filter(Boolean).length;
    if (selected === 0) { showToast('Выберите хотя бы один раздел', 'warning'); return; }
    setExportState('loading');
    try {
      await exportData();
      setExportState('success');
      showToast(`Экспорт ${format.toUpperCase()} готов!`, 'success');
    } catch {
      setExportState('error');
      showToast('Ошибка экспорта. Попробуйте снова.', 'error');
    }
  };

  const DATE_RANGES = [
    { id: '7d',  label: '7 дней' },
    { id: '30d', label: '30 дней' },
    { id: '3m',  label: '3 месяца' },
    { id: 'all', label: 'Всё время' },
  ];

  const EXPORT_SECTIONS = [
    { key: 'stats' as const,     label: 'Общая статистика',  desc: 'MMR, WR, KDA, GPM, ранги' },
    { key: 'matches' as const,   label: 'Матчи',             desc: 'История матчей с предметами' },
    { key: 'analytics' as const, label: 'Аналитика',         desc: 'Тренды, роли, стороны' },
    { key: 'builds' as const,    label: 'Сборки',            desc: 'Рекомендованные builds' },
  ];

  return (
    <>
      <SectionHeader label="Экспорт данных" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {/* Format */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Формат файла</p>
          <div className="flex gap-2">
            {(['pdf', 'csv'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="flex-1 py-3 rounded-xl flex flex-col items-center gap-1"
                style={{ background: format === f ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${format === f ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                <span style={{ fontSize: 22 }}>{f === 'pdf' ? '📄' : '📊'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: format === f ? 'white' : 'rgba(255,255,255,0.55)' }}>{f.toUpperCase()}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{f === 'pdf' ? 'Отчёт' : 'Таблица'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Диапазон дат</p>
          <div className="grid grid-cols-4 gap-2">
            {DATE_RANGES.map(d => (
              <button key={d.id} onClick={() => setDateRange(d.id)}
                className="py-2 rounded-xl"
                style={{ fontSize: 12, fontWeight: 600, background: dateRange === d.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', color: dateRange === d.id ? 'white' : 'rgba(255,255,255,0.5)', border: `1px solid ${dateRange === d.id ? 'rgba(255,255,255,0.2)' : 'transparent'}` }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Разделы для экспорта</p>
          {EXPORT_SECTIONS.map((s, i) => (
            <button key={s.key} onClick={() => toggleSection(s.key)}
              className="w-full flex items-center gap-3 py-3"
              style={{ borderBottom: i < EXPORT_SECTIONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: sections[s.key] ? '#4ADE80' : 'rgba(255,255,255,0.08)', border: `1px solid ${sections[s.key] ? '#4ADE80' : 'rgba(255,255,255,0.15)'}` }}>
                {sections[s.key] && <Check size={12} color="#000" />}
              </div>
              <div className="text-left">
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Export state */}
        {exportState === 'success' && (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <CheckCircle2 size={20} color="#4ADE80" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#4ADE80' }}>Экспорт готов!</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Файл сохранён в Downloads</p>
            </div>
          </div>
        )}
        {exportState === 'error' && (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle size={20} color="#F87171" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#F87171' }}>Ошибка экспорта</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Попробуйте снова</p>
            </div>
          </div>
        )}

        {/* Export button */}
        <button onClick={handleExport}
          disabled={exportState === 'loading'}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{ background: exportState === 'loading' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 700, color: exportState === 'loading' ? 'rgba(255,255,255,0.4)' : 'white' }}>
          {exportState === 'loading' ? (
            <><RefreshCw size={16} className="animate-spin" /> Формируем файл...</>
          ) : (
            <><FileText size={16} /> Экспортировать {format.toUpperCase()}</>
          )}
        </button>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          Данные загружаются через OpenDota API · {dateRange === '7d' ? '7 дней' : dateRange === '30d' ? '30 дней' : dateRange === '3m' ? '3 месяца' : 'всё время'}
        </p>
      </div>
    </>
  );
}

// ─── Devices ──────────────────────────────────────────────────────────────────
function DevicesSection({ onBack }: { onBack: () => void }) {
  const { showToast, runtimeSnapshot, removeDevice, logoutAllDevices } = useApp();
  const [devices, setDevices] = useState(DEVICES);
  const [confirmLogout, setConfirmLogout] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const handleLogoutDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    removeDevice(id);
    setConfirmLogout(null);
    showToast('Сессия завершена', 'success');
  };

  const handleLogoutAll = () => {
    setDevices(prev => prev.filter(d => d.current));
    logoutAllDevices();
    setConfirmAll(false);
    showToast('Выход со всех устройств выполнен', 'success');
  };

  const otherDevices = devices.filter(d => !d.current);
  const currentDevice = devices.find(d => d.current);

  React.useEffect(() => {
    setDevices(runtimeSnapshot.devices as any);
  }, [runtimeSnapshot.devices]);

  React.useEffect(() => {
    setDevices(runtimeSnapshot.devices as any);
  }, [runtimeSnapshot.devices]);

  return (
    <>
      <SectionHeader label="Устройства" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {/* Current device */}
        {currentDevice && (
          <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
              <p style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600, letterSpacing: 0.5 }}>ТЕКУЩЕЕ УСТРОЙСТВО</p>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22 }}>{currentDevice.name.includes('Chrome') ? '💻' : '📱'}</span>
              </div>
              <div className="flex-1">
                <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>{currentDevice.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{currentDevice.os}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{currentDevice.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Other devices */}
        {otherDevices.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white px-4 py-3" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Другие устройства ({otherDevices.length})
            </p>
            {otherDevices.map((d, i) => (
              <div key={d.id}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20 }}>{d.name.includes('Chrome') ? '💻' : '📱'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white" style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{d.os} · {d.location}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} color="rgba(255,255,255,0.25)" />
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                        Последний вход: {new Date(d.lastSeen).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmLogout(d.id)}
                    style={{ fontSize: 12, color: '#F87171', fontWeight: 600, padding: '4px 8px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    Выйти
                  </button>
                </div>
                {confirmLogout === d.id && (
                  <div className="mx-4 mb-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                      Выйти с устройства <strong className="text-white">{d.name}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleLogoutDevice(d.id)}
                        className="flex-1 py-2 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.15)', fontSize: 12, fontWeight: 700, color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                        Выйти
                      </button>
                      <button onClick={() => setConfirmLogout(null)}
                        className="flex-1 py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
                {i < otherDevices.length - 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />}
              </div>
            ))}
          </div>
        )}

        {otherDevices.length === 0 && (
          <div className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Monitor size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Только текущее устройство активно</p>
          </div>
        )}

        {/* Logout all */}
        {otherDevices.length > 0 && (
          <>
            {!confirmAll ? (
              <button onClick={() => setConfirmAll(true)}
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 14, fontWeight: 600, color: '#F87171' }}>
                <LogOut size={15} /> Выйти со всех устройств
              </button>
            ) : (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} color="#F87171" />
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F87171' }}>Выйти со всех устройств?</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                  Все сессии кроме текущей будут завершены. Вам нужно будет войти снова на других устройствах.
                </p>
                <div className="flex gap-2">
                  <button onClick={handleLogoutAll}
                    className="flex-1 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.2)', fontSize: 14, fontWeight: 700, color: '#F87171', border: '1px solid rgba(239,68,68,0.4)' }}>
                    Выйти везде
                  </button>
                  <button onClick={() => setConfirmAll(false)}
                    className="flex-1 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.07)', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Sync History ─────────────────────────────────────────────────────────────
function SyncHistorySection({ onBack }: { onBack: () => void }) {
  const STATUS_MAP = {
    success: { color: '#4ADE80', label: 'Успешно',  icon: '✓' },
    error:   { color: '#F87171', label: 'Ошибка',   icon: '✗' },
    partial: { color: '#FBBF24', label: 'Частично', icon: '!' },
  };
  return (
    <>
      <SectionHeader label="История синхронизаций" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-3 pb-24">
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Star size={13} color="rgba(255,255,255,0.4)" />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            Данные загружаются через OpenDota API · dotaconstants
          </p>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {SYNC_HISTORY.map((s, i) => {
            const st = STATUS_MAP[s.status as keyof typeof STATUS_MAP];
            return (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < SYNC_HISTORY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${st.color}15`, border: `1px solid ${st.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, color: st.color, fontWeight: 700 }}>{st.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white" style={{ fontSize: 13 }}>{st.label} · {s.matches} матчей</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {new Date(s.date).toLocaleString('ru-RU')} · {s.duration}
                  </p>
                  {(s as any).error && <p style={{ fontSize: 11, color: '#F87171' }}>Ошибка: {(s as any).error}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Notifications Settings ────────────────────────────────────────────────────
function NotificationsSection({ onBack }: { onBack: () => void }) {
  const { showToast } = useApp();
  const [settings, setSettings] = useState({
    matches: true, winrate: true, builds: false, system: true, goals: true, sync: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const ITEMS = [
    { key: 'matches' as const, label: 'Новые матчи',              icon: '🎮' },
    { key: 'winrate' as const, label: 'Изменение винрейта',       icon: '📈' },
    { key: 'builds' as const,  label: 'Новые рекомендации сборок',icon: '⚔️' },
    { key: 'goals' as const,   label: 'Прогресс целей',           icon: '🎯' },
    { key: 'sync' as const,    label: 'Синхронизация завершена',   icon: '🔄' },
    { key: 'system' as const,  label: 'Системные уведомления',    icon: '⚙️' },
  ];

  return (
    <>
      <SectionHeader label="Уведомления" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {ITEMS.map((n, i) => (
            <div key={n.key} className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: i < ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{n.icon}</span>
              <span className="flex-1" style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{n.label}</span>
              <button onClick={() => toggle(n.key)}
                className="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors"
                style={{ background: settings[n.key] ? '#4ADE80' : 'rgba(255,255,255,0.15)', justifyContent: settings[n.key] ? 'flex-end' : 'flex-start' }}>
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => showToast('Настройки сохранены', 'success')}
          className="w-full py-3.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
          Сохранить настройки
        </button>
      </div>
    </>
  );
}

// ─── Delete Account ────────────────────────────────────────────────────────────
function DeleteSection({ onBack }: { onBack: () => void }) {
  const { showToast, logout } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState('');

  return (
    <>
      <SectionHeader label="Удаление аккаунта" onBack={onBack} />
      <div className="px-4 py-4 flex flex-col gap-4 pb-24">
        {step === 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} color="#F87171" />
              <p className="text-white" style={{ fontSize: 17, fontWeight: 700 }}>Удалить аккаунт?</p>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20 }}>
              Это действие необратимо. Все данные, статистика, синхронизации и настройки будут удалены навсегда. Восстановление невозможно.
            </p>
            {[
              'История матчей и аналитика',
              'Привязанные Steam аккаунты',
              'Все цели и достижения',
              'Настройки и история синхронизаций',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 py-1.5">
                <X size={12} color="#F87171" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{item}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-5">
              <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.2)', fontSize: 14, fontWeight: 700, color: '#F87171', border: '1px solid rgba(239,68,68,0.4)' }}>
                Продолжить удаление
              </button>
              <button onClick={onBack} className="w-full py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)', fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                Отменить
              </button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12, lineHeight: 1.6 }}>
                Введите <strong className="text-white">DELETE</strong> для подтверждения:
              </p>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl text-white outline-none placeholder:text-white/20"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 14 }} />
            </div>
            <button
              onClick={() => { showToast('Аккаунт удалён', 'error'); logout(); navigate('/auth'); }}
              disabled={confirm !== 'DELETE'}
              className="w-full py-4 rounded-xl"
              style={{ background: confirm === 'DELETE' ? '#EF4444' : 'rgba(239,68,68,0.2)', fontSize: 15, fontWeight: 700, color: confirm === 'DELETE' ? '#fff' : '#F87171', opacity: confirm === 'DELETE' ? 1 : 0.5 }}>
              Удалить аккаунт навсегда
            </button>
            <button onClick={() => setStep(0)} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Назад</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Profile Screen ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { accentColor, steamAccounts, activeAccountId } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeParam = searchParams.get('section');
  const active = SUB_SECTIONS.some(s => s.id === activeParam) ? (activeParam as Section) : null;

  const handleBack = () => setSearchParams({}, { replace: false });
  const openSection = (section: Section) => {
    const next = new URLSearchParams(searchParams);
    next.set('section', section);
    setSearchParams(next, { replace: false });
  };
  const activeAcc = steamAccounts.find(a => a.id === activeAccountId) ?? steamAccounts[0];

  if (active === 'cabinet')      return <div style={{ background: '#080808', minHeight: '100%' }}><CabinetSection onBack={handleBack} /></div>;
  if (active === 'settings')     return <div style={{ background: '#080808', minHeight: '100%' }}><SettingsSection onBack={handleBack} /></div>;
  if (active === 'linked')       return <div style={{ background: '#080808', minHeight: '100%' }}><LinkedSection onBack={handleBack} /></div>;
  if (active === 'export')       return <div style={{ background: '#080808', minHeight: '100%' }}><ExportSection onBack={handleBack} /></div>;
  if (active === 'devices')      return <div style={{ background: '#080808', minHeight: '100%' }}><DevicesSection onBack={handleBack} /></div>;
  if (active === 'sync-history') return <div style={{ background: '#080808', minHeight: '100%' }}><SyncHistorySection onBack={handleBack} /></div>;
  if (active === 'notifications') return <div style={{ background: '#080808', minHeight: '100%' }}><NotificationsSection onBack={handleBack} /></div>;
  if (active === 'delete')       return <div style={{ background: '#080808', minHeight: '100%' }}><DeleteSection onBack={handleBack} /></div>;

  // Main menu
  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `${accentColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12 }}>◈</span>
        </div>
        <p className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>Профиль</p>
      </div>

      {/* Active account mini */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}45)`, border: `2px solid ${accentColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>🧙</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white" style={{ fontSize: 16, fontWeight: 700 }}>{activeAcc?.name ?? PLAYER.name}</p>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                <CheckCircle2 size={8} /> активный
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>/{activeAcc?.steamId ?? PLAYER.steamId}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusDot status="online" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{steamAccounts.length} аккаунт{steamAccounts.length === 1 ? '' : 'а'} привязано</span>
            </div>
          </div>
        </div>

        {/* Quick account switcher */}
        {steamAccounts.length > 1 && (
          <button onClick={() => openSection('linked')}
            className="w-full mt-3 py-2.5 rounded-xl flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            <Zap size={13} /> Переключить аккаунт
          </button>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 py-2">
        {SUB_SECTIONS.map(item => (
          <button key={item.id} onClick={() => openSection(item.id)}
            className="w-full flex items-center gap-4 px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: item.id === 'delete' ? '#F87171' : 'rgba(255,255,255,0.75)' }}>
            <span style={{ color: item.id === 'delete' ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>{item.icon}</span>
            <div className="flex-1 text-left">
              <p style={{ fontSize: 14, fontWeight: 500, color: item.id === 'delete' ? '#F87171' : 'rgba(255,255,255,0.8)' }}>{item.label}</p>
              {item.desc && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{item.desc}</p>}
            </div>
            <ChevronRight size={16} color={item.id === 'delete' ? '#EF4444' : 'rgba(255,255,255,0.2)'} />
          </button>
        ))}
      </nav>
    </div>
  );
}









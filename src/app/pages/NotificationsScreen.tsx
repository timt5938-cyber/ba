import React, { useMemo, useState } from 'react';
import { Bell, BellOff, CheckCheck, Gamepad2, TrendingUp, Sword, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { Notification, formatTime } from '../data/mockData';

const TYPE_CONFIG: Record<Notification['type'], { icon: React.ReactNode; color: string; label: string }> = {
  match:   { icon: <Gamepad2 size={16} />, color: '#60A5FA', label: 'Матч' },
  stat:    { icon: <TrendingUp size={16} />, color: '#4ADE80', label: 'Статистика' },
  build:   { icon: <Sword size={16} />, color: '#F59E0B', label: 'Сборка' },
  warning: { icon: <AlertTriangle size={16} />, color: '#F87171', label: 'Предупреждение' },
  system:  { icon: <Settings size={16} />, color: '#A78BFA', label: 'Система' },
  sync:    { icon: <RefreshCw size={16} />, color: '#34D399', label: 'Синхронизация' },
};

type FilterType = 'all' | Notification['type'];

function NotifCard({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[notif.type];

  return (
    <button
      onClick={() => onRead(notif.id)}
      className="w-full text-left rounded-xl p-4 flex gap-3 transition-all active:scale-[0.99]"
      style={{
        background: notif.read ? 'rgba(255,255,255,0.02)' : '#131313',
        border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
      >
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-white" style={{ fontSize: 13, fontWeight: notif.read ? 500 : 700, lineHeight: 1.4, flex: 1 }}>
            {notif.title}
          </p>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{formatTime(notif.time)}</span>
            {!notif.read && <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{notif.message}</p>
        <div className="mt-2">
          <Badge variant="neutral" size="sm">{cfg.label}</Badge>
        </div>
      </div>
    </button>
  );
}

export default function NotificationsScreen() {
  const { accentColor, showToast, runtimeSnapshot, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  const notifs = runtimeSnapshot.notifications as Notification[];
  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);

  const markAllRead = () => {
    markAllNotificationsRead();
    showToast('Все уведомления прочитаны', 'success');
  };

  const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
    { id: 'all',     label: 'Все' },
    { id: 'match',   label: 'Матчи' },
    { id: 'stat',    label: 'Статистика' },
    { id: 'build',   label: 'Сборки' },
    { id: 'warning', label: 'Предупреждения' },
    { id: 'system',  label: 'Система' },
    { id: 'sync',    label: 'Синхронизация' },
  ];

  const groups = useMemo(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groupMap = new Map<string, Notification[]>();

    filtered.forEach(n => {
      const d = new Date(n.time);
      const ds = d.toDateString();
      const label = ds === today ? 'Сегодня' : ds === yesterday ? 'Вчера' : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      if (!groupMap.has(label)) groupMap.set(label, []);
      groupMap.get(label)!.push(n);
    });

    return Array.from(groupMap.entries()).map(([label, items]) => ({ label, items }));
  }, [filtered]);

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      <div className="px-4 pb-24">
        <div className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell size={18} color={accentColor} />
              <h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>Уведомления</h2>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 700, background: '#EF4444' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <CheckCheck size={13} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Прочитать все</span>
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : 'Все уведомления прочитаны'}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl transition-all"
              style={{
                fontSize: 12,
                fontWeight: 600,
                background: filter === opt.id ? accentColor : 'rgba(255,255,255,0.06)',
                color: filter === opt.id ? '#000' : 'rgba(255,255,255,0.55)',
                border: `1px solid ${filter === opt.id ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <BellOff size={28} color="rgba(255,255,255,0.25)" />
            </div>
            <p className="text-white" style={{ fontSize: 15, fontWeight: 600 }}>Нет уведомлений</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map(group => (
              <div key={group.label}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  {group.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.items.map(notif => (
                    <NotifCard key={notif.id} notif={notif} onRead={markNotificationRead} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


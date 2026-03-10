import React from 'react';
import { useNavigate } from 'react-router';
import { Menu, Bell, RefreshCw, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  title: string;
  showSearch?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, showSearch = false, rightElement }: Props) {
  const { setDrawerOpen, accentColor, showToast, runtimeSnapshot, syncNow } = useApp();
  const navigate = useNavigate();
  const unread = runtimeSnapshot.notifications.filter((n: any) => !n.read).length;

  const handleSync = async () => {
    showToast('Синхронизация запущена...', 'info');
    const result = await syncNow();
    showToast(result.message || (result.status === 'success' ? 'Данные обновлены успешно' : 'Ошибка синхронизации'), result.status === 'success' ? 'success' : 'warning');
  };

  return (
    <header
      className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
      style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}
    >
      <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate('/app/games')} style={{ cursor: 'pointer' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`, border: `1px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>DS</span>
        </div>
        <span className="text-white" style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>{title}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            onClick={() => {}}
          >
            <Search size={16} color="rgba(255,255,255,0.6)" />
          </button>
        )}

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={handleSync}
        >
          <RefreshCw size={15} color="rgba(255,255,255,0.6)" />
        </button>

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={() => navigate('/app/notifications')}
        >
          <Bell size={16} color="rgba(255,255,255,0.6)" />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-white"
              style={{ fontSize: 8, fontWeight: 700, background: '#EF4444', padding: '0 3px' }}
            >
              {unread}
            </span>
          )}
        </button>

        {rightElement}

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-0.5"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={18} color="rgba(255,255,255,0.8)" />
        </button>
      </div>
    </header>
  );
}


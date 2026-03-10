import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  X, Gamepad2, Sword, BarChart3, User, UserCircle, GitCompare, Target, Bell,
  Settings, ChevronRight, LogOut, RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WinrateRing } from './ui/WinrateRing';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'games',         path: '/app/games',         label: 'Игры',        icon: <Gamepad2 size={18} /> },
  { id: 'builds',        path: '/app/builds',        label: 'Сборки',      icon: <Sword size={18} /> },
  { id: 'analytics',     path: '/app/analytics',     label: 'Аналитика',   icon: <BarChart3 size={18} /> },
  { id: 'account',       path: '/app/account',       label: 'Аккаунт',     icon: <User size={18} /> },
  { id: 'profile',       path: '/app/profile',       label: 'Профиль',     icon: <UserCircle size={18} /> },
  { id: 'comparison',    path: '/app/comparison',    label: 'Сравнение',   icon: <GitCompare size={18} /> },
  { id: 'goals',         path: '/app/goals',         label: 'Цели',        icon: <Target size={18} /> },
  { id: 'notifications', path: '/app/notifications', label: 'Уведомления', icon: <Bell size={18} /> },
];

export function RightDrawer() {
  const { drawerOpen, setDrawerOpen, accentColor, accentBgLight, logout, showToast, steamAccounts, activeAccountId, runtimeSnapshot } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const activeAcc = steamAccounts.find(a => a.id === activeAccountId) ?? steamAccounts[0];
  const unread = runtimeSnapshot.notifications.filter((n: any) => !n.read).length;

  const navItems = NAV_ITEMS.map(item => item.id === 'notifications' ? { ...item, badge: unread > 0 ? unread : undefined } : item);

  const goTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    showToast('Вы вышли из аккаунта', 'info');
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 280,
          background: '#0E0E0E',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}55)`, border: `1px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>DS</span>
            </div>
            <span className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>Dota Scope</span>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={16} color="rgba(255,255,255,0.6)" />
          </button>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`, border: `1.5px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>GB</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: 14, fontWeight: 600 }}>
                {activeAcc?.name ?? 'GhostBlade'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>/{activeAcc?.steamId ?? 'thposw'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 600 }}>
                  Rank: {activeAcc?.rank ?? 'Immortal'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  {activeAcc?.mmr?.toLocaleString() ?? '7350'} MMR
                </span>
              </div>
            </div>
            <WinrateRing value={activeAcc?.winrate ?? 54.9} size={44} strokeWidth={4} color={accentColor} />
          </div>
          {steamAccounts.length > 1 && (
            <button onClick={() => goTo('/app/profile')}
              className="w-full mt-2 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {steamAccounts.length} аккаунта · переключить
              </span>
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 relative transition-colors"
                style={{
                  background: active ? accentBgLight : 'transparent',
                  borderRight: active ? `3px solid ${accentColor}` : '3px solid transparent',
                }}
              >
                <span style={{ color: active ? accentColor : 'rgba(255,255,255,0.45)', transition: 'color 0.2s' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 14, color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)', fontWeight: active ? 600 : 400, flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white"
                    style={{ fontSize: 10, fontWeight: 700, background: '#EF4444', padding: '0 4px' }}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => goTo('/app/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Settings size={16} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Настройки и профиль</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.06)' }}>
            <LogOut size={16} color="#EF4444" />
            <span style={{ fontSize: 13, color: '#EF4444' }}>Выйти</span>
          </button>
          <p className="text-center mt-3" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            Dota Scope v2.4.1 · OpenDota API
          </p>
        </div>
      </aside>
    </>
  );
}


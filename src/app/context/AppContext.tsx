import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { ThemeType, SteamAccount } from '../data/mockData';
import { applySnapshotToRuntimeData, loadRuntimeSnapshot, saveRuntimeSnapshot, RuntimeDataSnapshot } from '../data/runtimeData';
import { authService } from '../core/authService';
import { dataSyncService } from '../core/dataSyncService';
import { SyncResult } from '../domain/types';
import { staticsService } from '../core/staticsService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  accentColor: string;
  accentBg: string;
  accentBgLight: string;
  accentBorder: string;
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  activeRoute: string;
  setActiveRoute: (r: string) => void;
  toasts: Toast[];
  showToast: (msg: string, type?: Toast['type']) => void;
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  dataRevision: number;

  steamAccounts: SteamAccount[];
  activeAccountId: string;
  switchAccount: (id: string) => Promise<void>;
  addAccount: (acc: SteamAccount) => void;
  removeAccount: (id: string) => void;
  addAccountByUrl: (url: string) => Promise<void>;

  register: (identity: string, password: string, username?: string) => Promise<void>;
  login: (identity: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (identity: string) => Promise<string>;
  resetPassword: (identity: string, code: string, newPassword: string) => Promise<void>;

  syncNow: () => Promise<SyncResult>;
  exportData: () => Promise<void>;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  upsertGoal: (goal: any) => void;
  removeGoal: (id: string) => void;
  removeDevice: (id: string) => void;
  logoutAllDevices: () => void;

  runtimeSnapshot: RuntimeDataSnapshot;
  staticsLoaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const THEME_COLORS: Record<ThemeType, { color: string; bg: string; bgLight: string; border: string }> = {
  bw:    { color: '#FFFFFF',  bg: '#FFFFFF', bgLight: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' },
  red:   { color: '#EF4444',  bg: '#EF4444', bgLight: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)' },
  green: { color: '#22C55E',  bg: '#22C55E', bgLight: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function AppProvider({ children }: { children: ReactNode }) {
  const initialSnapshot = useMemo(() => loadRuntimeSnapshot(), []);
  applySnapshotToRuntimeData(initialSnapshot);

  const [theme, setThemeState] = useState<ThemeType>('bw');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/app/games');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<RuntimeDataSnapshot>(initialSnapshot);
  const [dataRevision, setDataRevision] = useState(0);
  const [staticsLoaded, setStaticsLoaded] = useState(false);

  const existingSession = authService.getSession();
  const [isAuthenticated, setAuthenticated] = useState(Boolean(existingSession));

  const [steamAccounts, setSteamAccounts] = useState<SteamAccount[]>(initialSnapshot.steamAccounts);
  const [activeAccountId, setActiveAccountId] = useState<string>(
    initialSnapshot.steamAccounts.find(a => a.active)?.id ?? initialSnapshot.steamAccounts[0]?.id ?? ''
  );

  const setTheme = useCallback((t: ThemeType) => setThemeState(t), []);

  const persistSnapshot = useCallback((nextSnapshot: RuntimeDataSnapshot) => {
    setRuntimeSnapshot(nextSnapshot);
    applySnapshotToRuntimeData(nextSnapshot);
    saveRuntimeSnapshot(nextSnapshot);
    setDataRevision(prev => prev + 1);
  }, []);

  const updateSnapshot = useCallback((updater: (snapshot: RuntimeDataSnapshot) => RuntimeDataSnapshot) => {
    const next = updater(clone(runtimeSnapshot));
    persistSnapshot(next);
  }, [persistSnapshot, runtimeSnapshot]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    staticsService.load()
      .then(() => { if (mounted) setStaticsLoaded(true); })
      .catch(() => { if (mounted) setStaticsLoaded(false); });
    return () => {
      mounted = false;
    };
  }, []);

  const syncNow = useCallback(async () => {
    const active = steamAccounts.find(a => a.id === activeAccountId) ?? steamAccounts[0];
    if (!active?.id) {
      const result: SyncResult = {
        status: 'error',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        message: 'Нет активного Steam аккаунта для синхронизации.',
      };
      showToast(result.message!, 'error');
      return result;
    }

    setLoading(true);
    try {
      const { snapshot, result } = await dataSyncService.syncBySteamId(runtimeSnapshot, active.id);
      persistSnapshot(snapshot);
      if (snapshot.steamAccounts?.length > 0) {
        setSteamAccounts(snapshot.steamAccounts as any);
      }
      showToast(result.message || 'Синхронизация завершена', result.status === 'success' ? 'success' : 'warning');
      return result;
    } finally {
      setLoading(false);
    }
  }, [activeAccountId, persistSnapshot, runtimeSnapshot, showToast, steamAccounts]);

  const switchAccount = useCallback(async (id: string) => {
    setSteamAccounts(prev => prev.map(a => ({ ...a, active: a.id === id })));
    setActiveAccountId(id);

    updateSnapshot((snapshot) => {
      snapshot.steamAccounts = snapshot.steamAccounts.map((a: any) => ({ ...a, active: a.id === id })) as any;
      return snapshot;
    });

    await syncNow();
  }, [syncNow, updateSnapshot]);

  const addAccount = useCallback((acc: SteamAccount) => {
    setSteamAccounts(prev => {
      const next = [...prev, acc];
      updateSnapshot((snapshot) => {
        snapshot.steamAccounts = next as any;
        return snapshot;
      });
      return next;
    });
  }, [updateSnapshot]);

  const removeAccount = useCallback((id: string) => {
    setSteamAccounts(prev => {
      const remaining = prev.filter(a => a.id !== id);
      if (id === activeAccountId && remaining.length > 0) {
        remaining[0].active = true;
        setActiveAccountId(remaining[0].id);
      }
      updateSnapshot((snapshot) => {
        snapshot.steamAccounts = remaining as any;
        return snapshot;
      });
      return remaining;
    });
  }, [activeAccountId, updateSnapshot]);

  const addAccountByUrl = useCallback(async (url: string) => {
    setLoading(true);
    try {
      const bound = await dataSyncService.bindSteamProfile(url);
      const id = bound.steamId64 || `tmp_${Math.random().toString(36).slice(2, 10)}`;
      const account: SteamAccount = {
        id,
        name: bound.displayName || bound.vanityName || 'Steam User',
        steamId: bound.vanityName || id,
        steamUrl: bound.profileUrl,
        rank: 'Unknown',
        rankTier: 0,
        mmr: 0,
        winrate: 0,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        lastSync: new Date().toISOString(),
        active: false,
        country: 'N/A',
      };
      addAccount(account);
      showToast(`Steam аккаунт ${account.name} привязан`, 'success');
    } catch (error: any) {
      showToast(error?.message || 'Не удалось привязать Steam аккаунт', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addAccount, showToast]);

  const register = useCallback(async (identity: string, password: string, username?: string) => {
    await authService.register({ identity, password, username });
    setAuthenticated(true);
  }, []);

  const login = useCallback(async (identity: string, password: string) => {
    await authService.login({ identity, password });
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthenticated(false);
  }, []);

  const forgotPassword = useCallback(async (identity: string) => {
    const { code } = await authService.requestPasswordReset({ identity });
    return code;
  }, []);

  const resetPassword = useCallback(async (identity: string, code: string, newPassword: string) => {
    await authService.resetPassword({ identity, code, newPassword });
  }, []);

  const exportData = useCallback(async () => {
    const bundle = dataSyncService.exportBundle(runtimeSnapshot);
    const stamp = bundle.generatedAt.replace(/[:.]/g, '-');

    const emitDownload = (name: string, content: string, type = 'text/plain;charset=utf-8') => {
      const blob = new Blob([content], { type });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
    };

    emitDownload(`dota-scope-summary-${stamp}.json`, bundle.summary, 'application/json;charset=utf-8');
    emitDownload(`dota-scope-matches-${stamp}.csv`, bundle.matchesCsv, 'text/csv;charset=utf-8');
    emitDownload(`dota-scope-analytics-${stamp}.csv`, bundle.analyticsCsv, 'text/csv;charset=utf-8');
    emitDownload(`dota-scope-builds-${stamp}.csv`, bundle.buildsCsv, 'text/csv;charset=utf-8');
  }, [runtimeSnapshot]);

  const markNotificationRead = useCallback((id: string) => {
    updateSnapshot((snapshot) => {
      snapshot.notifications = snapshot.notifications.map((n: any) => n.id === id ? { ...n, read: true } : n) as any;
      return snapshot;
    });
  }, [updateSnapshot]);

  const markAllNotificationsRead = useCallback(() => {
    updateSnapshot((snapshot) => {
      snapshot.notifications = snapshot.notifications.map((n: any) => ({ ...n, read: true })) as any;
      return snapshot;
    });
  }, [updateSnapshot]);

  const upsertGoal = useCallback((goal: any) => {
    updateSnapshot((snapshot) => {
      const idx = snapshot.goals.findIndex((g: any) => g.id === goal.id);
      if (idx >= 0) snapshot.goals[idx] = goal;
      else snapshot.goals.unshift(goal);
      return snapshot;
    });
  }, [updateSnapshot]);

  const removeGoal = useCallback((id: string) => {
    updateSnapshot((snapshot) => {
      snapshot.goals = snapshot.goals.filter((g: any) => g.id !== id) as any;
      return snapshot;
    });
  }, [updateSnapshot]);

  const removeDevice = useCallback((id: string) => {
    updateSnapshot((snapshot) => {
      snapshot.devices = snapshot.devices.filter((d: any) => d.id !== id) as any;
      return snapshot;
    });
  }, [updateSnapshot]);

  const logoutAllDevices = useCallback(() => {
    updateSnapshot((snapshot) => {
      snapshot.devices = snapshot.devices.filter((d: any) => d.current) as any;
      return snapshot;
    });
  }, [updateSnapshot]);

  const colors = THEME_COLORS[theme];

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      accentColor: colors.color,
      accentBg: colors.bg,
      accentBgLight: colors.bgLight,
      accentBorder: colors.border,
      isAuthenticated, setAuthenticated,
      drawerOpen, setDrawerOpen,
      activeRoute, setActiveRoute,
      toasts, showToast,
      isLoading, setLoading,
      dataRevision,
      steamAccounts, activeAccountId, switchAccount, addAccount, removeAccount, addAccountByUrl,
      register, login, logout, forgotPassword, resetPassword,
      syncNow, exportData,
      markNotificationRead, markAllNotificationsRead,
      upsertGoal, removeGoal,
      removeDevice, logoutAllDevices,
      runtimeSnapshot,
      staticsLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}


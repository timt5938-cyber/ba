import {
  PLAYER,
  MATCHES,
  HERO_STATS,
  BUILDS,
  GOALS,
  NOTIFICATIONS,
  DEVICES,
  ACHIEVEMENTS,
  SYNC_HISTORY,
  STEAM_ACCOUNTS,
  WINRATE_DAILY,
  WINRATE_WEEKLY,
  GPM_TREND,
  KDA_TREND,
  ROLE_STATS,
  SIDE_STATS,
  HERO_WINRATE_CHART,
  COMPARISON_PLAYER,
} from './mockData';
import { storage } from '../core/storage';
import { appEnv } from '../core/env';

const DATA_KEY = appEnv.useProductionBackend ? 'dota_scope_runtime_data_prod_v1' : 'dota_scope_runtime_data_v1';

export interface RuntimeDataSnapshot {
  player: typeof PLAYER;
  matches: typeof MATCHES;
  heroStats: typeof HERO_STATS;
  builds: typeof BUILDS;
  goals: typeof GOALS;
  notifications: typeof NOTIFICATIONS;
  devices: typeof DEVICES;
  achievements: typeof ACHIEVEMENTS;
  syncHistory: typeof SYNC_HISTORY;
  steamAccounts: typeof STEAM_ACCOUNTS;
  analytics: {
    winrateDaily: typeof WINRATE_DAILY;
    winrateWeekly: typeof WINRATE_WEEKLY;
    gpmTrend: typeof GPM_TREND;
    kdaTrend: typeof KDA_TREND;
    roleStats: typeof ROLE_STATS;
    sideStats: typeof SIDE_STATS;
    heroWinrateChart: typeof HERO_WINRATE_CHART;
  };
  comparisonPlayer: typeof COMPARISON_PLAYER;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const maybeFixMojibake = (value: string): string => {
  if (!/[ÐÑРС]/.test(value)) return value;
  try {
    const bytes = new Uint8Array(Array.from(value).map(ch => ch.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (/[А-Яа-яЁё]/.test(decoded)) return decoded;
  } catch {
    // noop
  }
  return value;
};

const sanitizeStrings = <T,>(input: T): T => {
  if (typeof input === 'string') return maybeFixMojibake(input) as T;
  if (Array.isArray(input)) return input.map(v => sanitizeStrings(v)) as T;
  if (input && typeof input === 'object') {
    const next: any = {};
    Object.entries(input as Record<string, any>).forEach(([k, v]) => {
      next[k] = sanitizeStrings(v);
    });
    return next as T;
  }
  return input;
};

const createMockSnapshot = (): RuntimeDataSnapshot => ({
  player: clone(PLAYER),
  matches: clone(MATCHES),
  heroStats: clone(HERO_STATS),
  builds: clone(BUILDS),
  goals: clone(GOALS),
  notifications: clone(NOTIFICATIONS),
  devices: clone(DEVICES),
  achievements: clone(ACHIEVEMENTS),
  syncHistory: clone(SYNC_HISTORY),
  steamAccounts: clone(STEAM_ACCOUNTS),
  analytics: {
    winrateDaily: clone(WINRATE_DAILY),
    winrateWeekly: clone(WINRATE_WEEKLY),
    gpmTrend: clone(GPM_TREND),
    kdaTrend: clone(KDA_TREND),
    roleStats: clone(ROLE_STATS),
    sideStats: clone(SIDE_STATS),
    heroWinrateChart: clone(HERO_WINRATE_CHART),
  },
  comparisonPlayer: clone(COMPARISON_PLAYER),
});

const createProdEmptySnapshot = (): RuntimeDataSnapshot => {
  const base = createMockSnapshot();
  return {
    ...base,
    player: {
      ...base.player,
      id: '',
      name: '',
      steamId: '',
      steamUrl: '',
      wins: 0,
      losses: 0,
      totalMatches: 0,
      winrate: 0,
      avgKDA: 0,
      avgGPM: 0,
      avgXPM: 0,
      mmr: 0,
      rankTier: 0,
      rank: 'Unknown',
      lastSync: '',
      lastMatch: '',
    } as any,
    matches: [] as any,
    heroStats: [] as any,
    builds: [] as any,
    goals: [] as any,
    notifications: [] as any,
    devices: [] as any,
    achievements: [] as any,
    syncHistory: [] as any,
    steamAccounts: [] as any,
    analytics: {
      winrateDaily: [] as any,
      winrateWeekly: [] as any,
      gpmTrend: [] as any,
      kdaTrend: [] as any,
      roleStats: [] as any,
      sideStats: [] as any,
      heroWinrateChart: [] as any,
    },
  };
};

export const getDefaultSnapshot = (): RuntimeDataSnapshot => (
  appEnv.useProductionBackend ? createProdEmptySnapshot() : createMockSnapshot()
);

const replaceArray = <T>(target: T[], source: T[]) => {
  target.splice(0, target.length, ...source);
};

export const applySnapshotToRuntimeData = (snapshot: RuntimeDataSnapshot) => {
  Object.assign(PLAYER, snapshot.player);
  Object.assign(COMPARISON_PLAYER, snapshot.comparisonPlayer);

  replaceArray(MATCHES, snapshot.matches);
  replaceArray(HERO_STATS, snapshot.heroStats);
  replaceArray(BUILDS, snapshot.builds);
  replaceArray(GOALS, snapshot.goals);
  replaceArray(NOTIFICATIONS, snapshot.notifications);
  replaceArray(DEVICES, snapshot.devices);
  replaceArray(ACHIEVEMENTS, snapshot.achievements);
  replaceArray(SYNC_HISTORY, snapshot.syncHistory);
  replaceArray(STEAM_ACCOUNTS, snapshot.steamAccounts);

  replaceArray(WINRATE_DAILY, snapshot.analytics.winrateDaily);
  replaceArray(WINRATE_WEEKLY, snapshot.analytics.winrateWeekly);
  replaceArray(GPM_TREND, snapshot.analytics.gpmTrend);
  replaceArray(KDA_TREND, snapshot.analytics.kdaTrend);
  replaceArray(ROLE_STATS, snapshot.analytics.roleStats);
  replaceArray(SIDE_STATS, snapshot.analytics.sideStats);
  replaceArray(HERO_WINRATE_CHART, snapshot.analytics.heroWinrateChart);
};

export const loadRuntimeSnapshot = (): RuntimeDataSnapshot => {
  if (appEnv.useProductionBackend) {
    return getDefaultSnapshot();
  }
  const saved = storage.get<RuntimeDataSnapshot | null>(DATA_KEY, null);
  if (!saved) return getDefaultSnapshot();
  return sanitizeStrings(saved);
};

export const saveRuntimeSnapshot = (snapshot: RuntimeDataSnapshot) => {
  storage.set(DATA_KEY, snapshot);
};



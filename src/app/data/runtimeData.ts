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

const DATA_KEY = 'dota_scope_runtime_data_v1';

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

export const getDefaultSnapshot = (): RuntimeDataSnapshot => ({
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
  const saved = storage.get<RuntimeDataSnapshot | null>(DATA_KEY, null);
  if (!saved) return getDefaultSnapshot();
  return saved;
};

export const saveRuntimeSnapshot = (snapshot: RuntimeDataSnapshot) => {
  storage.set(DATA_KEY, snapshot);
};


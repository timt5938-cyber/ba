import { appEnv } from './env';
import { openDotaClient, OpenDotaRecentMatch } from './opendotaClient';
import { resolveSteamProfile } from './steam';
import { RuntimeDataSnapshot, getDefaultSnapshot } from '../data/runtimeData';
import { SyncResult } from '../domain/types';
import { HEROES, ITEMS } from '../data/mockData';
import { authService } from './authService';

const heroByCdn = Object.values(HEROES).reduce<Record<string, any>>((acc, h: any) => {
  acc[h.cdnName] = h;
  return acc;
}, {});

const HERO_ID_TO_CDN: Record<number, string> = {
  1: 'antimage', 2: 'axe', 5: 'crystal_maiden', 8: 'juggernaut', 11: 'nevermore',
  14: 'pudge', 16: 'sand_king', 18: 'sven', 22: 'zeus', 25: 'lina', 27: 'shadow_shaman',
  37: 'warlock', 39: 'queenofpain', 47: 'viper', 63: 'weaver', 74: 'invoker', 86: 'rubick',
  97: 'magnataur', 102: 'abaddon', 106: 'ember_spirit', 107: 'earth_spirit', 113: 'arc_warden', 126: 'void_spirit',
};

const ALL_ITEM_POOL = Object.values(ITEMS);
const BACKEND_API_BASE = `${appEnv.backendBaseUrl.replace(/\/+$/, '')}/api`;

const accountId32From64 = (steamId64: string): number => {
  if (!/^\d{17}$/.test(steamId64)) {
    throw new Error('Некорректный steam_id64 для синхронизации');
  }
  const base = BigInt('76561197960265728');
  const sid64 = BigInt(steamId64);
  return Number(sid64 - base);
};

const deriveRole = (laneRole?: number): string => {
  if (laneRole === 1) return 'Safe';
  if (laneRole === 2) return 'Mid';
  if (laneRole === 3) return 'Off';
  return 'Midlaner';
};

const derivePosition = (gpm = 0, assists = 0): string => {
  if (gpm > 620) return 'Carry';
  if (gpm > 520) return 'Midlaner';
  if (gpm > 420) return 'Offlaner';
  if (assists > 14) return 'Pos 4';
  return 'Pos 5';
};

const toHero = (heroId: number) => {
  const cdnName = HERO_ID_TO_CDN[heroId];
  if (cdnName && heroByCdn[cdnName]) return heroByCdn[cdnName];
  return {
    id: `hero-${heroId}`,
    name: `Hero #${heroId}`,
    short: `H${heroId}`,
    attr: 'uni',
    color: '#94A3B8',
    roles: ['Unknown'],
    cdnName: cdnName || 'unknown',
  };
};

const toMatch = (m: OpenDotaRecentMatch, idx: number) => {
  const isRadiant = m.player_slot < 128;
  const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
  const role = derivePosition(m.gold_per_min, m.assists);
  const lane = deriveRole(m.lane_role);
  const kdaRatio = (m.kills + m.assists) / Math.max(1, m.deaths);
  const performance = Math.round(Math.min(100, Math.max(25, kdaRatio * 18 + (m.gold_per_min || 0) / 18)));
  const patch = m.version ? `7.${m.version}` : '7.38';

  return {
    id: String(m.match_id),
    hero: toHero(m.hero_id),
    result: won ? 'win' : 'loss',
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    duration: m.duration,
    gpm: m.gold_per_min || 0,
    xpm: m.xp_per_min || 0,
    lastHits: Math.max(20, Math.round((m.gold_per_min || 300) * 0.42)),
    denies: Math.round(((m.gold_per_min || 300) * 0.04) % 30),
    heroDamage: m.hero_damage || 0,
    towerDamage: m.tower_damage || 0,
    healing: 0,
    netWorth: Math.round((m.gold_per_min || 0) * (m.duration / 60)),
    rank: 'Ranked',
    date: new Date(m.start_time * 1000).toISOString(),
    role,
    lane,
    side: isRadiant ? 'radiant' : 'dire',
    patch,
    gameMode: `Mode ${m.game_mode}`,
    region: `Region ${m.region ?? 0}`,
    items: ALL_ITEM_POOL.slice(idx % 5, (idx % 5) + 6),
    performance,
    kdaRatio,
  };
};

const toMatchFromBackend = (m: any, idx: number) => ({
  id: String(m.match_id),
  hero: toHero(Number(m.hero_id || 0)),
  result: m.result === 'win' ? 'win' : 'loss',
  kills: Number(m.kills || 0),
  deaths: Number(m.deaths || 0),
  assists: Number(m.assists || 0),
  duration: Number(m.duration_seconds || 0),
  gpm: Number(m.gpm || 0),
  xpm: Number(m.xpm || 0),
  lastHits: Math.round(Number(m.gpm || 0) * 0.42),
  denies: Math.round(Number(m.gpm || 0) * 0.04),
  heroDamage: 0,
  towerDamage: 0,
  healing: 0,
  netWorth: Math.round(Number(m.gpm || 0) * (Number(m.duration_seconds || 0) / 60)),
  rank: 'Ranked',
  date: m.start_time ? new Date(m.start_time).toISOString() : new Date().toISOString(),
  role: m.role || 'Unknown',
  lane: m.lane || 'Unknown',
  side: 'radiant',
  patch: m.patch || '7.38',
  gameMode: String(m.game_mode || 'Unknown'),
  region: String(m.region || 'Unknown'),
  items: ALL_ITEM_POOL.slice(idx % 5, (idx % 5) + 6),
  performance: Math.max(25, Math.min(100, Math.round(((Number(m.kda || 0) * 16) + Number(m.gpm || 0) / 20)))),
  kdaRatio: Number(m.kda || 0),
});

const computeHeroStats = (matches: any[]) => {
  const grouped = new Map<string, any[]>();
  matches.forEach((match) => {
    const key = String(match.hero.id);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(match);
  });

  return Array.from(grouped.values()).map(heroMatches => {
    const sample = heroMatches[0];
    const wins = heroMatches.filter(m => m.result === 'win').length;
    const losses = heroMatches.length - wins;
    const avgKDA = heroMatches.reduce((s, m) => s + m.kdaRatio, 0) / heroMatches.length;
    const avgGPM = heroMatches.reduce((s, m) => s + m.gpm, 0) / heroMatches.length;
    const avgXPM = heroMatches.reduce((s, m) => s + m.xpm, 0) / heroMatches.length;
    return {
      hero: sample.hero,
      matches: heroMatches.length,
      wins,
      losses,
      winrate: Number(((wins / heroMatches.length) * 100).toFixed(1)),
      avgKDA: Number(avgKDA.toFixed(2)),
      avgGPM: Math.round(avgGPM),
      avgXPM: Math.round(avgXPM),
      lastPlayed: sample.date,
    };
  }).sort((a, b) => b.matches - a.matches);
};

const buildRecommendations = (matches: any[], heroStats: any[]) => {
  return heroStats.slice(0, 10).map((heroStat: any, index: number) => {
    const heroMatches = matches.filter(m => m.hero.id === heroStat.hero.id).slice(0, 25);
    const avgFirstCoreMin = Math.round(heroMatches.reduce((sum, m) => sum + (12 + (m.gpm > 600 ? 0 : 4)), 0) / Math.max(1, heroMatches.length));

    return {
      id: `build-${heroStat.hero.id}`,
      hero: heroStat.hero,
      role: heroMatches[0]?.role || 'Carry',
      lane: heroMatches[0]?.lane || 'Mid',
      winrate: heroStat.winrate,
      popularity: Math.min(96, 40 + heroStat.matches * 4),
      patch: heroMatches[0]?.patch || '7.38',
      startingItems: ALL_ITEM_POOL.slice(0, 3),
      coreItems: ALL_ITEM_POOL.slice((index % 6), (index % 6) + 4),
      situationalItems: ALL_ITEM_POOL.slice((index % 8), (index % 8) + 4),
      lategameItems: ALL_ITEM_POOL.slice((index % 7), (index % 7) + 4),
      talents: ['+20 Attack Speed', '+250 Health', '+10% Spell Amplification', '+1.5s Disable Duration'],
      skillBuild: [
        { level: 1, skill: 'Primary Nuke' },
        { level: 2, skill: 'Mobility/Setup' },
        { level: 3, skill: 'Primary Nuke' },
        { level: 4, skill: 'Utility' },
      ],
      why: `Основано на последних матчах и таймингах для ${heroStat.hero.name}.`,
      tips: [`Core до ${avgFirstCoreMin} минуты`, 'Смещение в objectives после 20 минуты', 'Адаптация utility слота под контроль'],
      analysis: {
        whyThisBuild: `Рекомендация учла ${heroMatches.length} ваших матчей на герое.`,
        playerErrors: ['Поздний utility слот в части матчей.'],
        strengths: ['Стабильный фарм и участие в драках.'],
        improvements: ['Синхронизировать BKB с power spike.'],
        timingErrors: [`Core: текущий тайминг ${avgFirstCoreMin} мин.`],
      },
      aspects: [{ name: 'Tempo', description: 'Ускоряет темп игры', recommended: true, effect: '+tempo' }],
    };
  });
};

const deriveAnalytics = (matches: any[], heroStats: any[]) => {
  const winrateDaily = matches.slice(0, 20).map((m, idx) => ({ day: `#${idx + 1}`, winrate: m.result === 'win' ? 100 : 0, wins: m.result === 'win' ? 1 : 0, losses: m.result === 'loss' ? 1 : 0 }));
  const winrateWeekly = [
    { week: 'W-3', winrate: 0, matches: 0 },
    { week: 'W-2', winrate: 0, matches: 0 },
    { week: 'W-1', winrate: 0, matches: 0 },
    { week: 'Current', winrate: Number(((matches.filter(m => m.result === 'win').length / Math.max(1, matches.length)) * 100).toFixed(1)), matches: matches.length },
  ];
  const gpmTrend = matches.slice(0, 15).map((m, idx) => ({ game: idx + 1, gpm: m.gpm }));
  const kdaTrend = matches.slice(0, 15).map((m, idx) => ({ game: idx + 1, kda: Number(m.kdaRatio.toFixed(2)) }));
  const roleStats = [{ role: 'Carry', matches: 0, winrate: 0, color: '#22C55E' }];
  const sideStats = [{ name: 'Radiant', value: 0, color: '#22C55E' }, { name: 'Dire', value: 0, color: '#EF4444' }];
  const heroWinrateChart = heroStats.slice(0, 8).map((h: any) => ({ name: h.hero.short, winrate: h.winrate, matches: h.matches, color: h.hero.color }));
  return { winrateDaily, winrateWeekly, gpmTrend, kdaTrend, roleStats, sideStats, heroWinrateChart };
};

const withSystemNotification = (snapshot: RuntimeDataSnapshot, message: string, type: 'sync' | 'warning' | 'system' = 'sync') => {
  snapshot.notifications.unshift({
    id: `n_${Date.now()}`,
    type,
    title: type === 'sync' ? 'Синхронизация завершена' : 'Системное сообщение',
    message,
    time: new Date().toISOString(),
    read: false,
  });
};

const backendRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = authService.getSession()?.accessToken;
  if (!token) throw new Error('Нужна авторизация');

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${BACKEND_API_BASE}${path}`, { ...init, headers });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(payload?.error || `Backend ${response.status}`);
  return payload as T;
};

const hydrateFromBackend = async (snapshot: RuntimeDataSnapshot): Promise<RuntimeDataSnapshot> => {
  const [profileRes, steamRes, matchesRes, analyticsRes, notificationsRes, goalsRes, devicesRes] = await Promise.all([
    backendRequest<any>('/profile'),
    backendRequest<any>('/steam/accounts'),
    backendRequest<any>('/matches?limit=80&period=90d'),
    backendRequest<any>('/analytics/summary?period=90d'),
    backendRequest<any>('/notifications'),
    backendRequest<any>('/goals'),
    backendRequest<any>('/devices'),
  ]);

  const matches = (matchesRes?.matches || []).map((m: any, idx: number) => toMatchFromBackend(m, idx));
  const heroStats = computeHeroStats(matches);
  const builds = buildRecommendations(matches, heroStats);

  const accounts = (steamRes?.accounts || []).map((a: any) => ({
    id: a.steam_id64 || a.id,
    name: a.display_name || 'Steam User',
    steamId: a.vanity_name || a.steam_id64 || a.id,
    steamUrl: a.profile_url,
    rank: 'Unknown',
    rankTier: 0,
    mmr: 0,
    winrate: 0,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    lastSync: a.last_sync_at || new Date().toISOString(),
    active: Boolean(a.is_active),
    country: 'N/A',
  }));

  const active = accounts.find((a: any) => a.active) || accounts[0];
  const summary = analyticsRes?.summary || {};
  const profile = profileRes?.profile || {};

  return {
    ...snapshot,
    player: {
      ...snapshot.player,
      id: String(profile.id || snapshot.player.id),
      name: profile.display_name || profile.username || snapshot.player.name,
      steamId: active?.steamId || snapshot.player.steamId,
      steamUrl: active?.steamUrl || snapshot.player.steamUrl,
      wins: Number(summary.wins || 0),
      losses: Number(summary.losses || 0),
      totalMatches: Number(summary.matches || 0),
      winrate: Number(summary.matches ? ((Number(summary.wins || 0) * 100) / Number(summary.matches || 1)).toFixed(1) : 0),
      avgKDA: Number(summary.avg_kda || 0),
      avgGPM: Number(summary.avg_gpm || 0),
      avgXPM: Number(summary.avg_xpm || 0),
      lastSync: new Date().toISOString(),
      lastMatch: matches[0]?.date || snapshot.player.lastMatch,
    } as any,
    steamAccounts: accounts as any,
    matches: matches as any,
    heroStats: heroStats as any,
    builds: builds as any,
    analytics: {
      ...snapshot.analytics,
      winrateDaily: (analyticsRes?.trend || []).map((t: any) => ({ day: t.day, winrate: Number(t.winrate || 0), wins: 0, losses: 0 })),
      gpmTrend: (analyticsRes?.trend || []).slice(-20).map((t: any, idx: number) => ({ game: idx + 1, gpm: Number(t.avg_gpm || 0) })),
      kdaTrend: (analyticsRes?.trend || []).slice(-20).map((t: any, idx: number) => ({ game: idx + 1, kda: Number(t.avg_kda || 0) })),
      roleStats: (analyticsRes?.roles || []).map((r: any) => ({ role: r.role, matches: Number(r.matches || 0), winrate: Number(r.winrate || 0), color: '#94A3B8' })),
      sideStats: (analyticsRes?.side || []).map((s: any) => ({ name: s.side, value: Number(s.winrate || 0), color: s.side === 'radiant' ? '#22C55E' : '#EF4444' })),
      heroWinrateChart: heroStats.slice(0, 10).map((h: any) => ({ name: h.hero.short, winrate: h.winrate, matches: h.matches, color: h.hero.color })),
    } as any,
    notifications: (notificationsRes?.notifications || []).map((n: any) => ({
      id: n.id,
      type: n.type || 'system',
      title: n.title || 'Уведомление',
      message: n.message || '',
      time: n.created_at || new Date().toISOString(),
      read: Boolean(n.is_read),
    })) as any,
    goals: (goalsRes?.goals || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.metric || '',
      target: Number(g.target_value || 0),
      current: Number(g.current_value || 0),
      unit: '',
      type: 'matches',
      deadline: g.period_end || undefined,
      completed: g.status === 'completed',
      streak: Number(g.streak || 0),
    })) as any,
    devices: (devicesRes?.devices || []).map((d: any) => ({
      id: d.id,
      name: d.device_name || 'Device',
      platform: d.platform || 'web',
      lastLogin: d.last_seen_at || d.created_at,
      current: Boolean(d.is_current),
      location: d.ip_address || '',
    })) as any,
  };
};

export const dataSyncService = {
  async bindSteamProfile(url: string) {
    if (appEnv.useProductionBackend) {
      const payload = await backendRequest<any>('/steam/bind', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      if (payload?.account?.id) {
        await backendRequest(`/steam/accounts/${payload.account.id}/activate`, { method: 'POST' });
      }
      return {
        accountId: payload?.account?.id || undefined,
        profileUrl: payload?.account?.profile_url || url,
        vanityName: payload?.account?.vanity_name || undefined,
        steamId64: payload?.account?.steam_id64 || undefined,
        displayName: payload?.account?.display_name || undefined,
        avatar: payload?.account?.avatar_url || undefined,
      };
    }
    return resolveSteamProfile(url);
  },

  async syncBySteamId(snapshot: RuntimeDataSnapshot, steamId64: string): Promise<{ snapshot: RuntimeDataSnapshot; result: SyncResult }> {
    const startedAt = new Date().toISOString();

    if (appEnv.useProductionBackend) {
      try {
        await backendRequest('/sync', { method: 'POST', body: JSON.stringify({}) });
        const next = await hydrateFromBackend(snapshot);
        return {
          snapshot: next,
          result: {
            status: 'success',
            startedAt,
            completedAt: new Date().toISOString(),
            message: 'Синхронизация через backend завершена.',
            fetchedMatches: next.matches.length,
          },
        };
      } catch (error: any) {
        const next = { ...snapshot, notifications: [...snapshot.notifications], syncHistory: [...snapshot.syncHistory] };
        withSystemNotification(next, `OpenDota/backend недоступна: ${error?.message || 'unknown error'}`, 'warning');
        next.syncHistory.unshift({
          id: `s_${Date.now()}`,
          date: new Date().toISOString(),
          status: 'error',
          matches: 0,
          duration: 'failed',
          error: error?.message || 'sync_failed',
        } as any);
        return {
          snapshot: next,
          result: {
            status: 'error',
            startedAt,
            completedAt: new Date().toISOString(),
            message: 'Синхронизация через backend не удалась.',
          },
        };
      }
    }

    if (!appEnv.enableLiveOpenDota) {
      return {
        snapshot,
        result: {
          status: 'success',
          startedAt,
          completedAt: new Date().toISOString(),
          message: 'Live OpenDota disabled. Использованы локальные данные.',
          fetchedMatches: snapshot.matches.length,
        },
      };
    }

    try {
      if (!steamId64 || steamId64.startsWith('tmp_')) {
        throw new Error('Steam аккаунт не готов к синхронизации. Перепривяжите профиль.');
      }
      const accountId32 = steamId64.length > 10 ? accountId32From64(steamId64) : Number(steamId64);
      if (!Number.isFinite(accountId32) || accountId32 <= 0) {
        throw new Error('Некорректный account_id для OpenDota');
      }
      const [player, wl, recentMatches] = await Promise.all([
        openDotaClient.getPlayer(accountId32),
        openDotaClient.getPlayerWl(accountId32),
        openDotaClient.getRecentMatches(accountId32, 40),
      ]);

      const matches = recentMatches.map(toMatch);
      const wins = wl.win;
      const losses = wl.lose;
      const total = wins + losses;
      const winrate = Number(((wins / Math.max(1, total)) * 100).toFixed(1));

      const heroStats = computeHeroStats(matches);
      const builds = buildRecommendations(matches, heroStats);
      const analytics = deriveAnalytics(matches, heroStats);

      const next = getDefaultSnapshot();
      next.matches = matches as any;
      next.heroStats = heroStats as any;
      next.builds = builds as any;
      next.analytics = analytics as any;
      next.player = {
        ...next.player,
        id: steamId64,
        steamId: player.profile?.account_id ? String(player.profile.account_id) : next.player.steamId,
        steamUrl: player.profile?.profileurl || next.player.steamUrl,
        name: player.profile?.personaname || next.player.name,
        wins,
        losses,
        totalMatches: total,
        winrate,
        rankTier: player.rank_tier || next.player.rankTier,
        mmr: player.mmr_estimate?.estimate || next.player.mmr,
        lastSync: new Date().toISOString(),
        lastMatch: matches[0]?.date || next.player.lastMatch,
        avgKDA: Number((matches.reduce((sum, m) => sum + m.kdaRatio, 0) / Math.max(1, matches.length)).toFixed(2)),
        avgGPM: Math.round(matches.reduce((sum, m) => sum + m.gpm, 0) / Math.max(1, matches.length)),
        avgXPM: Math.round(matches.reduce((sum, m) => sum + m.xpm, 0) / Math.max(1, matches.length)),
      } as any;

      withSystemNotification(next, `Загружено ${matches.length} матчей из OpenDota для ${next.player.name}.`);
      next.syncHistory.unshift({ id: `s_${Date.now()}`, date: new Date().toISOString(), status: 'success', matches: matches.length, duration: 'network' } as any);

      return {
        snapshot: next,
        result: {
          status: 'success',
          startedAt,
          completedAt: new Date().toISOString(),
          message: 'Данные синхронизированы с OpenDota.',
          fetchedMatches: matches.length,
        },
      };
    } catch (error: any) {
      const next = { ...snapshot, notifications: [...snapshot.notifications], syncHistory: [...snapshot.syncHistory] };
      const reason = error?.message || 'unknown error';
      const humanReason = reason.includes('network error') ? 'нет сети или API временно недоступно' : reason.includes('timeout') ? 'таймаут ответа OpenDota' : reason;
      withSystemNotification(next, `OpenDota недоступна: ${humanReason}`, 'warning');
      next.syncHistory.unshift({ id: `s_${Date.now()}`, date: new Date().toISOString(), status: 'error', matches: 0, duration: 'failed', error: error?.message || 'sync_failed' } as any);

      return {
        snapshot: next,
        result: {
          status: 'error',
          startedAt,
          completedAt: new Date().toISOString(),
          message: 'Синхронизация не удалась, использованы локальные данные.',
        },
      };
    }
  },

  exportBundle(snapshot: RuntimeDataSnapshot) {
    const summary = {
      player: snapshot.player,
      totals: {
        matches: snapshot.matches.length,
        goals: snapshot.goals.length,
        notifications: snapshot.notifications.length,
      },
    };

    const toCsv = (rows: Array<Record<string, any>>) => {
      if (!rows.length) return '';
      const headers = Object.keys(rows[0]);
      const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
      return [headers.join(','), ...body].join('\n');
    };

    return {
      summary: JSON.stringify(summary, null, 2),
      matchesCsv: toCsv(snapshot.matches.slice(0, 100).map((m: any) => ({
        id: m.id,
        hero: m.hero.name,
        result: m.result,
        k: m.kills,
        d: m.deaths,
        a: m.assists,
        gpm: m.gpm,
        xpm: m.xpm,
        date: m.date,
      }))),
      analyticsCsv: toCsv(snapshot.heroStats.map((h: any) => ({
        hero: h.hero.name,
        matches: h.matches,
        winrate: h.winrate,
        avgKDA: h.avgKDA,
        avgGPM: h.avgGPM,
      }))),
      buildsCsv: toCsv(snapshot.builds.map((b: any) => ({
        id: b.id,
        hero: b.hero.name,
        role: b.role,
        winrate: b.winrate,
        patch: b.patch,
      }))),
      generatedAt: new Date().toISOString(),
    };
  },
};

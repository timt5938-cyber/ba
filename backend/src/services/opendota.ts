import { config } from '../config.js';

type RequestOptions = {
  retries?: number;
  timeoutMs?: number;
};

export class OpenDotaHttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `OpenDota error ${status}`);
    this.name = 'OpenDotaHttpError';
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  const timeoutMs = options.timeoutMs ?? 12000;

  const url = new URL(path, config.openDotaBaseUrl.endsWith('/') ? config.openDotaBaseUrl : `${config.openDotaBaseUrl}/`);
  if (config.openDotaApiKey) {
    url.searchParams.set('api_key', config.openDotaApiKey);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        if ((response.status === 400 || response.status === 401) && config.openDotaApiKey) {
          const fallbackUrl = new URL(path, config.openDotaBaseUrl.endsWith('/') ? config.openDotaBaseUrl : `${config.openDotaBaseUrl}/`);
          const fallbackResponse = await fetch(fallbackUrl, { signal: controller.signal });
          if (!fallbackResponse.ok) throw new OpenDotaHttpError(fallbackResponse.status);
          return await fallbackResponse.json() as T;
        }
        throw new OpenDotaHttpError(response.status);
      }
      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep((attempt + 1) * 600);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('OpenDota request failed');
}

export type OpenDotaRecentMatch = {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  version: number | null;
  kills: number;
  deaths: number;
  assists: number;
  skill: number | null;
  lane: number | null;
  lane_role: number | null;
  is_roaming: boolean;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage: number;
  tower_damage: number;
  region: number | null;
};

export type OpenDotaPlayer = {
  profile?: {
    account_id?: number;
    personaname?: string;
    profileurl?: string;
    avatarfull?: string;
  };
  rank_tier?: number;
  mmr_estimate?: {
    estimate?: number;
  };
};

export const openDotaService = {
  getPlayer(accountId: number) {
    return requestJson<OpenDotaPlayer>(`players/${accountId}`);
  },
  getPlayerWl(accountId: number) {
    return requestJson<{ win: number; lose: number }>(`players/${accountId}/wl`);
  },
  getRecentMatches(accountId: number, limit = 40) {
    return requestJson<OpenDotaRecentMatch[]>(`players/${accountId}/recentMatches?limit=${limit}`);
  },
  getMatch(matchId: number) {
    return requestJson<any>(`matches/${matchId}`);
  },
  getHeroStats() {
    return requestJson<any[]>('heroStats');
  },
  getConstants(name: string) {
    return requestJson<any>(`constants/${name}`);
  },
  getLivePatchInfo() {
    return requestJson<any[]>('constants/patch');
  },
};

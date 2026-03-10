import { appEnv } from './env';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Query = Record<string, string | number | undefined | null>;

export interface OpenDotaRecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  duration: number;
  game_mode: number;
  lobby_type: number;
  start_time: number;
  version: number | null;
  average_rank?: number;
  xp_per_min?: number;
  gold_per_min?: number;
  hero_damage?: number;
  tower_damage?: number;
  leaver_status?: number;
  lane_role?: number;
  region?: number;
}

export interface OpenDotaPlayerSummary {
  profile?: {
    account_id?: number;
    personaname?: string;
    avatarfull?: string;
    profileurl?: string;
  };
  rank_tier?: number;
  mmr_estimate?: { estimate?: number };
  leaderboard_rank?: number;
}

export interface OpenDotaWl {
  win: number;
  lose: number;
}

export interface OpenDotaHeroStats {
  id: number;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

class OpenDotaClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = appEnv.openDotaBaseUrl;
    this.apiKey = appEnv.openDotaApiKey;
  }

  private async request<T>(path: string, query: Query = {}, attempt = 0, withApiKey = true): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
    if (withApiKey && this.apiKey) {
      url.searchParams.set('api_key', this.apiKey);
    }

    const res = await fetch(url.toString());
    if (res.status === 429 && attempt < 3) {
      await wait((attempt + 1) * 600);
      return this.request<T>(path, query, attempt + 1, withApiKey);
    }
    if ((res.status === 400 || res.status === 401) && withApiKey && this.apiKey) {
      return this.request<T>(path, query, attempt, false);
    }
    if (!res.ok) {
      throw new Error(`OpenDota ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  getPlayer(accountId64Or32: string | number) {
    return this.request<OpenDotaPlayerSummary>(`/players/${accountId64Or32}`);
  }

  getPlayerWl(accountId64Or32: string | number) {
    return this.request<OpenDotaWl>(`/players/${accountId64Or32}/wl`);
  }

  getRecentMatches(accountId64Or32: string | number, limit = 40) {
    return this.request<OpenDotaRecentMatch[]>(`/players/${accountId64Or32}/recentMatches`, { limit });
  }

  getMatch(matchId: string | number) {
    return this.request<any>(`/matches/${matchId}`);
  }

  getHeroStats() {
    return this.request<OpenDotaHeroStats[]>('/heroStats');
  }

  getConstants(resource: string) {
    return this.request<Record<string, any>>(`/constants/${resource}`);
  }
}

export const openDotaClient = new OpenDotaClient();


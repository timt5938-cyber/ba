import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId, parsePeriodDays } from '../lib/common.js';
import { openDotaService } from '../services/opendota.js';

export const comparisonRoutes: FastifyPluginAsync = async (app) => {
  app.get('/comparison/player/:accountId', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const accountId = z.coerce.number().parse((request.params as any).accountId);

    const [player, wl, recent] = await Promise.all([
      openDotaService.getPlayer(accountId),
      openDotaService.getPlayerWl(accountId),
      openDotaService.getRecentMatches(accountId, 40),
    ]);

    const avgKDA = recent.length
      ? Number((recent.reduce((sum, m) => sum + ((m.kills + m.assists) / Math.max(1, m.deaths)), 0) / recent.length).toFixed(2))
      : 0;
    const avgGPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.gold_per_min || 0), 0) / recent.length) : 0;
    const avgXPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.xp_per_min || 0), 0) / recent.length) : 0;

    const right = {
      accountId,
      name: player.profile?.personaname || `Player ${accountId}`,
      steamUrl: player.profile?.profileurl || null,
      wins: wl.win,
      losses: wl.lose,
      totalMatches: wl.win + wl.lose,
      winrate: wl.win + wl.lose ? Number(((wl.win * 100) / (wl.win + wl.lose)).toFixed(2)) : 0,
      avgKDA,
      avgGPM,
      avgXPM,
      rankTier: player.rank_tier || null,
      mmrEstimate: player.mmr_estimate?.estimate || null,
    };

    await db.query(
      'insert into comparisons(user_id, left_scope, right_scope, result) values($1,$2,$3,$4)',
      [
        userId,
        JSON.stringify({ type: 'active-user' }),
        JSON.stringify({ type: 'opendota-player', accountId }),
        JSON.stringify(right),
      ],
    );

    return { comparison: right };
  });

  app.get('/comparison/period', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const period = String((request.query as any)?.period || '30d');
    const days = parsePeriodDays(period);

    const current = await db.query(
      `select
         count(*)::int as matches,
         count(*) filter (where result = 'win')::int as wins,
         round(coalesce(avg(kda),0)::numeric, 2) as avg_kda
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval`,
      [userId, days],
    );

    const previous = await db.query(
      `select
         count(*)::int as matches,
         count(*) filter (where result = 'win')::int as wins,
         round(coalesce(avg(kda),0)::numeric, 2) as avg_kda
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - (($2::int * 2)::text || ' days')::interval
         and dm.start_time <  now() - ($2::text || ' days')::interval`,
      [userId, days],
    );

    const c = current.rows[0] || { matches: 0, wins: 0, avg_kda: 0 };
    const p = previous.rows[0] || { matches: 0, wins: 0, avg_kda: 0 };

    const cWr = Number(c.matches ? ((c.wins * 100) / c.matches).toFixed(2) : 0);
    const pWr = Number(p.matches ? ((p.wins * 100) / p.matches).toFixed(2) : 0);

    return {
      current: { ...c, winrate: cWr },
      previous: { ...p, winrate: pWr },
      delta: {
        matches: Number(c.matches || 0) - Number(p.matches || 0),
        winrate: cWr - pWr,
        avg_kda: Number(c.avg_kda || 0) - Number(p.avg_kda || 0),
      },
    };
  });
};

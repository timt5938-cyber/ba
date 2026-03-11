import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId, parsePeriodDays } from '../lib/common.js';

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/analytics/summary', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const period = String((request.query as any)?.period || '30d');
    const days = parsePeriodDays(period);

    const base = await db.query(
      `select
         count(*)::int as matches,
         count(*) filter (where result = 'win')::int as wins,
         count(*) filter (where result = 'loss')::int as losses,
         round(coalesce(avg(kda),0)::numeric, 2) as avg_kda,
         round(coalesce(avg(gpm),0)::numeric, 0) as avg_gpm,
         round(coalesce(avg(xpm),0)::numeric, 0) as avg_xpm
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval`,
      [userId, days],
    );

    const byHero = await db.query(
      `select hero_id, count(*)::int as matches,
              count(*) filter (where result = 'win')::int as wins,
              round((count(*) filter (where result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate,
              round(coalesce(avg(kda),0)::numeric, 2) as avg_kda
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by hero_id
       order by matches desc
       limit 12`,
      [userId, days],
    );

    const byRole = await db.query(
      `select coalesce(role, 'Unknown') as role,
              count(*)::int as matches,
              round((count(*) filter (where result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by role
       order by matches desc`,
      [userId, days],
    );

    const byLane = await db.query(
      `select coalesce(lane, 'Unknown') as lane,
              count(*)::int as matches,
              round((count(*) filter (where result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by lane
       order by matches desc`,
      [userId, days],
    );

    const side = await db.query(
      `select
          sum(case when player_slot < 128 and result = 'win' then 1 else 0 end)::int as radiant_wins,
          sum(case when player_slot < 128 then 1 else 0 end)::int as radiant_total,
          sum(case when player_slot >= 128 and result = 'win' then 1 else 0 end)::int as dire_wins,
          sum(case when player_slot >= 128 then 1 else 0 end)::int as dire_total
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval`,
      [userId, days],
    );

    const byMode = await db.query(
      `select dm.game_mode, count(*)::int as matches,
              round((count(*) filter (where pm.result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by dm.game_mode
       order by matches desc`,
      [userId, days],
    );

    const byRegion = await db.query(
      `select dm.region, count(*)::int as matches,
              round((count(*) filter (where pm.result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by dm.region
       order by matches desc`,
      [userId, days],
    );

    const trend = await db.query(
      `select to_char(dm.start_time, 'YYYY-MM-DD') as day,
              count(*)::int as matches,
              round((count(*) filter (where pm.result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate,
              round(coalesce(avg(pm.kda),0)::numeric, 2) as avg_kda,
              round(coalesce(avg(pm.gpm),0)::numeric, 0) as avg_gpm,
              round(coalesce(avg(pm.xpm),0)::numeric, 0) as avg_xpm
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - ($2::text || ' days')::interval
       group by to_char(dm.start_time, 'YYYY-MM-DD')
       order by day asc`,
      [userId, days],
    );

    const s = side.rows[0] || { radiant_wins: 0, radiant_total: 0, dire_wins: 0, dire_total: 0 };
    const sideStats = [
      {
        side: 'radiant',
        matches: Number(s.radiant_total || 0),
        winrate: Number(s.radiant_total ? ((s.radiant_wins * 100) / s.radiant_total).toFixed(2) : 0),
      },
      {
        side: 'dire',
        matches: Number(s.dire_total || 0),
        winrate: Number(s.dire_total ? ((s.dire_wins * 100) / s.dire_total).toFixed(2) : 0),
      },
    ];

    return {
      period,
      summary: base.rows[0],
      heroes: byHero.rows,
      roles: byRole.rows,
      lanes: byLane.rows,
      side: sideStats,
      modes: byMode.rows,
      regions: byRegion.rows,
      trend: trend.rows,
    };
  });
};

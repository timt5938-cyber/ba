import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

export const accountRoutes: FastifyPluginAsync = async (app) => {
  app.get('/account/summary', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);

    const latestSnapshot = await db.query(
      'select * from player_snapshots where user_id = $1 order by snapshot_at desc limit 1',
      [userId],
    );

    const heroPool = await db.query(
      `select hero_id, count(*)::int as matches,
              count(*) filter (where result = 'win')::int as wins,
              round((count(*) filter (where result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate
       from player_matches
       where user_id = $1
       group by hero_id
       order by matches desc
       limit 15`,
      [userId],
    );

    const regions = await db.query(
      `select dm.region, count(*)::int as matches
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
       group by dm.region
       order by matches desc`,
      [userId],
    );

    const modes = await db.query(
      `select dm.game_mode, count(*)::int as matches
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
       group by dm.game_mode
       order by matches desc`,
      [userId],
    );

    const activity = await db.query(
      `select to_char(dm.start_time, 'YYYY-MM-DD') as day,
              to_char(dm.start_time, 'Dy') as weekday,
              count(*)::int as matches
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
         and dm.start_time >= now() - interval '90 days'
       group by to_char(dm.start_time, 'YYYY-MM-DD'), to_char(dm.start_time, 'Dy')
       order by day asc`,
      [userId],
    );

    return {
      snapshot: latestSnapshot.rows[0] || null,
      heroPool: heroPool.rows,
      regions: regions.rows,
      modes: modes.rows,
      activity: activity.rows,
    };
  });

  app.delete('/account', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    await db.query('update users set deleted_at = now(), is_active = false where id = $1', [userId]);
    return { ok: true };
  });
};

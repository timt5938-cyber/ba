import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId, parsePeriodDays } from '../lib/common.js';

export const matchRoutes: FastifyPluginAsync = async (app) => {
  app.get('/matches', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const q = z.object({
      limit: z.coerce.number().min(1).max(200).default(50),
      period: z.string().optional(),
      heroId: z.coerce.number().optional(),
      result: z.enum(['win', 'loss']).optional(),
      search: z.string().optional(),
    }).parse(request.query || {});

    const days = parsePeriodDays(q.period);
    const params: any[] = [userId, days, q.limit];
    let where = `pm.user_id = $1 and dm.start_time >= now() - ($2::text || ' days')::interval`;

    if (q.heroId) {
      params.push(q.heroId);
      where += ` and pm.hero_id = $${params.length}`;
    }
    if (q.result) {
      params.push(q.result);
      where += ` and pm.result = $${params.length}`;
    }

    const rows = await db.query(
      `select pm.match_id, pm.hero_id, pm.result, pm.kills, pm.deaths, pm.assists, pm.kda, pm.gpm, pm.xpm,
              pm.lane, pm.role, dm.start_time, dm.duration_seconds, dm.patch, dm.game_mode, dm.region
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where ${where}
       order by dm.start_time desc
       limit $3`,
      params,
    );

    const filtered = q.search
      ? rows.rows.filter((r: any) => String(r.hero_id).includes(q.search!))
      : rows.rows;

    return { matches: filtered };
  });

  app.get('/matches/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = z.coerce.number().parse((request.params as any).id);

    const details = await db.query(
      `select pm.*, dm.start_time, dm.duration_seconds, dm.radiant_win, dm.patch, dm.game_mode, dm.region, dm.payload
       from player_matches pm
       join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1 and pm.match_id = $2
       limit 1`,
      [userId, id],
    );

    if (!details.rowCount) return reply.code(404).send({ error: 'Match not found' });

    return { match: details.rows[0] };
  });
};

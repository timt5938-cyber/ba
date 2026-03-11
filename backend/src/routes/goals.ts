import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

const goalCreateSchema = z.object({
  metric: z.string().min(2),
  title: z.string().min(2),
  target_value: z.number(),
  current_value: z.number().default(0),
  streak: z.number().int().default(0),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const goalPatchSchema = goalCreateSchema.partial().extend({
  status: z.enum(['active', 'completed', 'failed']).optional(),
});

export const goalRoutes: FastifyPluginAsync = async (app) => {
  app.get('/goals', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const result = await db.query(
      'select * from goals where user_id = $1 order by created_at desc',
      [userId],
    );
    return { goals: result.rows };
  });

  app.post('/goals', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const body = goalCreateSchema.parse(request.body);

    const status = body.current_value >= body.target_value ? 'completed' : 'active';
    const achievedAt = status === 'completed' ? new Date().toISOString() : null;

    const result = await db.query(
      `insert into goals(user_id, metric, title, target_value, current_value, streak, status, period_start, period_end, achieved_at, metadata)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       returning *`,
      [
        userId,
        body.metric,
        body.title,
        body.target_value,
        body.current_value,
        body.streak,
        status,
        body.period_start || null,
        body.period_end || null,
        achievedAt,
        JSON.stringify(body.metadata || {}),
      ],
    );

    return { goal: result.rows[0] };
  });

  app.patch('/goals/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);
    const patch = goalPatchSchema.parse(request.body);

    const current = await db.query('select * from goals where id = $1 and user_id = $2 limit 1', [id, userId]);
    if (!current.rowCount) return reply.code(404).send({ error: 'Goal not found' });

    const next = { ...current.rows[0], ...patch };
    if (Number(next.current_value) >= Number(next.target_value)) {
      next.status = 'completed';
      next.achieved_at = next.achieved_at || new Date().toISOString();
    }

    const updated = await db.query(
      `update goals
       set metric = $1,
           title = $2,
           target_value = $3,
           current_value = $4,
           streak = $5,
           status = $6,
           period_start = $7,
           period_end = $8,
           achieved_at = $9,
           metadata = $10,
           updated_at = now()
       where id = $11 and user_id = $12
       returning *`,
      [
        next.metric,
        next.title,
        next.target_value,
        next.current_value,
        next.streak,
        next.status,
        next.period_start,
        next.period_end,
        next.achieved_at,
        JSON.stringify(next.metadata || {}),
        id,
        userId,
      ],
    );

    return { goal: updated.rows[0] };
  });

  app.delete('/goals/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);
    const result = await db.query('delete from goals where id = $1 and user_id = $2 returning id', [id, userId]);
    if (!result.rowCount) return reply.code(404).send({ error: 'Goal not found' });
    return { ok: true };
  });
};

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getUserId } from '../lib/common.js';
import { syncService } from '../services/sync.js';
import { db } from '../db.js';

const syncSchema = z.object({ steamAccountId: z.string().uuid().optional() });

export const syncRoutes: FastifyPluginAsync = async (app) => {
  app.post('/sync', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const body = syncSchema.parse(request.body ?? {});

    let steamAccountId = body.steamAccountId;
    if (!steamAccountId) {
      const rows = await db.query('select id from steam_accounts where user_id = $1 and is_active = true limit 1', [userId]);
      steamAccountId = rows.rows[0]?.id;
    }

    if (!steamAccountId) return reply.code(400).send({ error: 'No active steam account' });

    const result = await syncService.syncSteamAccount(userId, steamAccountId);
    if (result.status === 'error') return reply.code(502).send(result);
    return result;
  });
};

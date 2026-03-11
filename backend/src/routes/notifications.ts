import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/notifications', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const unreadOnly = String((request.query as any)?.unreadOnly || 'false') === 'true';

    const rows = await db.query(
      `select id, type, title, message, payload, is_read, created_at, read_at
       from notifications
       where user_id = $1 ${unreadOnly ? 'and is_read = false' : ''}
       order by created_at desc
       limit 200`,
      [userId],
    );

    return { notifications: rows.rows };
  });

  app.post('/notifications/:id/read', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);

    const result = await db.query(
      'update notifications set is_read = true, read_at = now() where id = $1 and user_id = $2 returning id',
      [id, userId],
    );
    if (!result.rowCount) return reply.code(404).send({ error: 'Notification not found' });
    return { ok: true };
  });

  app.post('/notifications/read-all', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    await db.query('update notifications set is_read = true, read_at = now() where user_id = $1 and is_read = false', [userId]);
    return { ok: true };
  });
};

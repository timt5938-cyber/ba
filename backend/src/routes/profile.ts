import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

const profilePatchSchema = z.object({
  display_name: z.string().min(2).max(64).optional(),
  locale: z.string().min(2).max(8).optional(),
  theme: z.enum(['bw', 'red', 'green']).optional(),
});

const settingsPatchSchema = z.object({
  language: z.string().min(2).max(8).optional(),
  theme: z.enum(['bw', 'red', 'green']).optional(),
  sync_frequency: z.string().min(2).max(32).optional(),
  notification_prefs: z.record(z.any()).optional(),
  security_prefs: z.record(z.any()).optional(),
});

export const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get('/profile', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const user = await db.query(
      'select id, email, username, display_name, locale, theme, created_at, updated_at from users where id = $1 limit 1',
      [userId],
    );
    const settings = await db.query(
      'select language, theme, sync_frequency, notification_prefs, security_prefs, updated_at from user_settings where user_id = $1',
      [userId],
    );

    return {
      profile: user.rows[0] || null,
      settings: settings.rows[0] || null,
    };
  });

  app.patch('/profile', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const patch = profilePatchSchema.parse(request.body);

    if (!Object.keys(patch).length) return reply.code(400).send({ error: 'Nothing to update' });

    const columns: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [k, v] of Object.entries(patch)) {
      columns.push(`${k} = $${idx++}`);
      values.push(v);
    }
    values.push(userId);

    const updated = await db.query(
      `update users set ${columns.join(', ')}, updated_at = now() where id = $${idx} returning id, email, username, display_name, locale, theme, updated_at`,
      values,
    );

    return { profile: updated.rows[0] };
  });

  app.get('/settings', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    await db.query('insert into user_settings(user_id) values($1) on conflict(user_id) do nothing', [userId]);
    const result = await db.query(
      'select user_id, language, theme, sync_frequency, notification_prefs, security_prefs, updated_at from user_settings where user_id = $1',
      [userId],
    );
    return { settings: result.rows[0] };
  });

  app.patch('/settings', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const patch = settingsPatchSchema.parse(request.body);

    await db.query('insert into user_settings(user_id) values($1) on conflict(user_id) do nothing', [userId]);

    const columns: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [k, v] of Object.entries(patch)) {
      columns.push(`${k} = $${idx++}`);
      values.push(k.endsWith('_prefs') ? JSON.stringify(v) : v);
    }
    values.push(userId);

    if (columns.length) {
      await db.query(
        `update user_settings set ${columns.join(', ')}, updated_at = now() where user_id = $${idx}`,
        values,
      );
    }

    const result = await db.query('select * from user_settings where user_id = $1', [userId]);
    return { settings: result.rows[0] };
  });
};

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';
import { resolveSteamProfile } from '../utils/steam.js';

const bindSchema = z.object({
  url: z.string().url(),
});

export const steamRoutes: FastifyPluginAsync = async (app) => {
  app.get('/steam/accounts', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const rows = await db.query(
      'select id, steam_id64, vanity_name, profile_url, display_name, avatar_url, is_active, linked_at, last_sync_at, metadata from steam_accounts where user_id = $1 order by linked_at desc',
      [userId],
    );
    return { accounts: rows.rows };
  });

  app.post('/steam/bind', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const body = bindSchema.parse(request.body);

    const profile = await resolveSteamProfile(body.url);
    if (!profile.steamId64 || !/^\d{17}$/.test(profile.steamId64)) {
      return reply.code(422).send({ error: 'Не удалось получить корректный steam_id64. Проверьте публичность профиля.' });
    }

    const existing = await db.query(
      'select id from steam_accounts where user_id = $1 and profile_url = $2 limit 1',
      [userId, profile.profileUrl],
    );
    if (existing.rowCount) return reply.code(409).send({ error: 'Steam account already linked' });

    const acc = await db.query(
      `insert into steam_accounts(user_id, steam_id64, vanity_name, profile_url, display_name, avatar_url, is_active, metadata)
       values($1,$2,$3,$4,$5,$6,$7,$8)
       returning id, steam_id64, vanity_name, profile_url, display_name, avatar_url, is_active, linked_at, last_sync_at, metadata`,
      [
        userId,
        profile.steamId64,
        profile.vanityName || null,
        profile.profileUrl,
        profile.displayName || profile.vanityName || profile.steamId64 || 'Steam User',
        profile.avatar || null,
        false,
        JSON.stringify({ source: 'steam_xml' }),
      ],
    );

    return { account: acc.rows[0] };
  });

  app.post('/steam/accounts/:id/activate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);

    const exists = await db.query('select id from steam_accounts where id = $1 and user_id = $2 limit 1', [id, userId]);
    if (!exists.rowCount) return reply.code(404).send({ error: 'Steam account not found' });

    await db.query('update steam_accounts set is_active = false where user_id = $1', [userId]);
    await db.query('update steam_accounts set is_active = true where id = $1 and user_id = $2', [id, userId]);

    return { ok: true, activeAccountId: id };
  });

  app.delete('/steam/accounts/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);
    const result = await db.query('delete from steam_accounts where id = $1 and user_id = $2 returning id', [id, userId]);
    if (!result.rowCount) return reply.code(404).send({ error: 'Steam account not found' });
    return { ok: true };
  });
};

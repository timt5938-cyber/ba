import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

const fingerprintFromRequest = (request: any): string => {
  const ua = String(request.headers['user-agent'] || 'unknown');
  const forwarded = String(request.headers['x-forwarded-for'] || request.ip || '0.0.0.0');
  return `${ua}|${forwarded}`.slice(0, 180);
};

export const deviceRoutes: FastifyPluginAsync = async (app) => {
  app.get('/devices', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const fingerprint = fingerprintFromRequest(request);

    await db.query(
      `insert into user_devices(user_id, device_fingerprint, device_name, platform, os_version, app_version, ip_address, user_agent, is_current)
       values($1,$2,$3,$4,$5,$6,$7,$8,true)
       on conflict(user_id, device_fingerprint)
       do update set last_seen_at = now(),
                     is_current = true,
                     revoked_at = null,
                     updated_at = now()`,
      [
        userId,
        fingerprint,
        String(request.headers['x-device-name'] || 'Unknown Device'),
        String(request.headers['x-device-platform'] || 'web'),
        String(request.headers['x-device-os'] || ''),
        String(request.headers['x-app-version'] || ''),
        request.ip,
        String(request.headers['user-agent'] || ''),
      ],
    );

    const devices = await db.query(
      `select id, device_name, platform, os_version, app_version, ip_address::text as ip_address,
              user_agent, last_seen_at, is_current, revoked_at, created_at
       from user_devices
       where user_id = $1 and revoked_at is null
       order by is_current desc, last_seen_at desc`,
      [userId],
    );

    return { devices: devices.rows };
  });

  app.delete('/devices/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request);
    const id = String((request.params as any).id);

    const result = await db.query(
      'update user_devices set revoked_at = now(), is_current = false, updated_at = now() where id = $1 and user_id = $2 and revoked_at is null returning id',
      [id, userId],
    );
    if (!result.rowCount) return reply.code(404).send({ error: 'Device not found' });
    return { ok: true };
  });

  app.post('/devices/logout-all', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const fingerprint = fingerprintFromRequest(request);

    await db.query(
      'update user_devices set revoked_at = now(), is_current = false, updated_at = now() where user_id = $1 and device_fingerprint <> $2 and revoked_at is null',
      [userId, fingerprint],
    );

    await db.query(
      'insert into notifications(user_id, type, title, message) values($1, $2, $3, $4)',
      [userId, 'system', 'Устройства обновлены', 'Выполнен выход со всех остальных устройств'],
    );

    return { ok: true };
  });
};

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { openDotaService } from '../services/opendota.js';

export const opendotaRoutes: FastifyPluginAsync = async (app) => {
  app.get('/opendota/patch', async () => {
    const cacheKey = 'constants:patch';
    const cached = await db.query(
      'select payload from opendota_raw_cache where cache_key = $1 and (expires_at is null or expires_at > now()) limit 1',
      [cacheKey],
    );
    if (cached.rowCount) return { patches: cached.rows[0].payload, cached: true };

    const patches = await openDotaService.getLivePatchInfo();
    await db.query(
      `insert into opendota_raw_cache(cache_key, endpoint, payload, expires_at)
       values($1, $2, $3, now() + interval '6 hours')
       on conflict(cache_key)
       do update set payload = excluded.payload, fetched_at = now(), expires_at = excluded.expires_at`,
      [cacheKey, 'constants/patch', JSON.stringify(patches)],
    );

    return { patches, cached: false };
  });

  app.get('/opendota/constants/:name', async (request) => {
    const name = z.string().min(1).parse((request.params as any).name);
    const cacheKey = `constants:${name}`;

    const cached = await db.query(
      'select payload from opendota_raw_cache where cache_key = $1 and (expires_at is null or expires_at > now()) limit 1',
      [cacheKey],
    );
    if (cached.rowCount) return { data: cached.rows[0].payload, cached: true };

    const data = await openDotaService.getConstants(name);
    await db.query(
      `insert into opendota_raw_cache(cache_key, endpoint, payload, expires_at)
       values($1, $2, $3, now() + interval '24 hours')
       on conflict(cache_key)
       do update set payload = excluded.payload, fetched_at = now(), expires_at = excluded.expires_at`,
      [cacheKey, `constants/${name}`, JSON.stringify(data)],
    );

    return { data, cached: false };
  });
};

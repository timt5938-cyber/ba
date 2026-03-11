import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

const exportSchema = z.object({
  type: z.enum(['summary', 'matches', 'analytics', 'builds']).default('summary'),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  options: z.record(z.any()).optional(),
});

const csvEscape = (value: unknown): string => {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const exportRoutes: FastifyPluginAsync = async (app) => {
  app.get('/exports', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const jobs = await db.query('select * from export_jobs where user_id = $1 order by created_at desc limit 100', [userId]);
    return { jobs: jobs.rows };
  });

  app.post('/exports', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);
    const body = exportSchema.parse(request.body);

    const inserted = await db.query(
      'insert into export_jobs(user_id, type, format, status, options) values($1,$2,$3,$4,$5) returning *',
      [userId, body.type, body.format, 'processing', JSON.stringify(body.options || {})],
    );
    const job = inserted.rows[0];

    const matches = await db.query(
      `select pm.match_id, pm.hero_id, pm.result, pm.kills, pm.deaths, pm.assists, pm.gpm, pm.xpm, dm.start_time
       from player_matches pm
       left join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
       order by pm.match_id desc
       limit 300`,
      [userId],
    );

    let payload: string;
    if (body.format === 'csv') {
      const headers = ['match_id', 'hero_id', 'result', 'kills', 'deaths', 'assists', 'gpm', 'xpm', 'start_time'];
      const rows = [headers.join(',')];
      for (const row of matches.rows) {
        rows.push(headers.map((h) => csvEscape((row as any)[h])).join(','));
      }
      payload = rows.join('\n');
    } else {
      payload = JSON.stringify({
        generatedAt: new Date().toISOString(),
        type: body.type,
        format: body.format,
        rows: matches.rows,
      }, null, 2);
    }

    await db.query(
      'update export_jobs set status = $1, file_url = $2, finished_at = now() where id = $3',
      ['completed', `inline:${Buffer.from(payload).toString('base64')}`, job.id],
    );

    return {
      jobId: job.id,
      status: 'completed',
      content: payload,
      contentType: body.format === 'csv' ? 'text/csv' : 'application/json',
    };
  });
};

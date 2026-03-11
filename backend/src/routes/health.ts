import { FastifyPluginAsync } from 'fastify';
import { healthCheckDb } from '../db.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ status: 'ok', service: 'dota-scope-api', ts: new Date().toISOString() }));
  app.get('/ready', async (_request, reply) => {
    try {
      const dbOk = await healthCheckDb();
      if (!dbOk) return reply.code(503).send({ status: 'degraded', db: false });
      return { status: 'ok', db: true };
    } catch {
      return reply.code(503).send({ status: 'degraded', db: false });
    }
  });
};

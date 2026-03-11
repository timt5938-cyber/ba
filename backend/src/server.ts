import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { db } from './db.js';
import { registerErrorHandler } from './plugins/error.js';
import { authPlugin } from './plugins/auth.js';

import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profile.js';
import { deviceRoutes } from './routes/devices.js';
import { notificationRoutes } from './routes/notifications.js';
import { goalRoutes } from './routes/goals.js';
import { exportRoutes } from './routes/exports.js';
import { steamRoutes } from './routes/steam.js';
import { syncRoutes } from './routes/sync.js';
import { matchRoutes } from './routes/matches.js';
import { analyticsRoutes } from './routes/analytics.js';
import { buildRoutes } from './routes/builds.js';
import { comparisonRoutes } from './routes/comparison.js';
import { accountRoutes } from './routes/account.js';
import { opendotaRoutes } from './routes/opendota.js';

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);
  await app.register(jwt, { secret: config.jwtAccessSecret });
  await app.register(authPlugin);

  registerErrorHandler(app);

  app.addHook('onRequest', async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'request');
  });

  app.get('/api/ping', async () => ({ ok: true }));

  await app.register(async (api) => {
    await api.register(healthRoutes);
    await api.register(opendotaRoutes);

    await api.register(authRoutes, { prefix: '/auth' });
    await api.register(profileRoutes);
    await api.register(deviceRoutes);
    await api.register(notificationRoutes);
    await api.register(goalRoutes);
    await api.register(exportRoutes);
    await api.register(steamRoutes);
    await api.register(syncRoutes);
    await api.register(matchRoutes);
    await api.register(analyticsRoutes);
    await api.register(buildRoutes);
    await api.register(comparisonRoutes);
    await api.register(accountRoutes);
  }, { prefix: '/api' });

  app.addHook('onClose', async () => {
    await db.end();
  });

  return app;
}

const app = await buildServer();
try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(`Dota Scope API listening on :${config.port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

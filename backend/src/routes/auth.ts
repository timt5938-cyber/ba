import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../db.js';

const registerSchema = z.object({
  identity: z.string().min(3),
  password: z.string().min(6),
  username: z.string().min(2).optional(),
});

const loginSchema = z.object({
  identity: z.string().min(3),
  password: z.string().min(6),
});

const forgotSchema = z.object({ identity: z.string().min(3) });
const resetSchema = z.object({ identity: z.string().min(3), code: z.string().min(4), newPassword: z.string().min(6) });

const tokenHash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const payload = registerSchema.parse(request.body);
    const identity = payload.identity.trim().toLowerCase();
    const email = identity.includes('@') ? identity : null;
    const username = payload.username?.trim() || (email ? email.split('@')[0] : identity);

    const exists = await db.query(
      'select id from users where lower(email) = $1 or lower(username) = $2 limit 1',
      [identity, username.toLowerCase()],
    );
    if (exists.rowCount) return reply.code(409).send({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const inserted = await db.query(
      'insert into users(email, username, password_hash, display_name) values($1,$2,$3,$4) returning id, email, username, display_name, created_at',
      [email, username, passwordHash, username],
    );

    await db.query(
      'insert into user_settings(user_id) values($1) on conflict(user_id) do nothing',
      [inserted.rows[0].id],
    );

    const user = inserted.rows[0];
    const accessToken = app.jwt.sign({ sub: user.id, username: user.username }, { expiresIn: '1h' });
    const refreshToken = app.jwt.sign(
      { sub: user.id, type: 'refresh', nonce: crypto.randomUUID() },
      { expiresIn: '30d' },
    );

    await db.query(
      "insert into auth_refresh_tokens(user_id, token_hash, expires_at) values($1,$2, now() + interval '30 days')",
      [user.id, tokenHash(refreshToken)],
    );

    return { user, accessToken, refreshToken };
  });

  app.post('/login', async (request, reply) => {
    const payload = loginSchema.parse(request.body);
    const identity = payload.identity.trim().toLowerCase();

    const result = await db.query(
      'select id, email, username, display_name, password_hash, created_at from users where lower(email) = $1 or lower(username) = $1 limit 1',
      [identity],
    );
    if (!result.rowCount) return reply.code(401).send({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const ok = await bcrypt.compare(payload.password, user.password_hash);
    if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });

    const accessToken = app.jwt.sign({ sub: user.id, username: user.username }, { expiresIn: '1h' });
    const refreshToken = app.jwt.sign(
      { sub: user.id, type: 'refresh', nonce: crypto.randomUUID() },
      { expiresIn: '30d' },
    );

    await db.query(
      "insert into auth_refresh_tokens(user_id, token_hash, expires_at) values($1,$2, now() + interval '30 days')",
      [user.id, tokenHash(refreshToken)],
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = String((request.user as any)?.sub || '');
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    const result = await db.query(
      'select id, email, username, display_name, locale, theme, created_at from users where id = $1 limit 1',
      [userId],
    );
    if (!result.rowCount) return reply.code(404).send({ error: 'User not found' });
    return { user: result.rows[0] };
  });

  app.post('/refresh', async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(request.body);

    let decoded: any;
    try {
      decoded = app.jwt.verify(body.refreshToken);
    } catch {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }

    const tokenExists = await db.query(
      'select id from auth_refresh_tokens where user_id = $1 and token_hash = $2 and revoked_at is null and expires_at > now() limit 1',
      [decoded.sub, tokenHash(body.refreshToken)],
    );
    if (!tokenExists.rowCount) return reply.code(401).send({ error: 'Refresh token revoked' });

    const accessToken = app.jwt.sign({ sub: decoded.sub }, { expiresIn: '1h' });
    return { accessToken };
  });

  app.post('/logout', async (request) => {
    const body = z.object({ refreshToken: z.string().optional() }).parse(request.body ?? {});
    if (body.refreshToken) {
      await db.query(
        'update auth_refresh_tokens set revoked_at = now() where token_hash = $1 and revoked_at is null',
        [tokenHash(body.refreshToken)],
      );
    }
    return { ok: true };
  });

  app.post('/forgot-password', async (request, reply) => {
    const body = forgotSchema.parse(request.body);
    const identity = body.identity.trim().toLowerCase();

    const userResult = await db.query(
      'select id from users where lower(email) = $1 or lower(username) = $1 limit 1',
      [identity],
    );
    if (!userResult.rowCount) return reply.code(404).send({ error: 'User not found' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.query(
      "insert into password_reset_codes(user_id, identity, code_hash, expires_at) values($1,$2,$3, now() + interval '10 minutes')",
      [userResult.rows[0].id, identity, tokenHash(code)],
    );

    return { ok: true, code };
  });

  app.post('/reset-password', async (request, reply) => {
    const body = resetSchema.parse(request.body);
    const identity = body.identity.trim().toLowerCase();

    const codeResult = await db.query(
      'select user_id from password_reset_codes where identity = $1 and code_hash = $2 and consumed_at is null and expires_at > now() order by created_at desc limit 1',
      [identity, tokenHash(body.code)],
    );
    if (!codeResult.rowCount) return reply.code(400).send({ error: 'Invalid or expired code' });

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await db.query('update users set password_hash = $1 where id = $2', [passwordHash, codeResult.rows[0].user_id]);
    await db.query('update password_reset_codes set consumed_at = now() where identity = $1 and consumed_at is null', [identity]);

    return { ok: true };
  });
};

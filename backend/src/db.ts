import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function healthCheckDb(): Promise<boolean> {
  const client = await db.connect();
  try {
    await client.query('select 1');
    return true;
  } finally {
    client.release();
  }
}

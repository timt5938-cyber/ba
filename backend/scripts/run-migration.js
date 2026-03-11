import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), 'migrations', '001_init.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');
// Strip UTF-8 BOM / UTF-16 mojibake markers and CRLF edge cases.
sql = sql.replace(/^\uFEFF/, '').replace(/\r/g, '');
if (sql.charCodeAt(0) === 65533) {
  throw new Error(`Migration file appears to have invalid encoding: ${sqlPath}. Save as UTF-8.`);
}

const client = new Client({ connectionString: databaseUrl });

async function run() {
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Migration applied:', sqlPath);
}

run().catch(async (error) => {
  console.error(error);
  try { await client.end(); } catch {}
  process.exit(1);
});

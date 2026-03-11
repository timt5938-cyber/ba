import dotenv from 'dotenv';

dotenv.config();

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 8080),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
  openDotaBaseUrl: process.env.OPENDOTA_BASE_URL ?? 'https://api.opendota.com/api',
  openDotaApiKey: process.env.OPENDOTA_API_KEY ?? '',
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

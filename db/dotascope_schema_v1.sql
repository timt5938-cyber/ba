-- Dota Scope PostgreSQL schema v1
-- Safe to re-run (uses IF NOT EXISTS where possible)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'ru',
  theme TEXT NOT NULL DEFAULT 'bw',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT users_identity_check CHECK (email IS NOT NULL OR username IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'ru',
  theme TEXT NOT NULL DEFAULT 'bw',
  sync_frequency TEXT NOT NULL DEFAULT '6h',
  notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  security_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  platform TEXT,
  os_version TEXT,
  app_version TEXT,
  ip_address INET,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

CREATE TABLE IF NOT EXISTS steam_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_id64 TEXT,
  vanity_name TEXT,
  profile_url TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, profile_url)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_steam_accounts_steam_id64_unique
  ON steam_accounts(steam_id64)
  WHERE steam_id64 IS NOT NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  achieved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sync_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_account_id UUID REFERENCES steam_accounts(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'opendota',
  status TEXT NOT NULL,
  matches_fetched INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS dota_matches (
  match_id BIGINT PRIMARY KEY,
  start_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  radiant_win BOOLEAN,
  patch TEXT,
  game_mode INTEGER,
  region INTEGER,
  cluster INTEGER,
  leagueid BIGINT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_matches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_account_id UUID NOT NULL REFERENCES steam_accounts(id) ON DELETE CASCADE,
  match_id BIGINT NOT NULL REFERENCES dota_matches(match_id) ON DELETE CASCADE,
  player_slot INTEGER,
  hero_id INTEGER,
  result TEXT,
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  kda NUMERIC(8,2),
  gpm INTEGER,
  xpm INTEGER,
  net_worth INTEGER,
  lane TEXT,
  role TEXT,
  hero_damage INTEGER,
  tower_damage INTEGER,
  hero_healing INTEGER,
  last_hits INTEGER,
  denies INTEGER,
  rank_tier INTEGER,
  item_ids INTEGER[] NOT NULL DEFAULT '{}',
  backpack_item_ids INTEGER[] NOT NULL DEFAULT '{}',
  neutral_item_id INTEGER,
  parsed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(steam_account_id, match_id)
);

CREATE TABLE IF NOT EXISTS player_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_account_id UUID NOT NULL REFERENCES steam_accounts(id) ON DELETE CASCADE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_matches INTEGER,
  wins INTEGER,
  losses INTEGER,
  winrate NUMERIC(6,2),
  avg_kda NUMERIC(8,2),
  avg_gpm INTEGER,
  avg_xpm INTEGER,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS build_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_account_id UUID NOT NULL REFERENCES steam_accounts(id) ON DELETE CASCADE,
  hero_id INTEGER NOT NULL,
  role TEXT,
  lane TEXT,
  patch TEXT,
  confidence NUMERIC(5,2),
  summary TEXT,
  recommendation JSONB NOT NULL,
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  left_scope JSONB NOT NULL,
  right_scope JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opendota_raw_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS app_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON auth_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_codes_user ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_steam_accounts_user ON steam_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_created ON export_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_history_user_started ON sync_history(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_matches_user_match ON player_matches(user_id, match_id DESC);
CREATE INDEX IF NOT EXISTS idx_player_matches_steam_match ON player_matches(steam_account_id, match_id DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_time ON player_snapshots(user_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_builds_user_hero ON build_recommendations(user_id, hero_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cache_endpoint ON opendota_raw_cache(endpoint, fetched_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_devices_updated_at') THEN
    CREATE TRIGGER trg_user_devices_updated_at BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_settings_updated_at') THEN
    CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_goals_updated_at') THEN
    CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_matches_updated_at') THEN
    CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON dota_matches
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

COMMIT;

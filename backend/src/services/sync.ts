import { db } from '../db.js';
import { OpenDotaHttpError, openDotaService } from './opendota.js';
import { steamId64ToAccountId } from '../utils/steam.js';

type SyncResult = {
  status: 'success' | 'error';
  fetchedMatches: number;
  message: string;
};

const computeRole = (gpm: number, assists: number): string => {
  if (gpm >= 620) return 'Carry';
  if (gpm >= 520) return 'Midlaner';
  if (gpm >= 420) return 'Offlaner';
  if (assists > 12) return 'Pos 4';
  return 'Pos 5';
};

const computeLane = (laneRole?: number | null): string => {
  if (laneRole === 1) return 'Safe';
  if (laneRole === 2) return 'Mid';
  if (laneRole === 3) return 'Off';
  return 'Unknown';
};

const toKda = (kills: number, deaths: number, assists: number): number => {
  return Number(((kills + assists) / Math.max(1, deaths)).toFixed(2));
};

export const syncService = {
  async syncSteamAccount(userId: string, steamAccountId: string): Promise<SyncResult> {
    const startedAt = Date.now();
    const accResult = await db.query(
      'select id, steam_id64, profile_url from steam_accounts where id = $1 and user_id = $2 limit 1',
      [steamAccountId, userId],
    );
    if (!accResult.rowCount) {
      return { status: 'error', fetchedMatches: 0, message: 'Steam account not found' };
    }

    const steamAcc = accResult.rows[0];
    if (!steamAcc.steam_id64) {
      return { status: 'error', fetchedMatches: 0, message: 'Steam account has no steam_id64' };
    }

    let accountId: number;
    try {
      accountId = steamId64ToAccountId(String(steamAcc.steam_id64));
    } catch {
      return { status: 'error', fetchedMatches: 0, message: 'Некорректный steam_id64 для синхронизации' };
    }

    try {
      const [player, wl, recentMatches] = await Promise.all([
        openDotaService.getPlayer(accountId),
        openDotaService.getPlayerWl(accountId),
        openDotaService.getRecentMatches(accountId, 50),
      ]);

      for (const m of recentMatches) {
        await db.query(
          `insert into dota_matches(match_id, start_time, duration_seconds, radiant_win, patch, game_mode, region, payload)
           values($1, to_timestamp($2), $3, $4, $5, $6, $7, $8)
           on conflict(match_id)
           do update set start_time = excluded.start_time,
                         duration_seconds = excluded.duration_seconds,
                         radiant_win = excluded.radiant_win,
                         patch = excluded.patch,
                         game_mode = excluded.game_mode,
                         region = excluded.region,
                         payload = excluded.payload`,
          [
            m.match_id,
            m.start_time,
            m.duration,
            m.radiant_win,
            m.version ? `7.${m.version}` : '7.38',
            m.game_mode,
            m.region,
            JSON.stringify(m),
          ],
        );

        const isRadiant = m.player_slot < 128;
        const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);

        await db.query(
          `insert into player_matches(
             user_id, steam_account_id, match_id, player_slot, hero_id, result, kills, deaths, assists,
             kda, gpm, xpm, net_worth, lane, role, hero_damage, tower_damage, last_hits, denies,
             rank_tier, item_ids, backpack_item_ids, neutral_item_id, parsed_at
           )
           values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23, now())
           on conflict(steam_account_id, match_id)
           do update set player_slot = excluded.player_slot,
                         hero_id = excluded.hero_id,
                         result = excluded.result,
                         kills = excluded.kills,
                         deaths = excluded.deaths,
                         assists = excluded.assists,
                         kda = excluded.kda,
                         gpm = excluded.gpm,
                         xpm = excluded.xpm,
                         net_worth = excluded.net_worth,
                         lane = excluded.lane,
                         role = excluded.role,
                         hero_damage = excluded.hero_damage,
                         tower_damage = excluded.tower_damage,
                         last_hits = excluded.last_hits,
                         denies = excluded.denies,
                         rank_tier = excluded.rank_tier,
                         parsed_at = now()`,
          [
            userId,
            steamAccountId,
            m.match_id,
            m.player_slot,
            m.hero_id,
            won ? 'win' : 'loss',
            m.kills,
            m.deaths,
            m.assists,
            toKda(m.kills, m.deaths, m.assists),
            m.gold_per_min,
            m.xp_per_min,
            Math.round((m.gold_per_min || 0) * (m.duration / 60)),
            computeLane(m.lane_role),
            computeRole(m.gold_per_min || 0, m.assists || 0),
            m.hero_damage,
            m.tower_damage,
            null,
            null,
            player.rank_tier || null,
            [],
            [],
            null,
          ],
        );
      }

      const totalMatches = wl.win + wl.lose;
      const winrate = totalMatches > 0 ? Number(((wl.win / totalMatches) * 100).toFixed(2)) : 0;
      const avgResult = await db.query(
        `select
           coalesce(avg(kda), 0) as avg_kda,
           coalesce(avg(gpm), 0) as avg_gpm,
           coalesce(avg(xpm), 0) as avg_xpm
         from player_matches
         where user_id = $1 and steam_account_id = $2`,
        [userId, steamAccountId],
      );

      await db.query(
        `insert into player_snapshots(user_id, steam_account_id, total_matches, wins, losses, winrate, avg_kda, avg_gpm, avg_xpm, payload)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          userId,
          steamAccountId,
          totalMatches,
          wl.win,
          wl.lose,
          winrate,
          Number(avgResult.rows[0].avg_kda),
          Math.round(Number(avgResult.rows[0].avg_gpm)),
          Math.round(Number(avgResult.rows[0].avg_xpm)),
          JSON.stringify({
            personaname: player.profile?.personaname,
            mmr: player.mmr_estimate?.estimate,
          }),
        ],
      );

      await db.query(
        `update steam_accounts
         set display_name = coalesce($1, display_name),
             avatar_url = coalesce($2, avatar_url),
             last_sync_at = now(),
             metadata = coalesce(metadata, '{}'::jsonb) || $3::jsonb
         where id = $4`,
        [
          player.profile?.personaname || null,
          player.profile?.avatarfull || null,
          JSON.stringify({
            rank_tier: player.rank_tier || null,
            mmr_estimate: player.mmr_estimate?.estimate || null,
            wins: wl.win,
            losses: wl.lose,
            winrate,
          }),
          steamAccountId,
        ],
      );

      await db.query(
        `insert into sync_history(user_id, steam_account_id, source, status, matches_fetched, started_at, finished_at, duration_ms)
         values($1,$2,'opendota','success',$3,to_timestamp($4),now(),$5)`,
        [userId, steamAccountId, recentMatches.length, startedAt / 1000, Date.now() - startedAt],
      );

      await db.query(
        `insert into notifications(user_id, type, title, message, payload)
         values($1, 'sync', 'Синхронизация завершена', $2, $3)`,
        [
          userId,
          `Загружено ${recentMatches.length} матчей из OpenDota`,
          JSON.stringify({ steamAccountId, fetched: recentMatches.length }),
        ],
      );

      return {
        status: 'success',
        fetchedMatches: recentMatches.length,
        message: 'Sync completed',
      };
    } catch (error: any) {
      const userMessage =
        error instanceof OpenDotaHttpError && error.status === 404
          ? 'Профиль не найден в OpenDota. Проверьте привязанный Steam-аккаунт.'
          : error?.message || 'Sync failed';

      await db.query(
        `insert into sync_history(user_id, steam_account_id, source, status, matches_fetched, started_at, finished_at, duration_ms, error_message)
         values($1,$2,'opendota','error',0,to_timestamp($3),now(),$4,$5)`,
        [userId, steamAccountId, startedAt / 1000, Date.now() - startedAt, userMessage],
      );

      const duplicateWarning = await db.query(
        `select id
         from notifications
         where user_id = $1
           and type = 'warning'
           and title = 'OpenDota недоступна'
           and message = $2
           and created_at > now() - interval '10 minutes'
         limit 1`,
        [userId, userMessage],
      );

      if (!duplicateWarning.rowCount) {
        await db.query(
          `insert into notifications(user_id, type, title, message, payload)
           values($1, 'warning', 'OpenDota недоступна', $2, $3)`,
          [
            userId,
            userMessage,
            JSON.stringify({ steamAccountId }),
          ],
        );
      }

      return {
        status: 'error',
        fetchedMatches: 0,
        message: userMessage,
      };
    }
  },
};

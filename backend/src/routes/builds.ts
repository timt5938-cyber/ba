import { FastifyPluginAsync } from 'fastify';
import { db } from '../db.js';
import { getUserId } from '../lib/common.js';

const buildFromHero = (heroId: number, role: string, lane: string, patch: string, winrate: number, matches: number, avgGpm: number) => {
  const summary = `Hero ${heroId}: ${matches} матчей, WR ${winrate.toFixed(1)}%, avg GPM ${Math.round(avgGpm)}.`;
  const early = avgGpm >= 600 ? 'Сильный ранний фарм, ускоряй core слот.' : 'Темп проседает, приоритезируй дешёвые power spikes.';
  const risk = avgGpm < 450 ? 'Риск: поздний тайминг BKB/utility.' : 'Риск: перефарм и поздние ротации.';

  return {
    summary,
    role,
    lane,
    patch,
    recommendedItemProgression: [
      'Starting: branches + tango + stats',
      avgGpm >= 550 ? 'Core-1 до 12-14 мин' : 'Core-1 до 15-18 мин',
      'Core-2 после первой командной драки',
      'Utility слот под вражеский контроль',
    ],
    startingItems: ['tango', 'branches', 'stick'],
    coreItems: ['power_treads', 'bkb', 'blink'],
    situationalItems: ['force_staff', 'lotus_orb', 'linken_sphere'],
    lateItems: ['aghanims_scepter', 'satanic'],
    skillBuild: ['1-3-1-2', 'max nuke first', 'ultimate at 6/12/18'],
    talents: {
      10: 'левый талант на темп',
      15: 'по матчапу',
      20: 'на урон в командной драке',
      25: 'на выживаемость',
    },
    facets: [{ name: 'Tempo', recommended: true, why: 'под ваш текущий стиль игры' }],
    whatWentWell: ['Стабильный фарм', 'Контроль темпа на 10-20 минуте'],
    whatShouldImprove: ['Тайминг BKB', 'Ранние ротации на objectives'],
    whyThisRecommendationFits: 'Рекомендация построена на ваших последних матчах и средних таймингах.',
    timingAdvice: ['Core-1: 12-15 мин', 'BKB/utility: 18-24 мин'],
    riskNotes: [risk],
    matchupNotes: ['Против heavy disable — utility слот раньше core-3.'],
  };
};

export const buildRoutes: FastifyPluginAsync = async (app) => {
  app.get('/builds', { preHandler: [app.authenticate] }, async (request) => {
    const userId = getUserId(request);

    const rows = await db.query(
      `select hero_id,
              coalesce(role, 'Unknown') as role,
              coalesce(lane, 'Unknown') as lane,
              coalesce(max(dm.patch), '7.38') as patch,
              count(*)::int as matches,
              count(*) filter (where pm.result = 'win')::int as wins,
              round((count(*) filter (where pm.result = 'win')::numeric * 100) / greatest(count(*),1), 2) as winrate,
              coalesce(avg(pm.gpm), 0) as avg_gpm
       from player_matches pm
       left join dota_matches dm on dm.match_id = pm.match_id
       where pm.user_id = $1
       group by hero_id, role, lane
       order by matches desc
       limit 20`,
      [userId],
    );

    const recommendations = rows.rows.map((r: any) => ({
      hero_id: r.hero_id,
      matches: r.matches,
      winrate: Number(r.winrate),
      recommendation: buildFromHero(Number(r.hero_id), String(r.role), String(r.lane), String(r.patch), Number(r.winrate), Number(r.matches), Number(r.avg_gpm || 0)),
    }));

    for (const rec of recommendations.slice(0, 10)) {
      await db.query(
        `insert into build_recommendations(user_id, steam_account_id, hero_id, role, lane, patch, confidence, summary, recommendation, explanation)
         values($1,
                coalesce((select id from steam_accounts where user_id = $1 and is_active = true limit 1), (select id from steam_accounts where user_id = $1 limit 1)),
                $2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          userId,
          rec.hero_id,
          rec.recommendation.role,
          rec.recommendation.lane,
          rec.recommendation.patch,
          Math.min(95, Math.max(55, rec.winrate)),
          rec.recommendation.summary,
          JSON.stringify(rec.recommendation),
          JSON.stringify({ source: 'rule-based-v1' }),
        ],
      );
    }

    return { builds: recommendations };
  });
};

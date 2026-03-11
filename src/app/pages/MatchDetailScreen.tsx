import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Zap, Shield, Heart, Swords, TrendingUp, GitCompareArrows } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { HeroIcon } from '../components/ui/HeroIcon';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';
import { formatDuration, formatTime, Match } from '../data/mockData';
import { safeBack } from '../core/navigation';
import { openDotaClient } from '../core/opendotaClient';
import { HEROES } from '../data/mockData';

const GOLD_TIMELINE = [
  { min: 0, gold: 0 }, { min: 5, gold: 3200 }, { min: 10, gold: 7400 }, { min: 15, gold: 12800 },
  { min: 20, gold: 18200 }, { min: 25, gold: 23600 }, { min: 30, gold: 28400 }, { min: 35, gold: 32800 },
  { min: 40, gold: 36200 }, { min: 42, gold: 38400 },
];

export default function MatchDetailScreen() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { accentColor, runtimeSnapshot } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'teams'>('overview');
  const [matchPlayers, setMatchPlayers] = useState<Array<{ accountId: number; heroId: number; personaname?: string }>>([]);

  const matches = runtimeSnapshot.matches as Match[];
  const match = matches.find(m => m.id === matchId) ?? matches[0];
  const heroByCdn = useMemo(() => Object.values(HEROES).reduce<Record<string, any>>((acc, h: any) => {
    acc[h.cdnName] = h;
    return acc;
  }, {}), []);
  const heroIdToCdn: Record<number, string> = {
    1: 'antimage', 2: 'axe', 5: 'crystal_maiden', 8: 'juggernaut', 11: 'nevermore', 14: 'pudge', 16: 'sand_king',
    18: 'sven', 22: 'zeus', 25: 'lina', 27: 'shadow_shaman', 37: 'warlock', 39: 'queenofpain', 47: 'viper',
    63: 'weaver', 74: 'invoker', 86: 'rubick', 97: 'magnataur', 102: 'abaddon', 106: 'ember_spirit', 107: 'earth_spirit',
    113: 'arc_warden', 126: 'void_spirit',
  };
  const resolveHero = (heroId: number) => {
    const cdn = heroIdToCdn[heroId];
    if (cdn && heroByCdn[cdn]) return heroByCdn[cdn];
    return { id: `h-${heroId}`, name: `Hero #${heroId}`, short: `H${heroId}`, attr: 'uni', color: '#94A3B8', roles: ['Unknown'], cdnName: cdn || 'unknown' };
  };

  const alliesEnemies = useMemo(() => {
    const sameSide = matches.filter(m => m.side === match?.side).slice(0, 4);
    const otherSide = matches.filter(m => m.side !== match?.side).slice(0, 5);
    return {
      allies: sameSide.map(m => ({ hero: m.hero, k: m.kills, d: m.deaths, a: m.assists, gpm: m.gpm })),
      enemies: otherSide.map(m => ({ hero: m.hero, k: m.kills, d: m.deaths, a: m.assists, gpm: m.gpm })),
    };
  }, [match?.side, matches]);

  if (!match) {
    return <div className="p-6 text-white">Матч не найден</div>;
  }

  React.useEffect(() => {
    let mounted = true;
    const loadPlayers = async () => {
      try {
        const details = await openDotaClient.getMatch(match.id);
        const players = (details?.players || [])
          .filter((p: any) => typeof p.account_id === 'number' && p.account_id > 0)
          .map((p: any) => ({ accountId: p.account_id, heroId: p.hero_id, personaname: p.personaname }));
        if (mounted) setMatchPlayers(players);
      } catch {
        if (mounted) setMatchPlayers([]);
      }
    };
    loadPlayers();
    return () => { mounted = false; };
  }, [match.id]);

  const isWin = match.result === 'win';
  const resultColor = isWin ? '#4ADE80' : '#F87171';

  const TABS = [
    { id: 'overview', label: 'Обзор' },
    { id: 'timeline', label: 'Тайм-лайн' },
    { id: 'teams', label: 'Команды' },
  ] as const;

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30" style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}>
        <button onClick={() => safeBack(navigate, '/app/games')} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
        </button>
        <div>
          <p className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>Детали матча</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>#{match.id}</p>
        </div>
        <div className="ml-auto"><Badge variant={isWin ? 'win' : 'loss'}>{isWin ? '✓ Победа' : '✗ Поражение'}</Badge></div>
      </div>

      <div className="px-4 py-4" style={{ background: `linear-gradient(180deg, ${match.hero.color}12, transparent)` }}>
        <div className="flex items-center gap-4">
          <HeroIcon hero={match.hero} size={64} />
          <div className="flex-1">
            <h2 className="text-white" style={{ fontSize: 22, fontWeight: 700 }}>{match.hero.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="neutral">{match.role}</Badge>
              <Badge variant="neutral">{match.lane}</Badge>
              <Badge variant={match.side === 'radiant' ? 'win' : 'loss'}>{match.side === 'radiant' ? '🟢 Radiant' : '🔴 Dire'}</Badge>
              <Badge variant="neutral">📅 Патч {match.patch}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${resultColor}15`, border: `2px solid ${resultColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: resultColor }}>{match.performance}</span>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Score</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ label: 'Kills', value: match.kills, color: '#FFFFFF' }, { label: 'Deaths', value: match.deaths, color: '#F87171' }, { label: 'Assists', value: match.assists, color: '#94A3B8' }].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />}
              <div className="text-center"><p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</p></div>
            </React.Fragment>
          ))}
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
          <div className="text-center"><p style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B' }}>{match.kdaRatio.toFixed(1)}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>KDA</p></div>
        </div>

        <div className="flex justify-between mt-2 px-1">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>⏱ {formatDuration(match.duration)}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{match.gameMode}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatTime(match.date)}</span>
        </div>
      </div>

      <div className="flex px-4 gap-1 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-4 py-2.5" style={{ fontSize: 13, fontWeight: 600, color: activeTab === t.id ? accentColor : 'rgba(255,255,255,0.4)', borderBottom: `2px solid ${activeTab === t.id ? accentColor : 'transparent'}`, marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      <div className="px-4 pb-24">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Net Worth', value: `${(match.netWorth / 1000).toFixed(1)}k`, icon: <Zap size={14} color="#F59E0B" /> }, { label: 'GPM / XPM', value: `${match.gpm} / ${match.xpm}`, icon: <TrendingUp size={14} color="#4ADE80" /> }, { label: 'Урон герою', value: `${(match.heroDamage / 1000).toFixed(1)}k`, icon: <Swords size={14} color="#EF4444" /> }, { label: 'Last Hits', value: `${match.lastHits} / ${match.denies}`, icon: <Shield size={14} color="#60A5FA" /> }, { label: 'Урон башням', value: `${(match.towerDamage / 1000).toFixed(1)}k`, icon: <Swords size={14} color="#F97316" /> }, { label: 'Лечение', value: `${(match.healing / 1000).toFixed(1)}k`, icon: <Heart size={14} color="#EC4899" /> }].map(s => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-1">{s.icon}<p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</p></div>
                  <p className="text-white" style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Net Worth по времени</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={GOLD_TIMELINE}>
                  <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="min" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={v => `${v}m`} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} labelFormatter={v => `${v} мин`} formatter={(v: number) => [`${(v / 1000).toFixed(1)}k`, 'Gold']} />
                  <Area type="monotone" dataKey="gold" stroke="#F59E0B" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="flex flex-col gap-4">
            {matchPlayers.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Игроки из этой катки</p>
                </div>
                {matchPlayers.slice(0, 10).map((p, idx) => (
                  <div key={`${p.accountId}-${idx}`} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: idx < matchPlayers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <HeroIcon hero={resolveHero(p.heroId) as any} size={28} />
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: 13, fontWeight: 500 }}>{p.personaname || `Player ${p.accountId}`}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>account_id: {p.accountId}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/app/comparison?player=${p.accountId}`)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      title="Сравнить игрока"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      <GitCompareArrows size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(74,222,128,0.15)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(74,222,128,0.06)' }}><span style={{ fontSize: 14 }}>🟢</span><p style={{ fontSize: 13, fontWeight: 600, color: '#4ADE80' }}>Allies</p></div>
              {[{ hero: match.hero, k: match.kills, d: match.deaths, a: match.assists, gpm: match.gpm, isMe: true }, ...alliesEnemies.allies].slice(0,5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: (p as any).isMe ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  <HeroIcon hero={p.hero as any} size={32} />
                  <div className="flex-1"><p className="text-white" style={{ fontSize: 13 }}>{p.hero.name}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.gpm} GPM</p></div>
                  <span className="text-white" style={{ fontSize: 14, fontWeight: 700 }}>{p.k}/{p.d}/{p.a}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(248,113,113,0.15)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(248,113,113,0.06)' }}><span style={{ fontSize: 14 }}>🔴</span><p style={{ fontSize: 13, fontWeight: 600, color: '#F87171' }}>Enemies</p></div>
              {alliesEnemies.enemies.slice(0,5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <HeroIcon hero={p.hero as any} size={32} />
                  <div className="flex-1"><p className="text-white" style={{ fontSize: 13 }}>{p.hero.name}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.gpm} GPM</p></div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>{p.k}/{p.d}/{p.a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

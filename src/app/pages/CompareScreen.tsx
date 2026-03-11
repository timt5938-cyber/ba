import React, { useMemo, useState } from 'react';
import { Search, GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Header } from '../components/Header';
import { WinrateRing } from '../components/ui/WinrateRing';
import { HeroIcon } from '../components/ui/HeroIcon';
import { useApp } from '../context/AppContext';
import { resolveSteamProfile } from '../core/steam';
import { openDotaClient } from '../core/opendotaClient';
import { useSearchParams } from 'react-router';

type CompareTab = 'overview' | 'stats' | 'heroes' | 'skills';

export default function CompareScreen() {
  const { accentColor, runtimeSnapshot, updateComparisonPlayer, showToast } = useApp();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<CompareTab>('overview');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  const PLAYER: any = runtimeSnapshot.player;
  const COMPARISON_PLAYER: any = runtimeSnapshot.comparisonPlayer;
  const HERO_STATS: any[] = runtimeSnapshot.heroStats as any[];

  const compareRows = useMemo(() => [
    { label: 'Матчи', p1: PLAYER.totalMatches, p2: COMPARISON_PLAYER.totalMatches, fmt: (v: number) => v.toLocaleString() },
    { label: 'Победы', p1: PLAYER.wins, p2: COMPARISON_PLAYER.wins, fmt: (v: number) => v.toLocaleString() },
    { label: 'Поражения', p1: PLAYER.losses, p2: COMPARISON_PLAYER.losses, fmt: (v: number) => v.toLocaleString() },
    { label: 'Winrate', p1: PLAYER.winrate, p2: COMPARISON_PLAYER.winrate, fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'MMR', p1: PLAYER.mmr, p2: COMPARISON_PLAYER.mmr, fmt: (v: number) => v.toLocaleString() },
    { label: 'Avg KDA', p1: PLAYER.avgKDA, p2: COMPARISON_PLAYER.avgKDA, fmt: (v: number) => v.toFixed(2) },
    { label: 'Avg GPM', p1: PLAYER.avgGPM, p2: COMPARISON_PLAYER.avgGPM, fmt: (v: number) => v.toString() },
  ], [COMPARISON_PLAYER, PLAYER]);

  const radarData = [
    { skill: 'Farming', A: Math.min(100, Math.round((PLAYER.avgGPM / 8))), B: Math.min(100, Math.round((COMPARISON_PLAYER.avgGPM / 8))) },
    { skill: 'Teamfight', A: Math.min(100, Math.round((PLAYER.avgKDA * 20))), B: Math.min(100, Math.round((COMPARISON_PLAYER.avgKDA * 20))) },
    { skill: 'Late', A: Math.min(100, Math.round(PLAYER.winrate + 30)), B: Math.min(100, Math.round(COMPARISON_PLAYER.winrate + 30)) },
    { skill: 'Tempo', A: Math.min(100, Math.round((PLAYER.avgXPM / 8))), B: Math.min(100, Math.round((COMPARISON_PLAYER.avgXPM / 8))) },
  ];

  const barData = [
    { name: 'Winrate', p1: PLAYER.winrate, p2: COMPARISON_PLAYER.winrate },
    { name: 'KDA×10', p1: PLAYER.avgKDA * 10, p2: COMPARISON_PLAYER.avgKDA * 10 },
    { name: 'GPM/10', p1: PLAYER.avgGPM / 10, p2: COMPARISON_PLAYER.avgGPM / 10 },
  ];

  const DeltaIcon = ({ p1, p2 }: { p1: number; p2: number }) => {
    if (p1 > p2) return <TrendingUp size={12} color="#4ADE80" />;
    if (p1 < p2) return <TrendingDown size={12} color="#F87171" />;
    return <Minus size={12} color="#888" />;
  };

  const TABS: { id: CompareTab; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'stats', label: 'Статистика' },
    { id: 'heroes', label: 'Герои' },
    { id: 'skills', label: 'Навыки' },
  ];

  const accountId32From64 = (steamId64: string): number => {
    const base = BigInt('76561197960265728');
    return Number(BigInt(steamId64) - base);
  };

  const parseInputToAccount = async (input: string): Promise<number> => {
    const normalized = input.trim();
    if (!normalized) throw new Error('Введите Steam ID или ссылку steamcommunity.com');
    if (/^\d+$/.test(normalized)) {
      if (normalized.length >= 16) return accountId32From64(normalized);
      return Number(normalized);
    }
    if (normalized.startsWith('http')) {
      const profile = await resolveSteamProfile(normalized);
      if (profile.steamId64) return accountId32From64(profile.steamId64);
    }
    throw new Error('Поддерживаются только Steam ID32/ID64 и Steam URL.');
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const accountId = await parseInputToAccount(searchInput);
      const [player, wl, recent] = await Promise.all([
        openDotaClient.getPlayer(accountId),
        openDotaClient.getPlayerWl(accountId),
        openDotaClient.getRecentMatches(accountId, 40),
      ]);
      const wins = wl.win || 0;
      const losses = wl.lose || 0;
      const total = wins + losses;
      const avgKDA = recent.length
        ? recent.reduce((sum, m) => sum + ((m.kills + m.assists) / Math.max(1, m.deaths)), 0) / recent.length
        : 0;
      const avgGPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.gold_per_min || 0), 0) / recent.length) : 0;
      const avgXPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.xp_per_min || 0), 0) / recent.length) : 0;
      updateComparisonPlayer({
        id: String(player.profile?.account_id || accountId),
        name: player.profile?.personaname || `Player ${accountId}`,
        steamId: String(player.profile?.account_id || accountId),
        steamUrl: player.profile?.profileurl || `https://www.opendota.com/players/${accountId}`,
        rank: player.rank_tier ? `Tier ${player.rank_tier}` : 'Unknown',
        rankTier: player.rank_tier || 0,
        mmr: player.mmr_estimate?.estimate || 0,
        wins,
        losses,
        totalMatches: total,
        winrate: total ? Number(((wins / total) * 100).toFixed(1)) : 0,
        avgKDA: Number(avgKDA.toFixed(2)),
        avgGPM,
        avgXPM,
        lastSync: new Date().toISOString(),
      } as any);
      showToast('Игрок для сравнения загружен', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Не удалось загрузить игрока', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const playerParam = params.get('player');
    if (!playerParam) return;
    setSearchInput(playerParam);
    const autoLoad = async () => {
      try {
        const accountId = await parseInputToAccount(playerParam);
        const [player, wl, recent] = await Promise.all([
          openDotaClient.getPlayer(accountId),
          openDotaClient.getPlayerWl(accountId),
          openDotaClient.getRecentMatches(accountId, 40),
        ]);
        const wins = wl.win || 0;
        const losses = wl.lose || 0;
        const total = wins + losses;
        const avgKDA = recent.length
          ? recent.reduce((sum, m) => sum + ((m.kills + m.assists) / Math.max(1, m.deaths)), 0) / recent.length
          : 0;
        const avgGPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.gold_per_min || 0), 0) / recent.length) : 0;
        const avgXPM = recent.length ? Math.round(recent.reduce((sum, m) => sum + (m.xp_per_min || 0), 0) / recent.length) : 0;
        updateComparisonPlayer({
          id: String(player.profile?.account_id || accountId),
          name: player.profile?.personaname || `Player ${accountId}`,
          steamId: String(player.profile?.account_id || accountId),
          steamUrl: player.profile?.profileurl || `https://www.opendota.com/players/${accountId}`,
          rank: player.rank_tier ? `Tier ${player.rank_tier}` : 'Unknown',
          rankTier: player.rank_tier || 0,
          mmr: player.mmr_estimate?.estimate || 0,
          wins,
          losses,
          totalMatches: total,
          winrate: total ? Number(((wins / total) * 100).toFixed(1)) : 0,
          avgKDA: Number(avgKDA.toFixed(2)),
          avgGPM,
          avgXPM,
          lastSync: new Date().toISOString(),
        } as any);
      } catch {
        // ignore auto-load failures
      }
    };
    autoLoad();
  }, [params, updateComparisonPlayer]);

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1"><GitCompare size={18} color={accentColor} /><h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>Сравнение игроков</h2></div>
      </div>

      <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-stretch">
          <div className="flex-1 flex flex-col items-center py-5 px-3" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>{PLAYER.name}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>/{PLAYER.steamId}</p>
            <div className="mt-2"><WinrateRing value={PLAYER.winrate} size={56} strokeWidth={4} color={accentColor} /></div>
          </div>
          <div className="flex flex-col items-center justify-center px-3"><span className="text-white" style={{ fontSize: 18, fontWeight: 900 }}>VS</span></div>
          <div className="flex-1 flex flex-col items-center py-5 px-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>{COMPARISON_PLAYER.name}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>/{COMPARISON_PLAYER.steamId}</p>
            <div className="mt-2"><WinrateRing value={COMPARISON_PLAYER.winrate} size={56} strokeWidth={4} color="#6366F1" /></div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={15} color="rgba(255,255,255,0.4)" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Steam ID32/ID64 или steamcommunity URL" className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30" style={{ fontSize: 13 }} />
          <button onClick={handleSearch} disabled={loading} className="px-2 py-1 rounded-lg"
            style={{ background: loading ? 'rgba(255,255,255,0.25)' : accentColor, color: '#000', fontSize: 12, fontWeight: 700 }}>
            {loading ? '...' : 'OK'}
          </button>
        </div>
      </div>

      <div className="flex mx-4 mb-4 rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2 rounded-lg transition-all" style={{ fontSize: 12, fontWeight: 600, background: tab === t.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: tab === t.id ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}>{t.label}</button>
        ))}
      </div>

      <div className="px-4 pb-24 flex flex-col gap-4">
        {tab === 'overview' && (
          <div className="rounded-2xl p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="p1" name={PLAYER.name} fill={accentColor} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="p2" name={COMPARISON_PLAYER.name} fill="#6366F1" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 'stats' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
            {compareRows.map((row, i) => (
              <div key={row.label} className="flex items-center px-4 py-3" style={{ borderBottom: i < compareRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{row.label}</span>
                <DeltaIcon p1={row.p1} p2={row.p2} />
                <div className="flex gap-6 items-center ml-3">
                  <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, minWidth: 56, textAlign: 'right' }}>{row.fmt(row.p1)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', minWidth: 56 }}>{row.fmt(row.p2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'heroes' && (
          <>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Топ герои {PLAYER.name}</p>
            {HERO_STATS.slice(0, 6).map(hs => (
              <div key={hs.hero.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
                <HeroIcon hero={hs.hero} size={36} />
                <div className="flex-1 min-w-0"><p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>{hs.hero.name}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{hs.matches} матчей</p></div>
                <div className="text-right"><p style={{ fontSize: 14, fontWeight: 700, color: hs.winrate >= 50 ? '#4ADE80' : '#F87171' }}>{hs.winrate}%</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>KDA {hs.avgKDA}</p></div>
              </div>
            ))}
          </>
        )}

        {tab === 'skills' && (
          <div className="rounded-2xl p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <Radar name={PLAYER.name} dataKey="A" stroke={accentColor} fill={accentColor} fillOpacity={0.15} strokeWidth={2} />
                <Radar name={COMPARISON_PLAYER.name} dataKey="B" stroke="#6366F1" fill="#6366F1" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

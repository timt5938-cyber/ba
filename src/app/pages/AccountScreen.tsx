import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ExternalLink, RefreshCw, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Header } from '../components/Header';
import { WinrateRing } from '../components/ui/WinrateRing';
import { HeroIcon } from '../components/ui/HeroIcon';
import { Badge, RankBadge, StatusDot } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';
import { PLAYER, HERO_STATS, MATCHES, formatTime, WINRATE_DAILY } from '../data/mockData';

const CALENDAR_DATA = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  value: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : 0,
}));

export default function AccountScreen() {
  const navigate = useNavigate();
  const { accentColor, showToast, syncNow } = useApp();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNow();
      showToast(result.message || 'Данные синхронизированы!', result.status === 'success' ? 'success' : 'warning');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      {/* Profile header */}
      <div className="px-4 pt-4 pb-4" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}45)`, border: `2px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 32 }}>🧙</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>{PLAYER.name}</h2>
            <a href={PLAYER.steamUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-0.5 w-fit">
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>steam/{PLAYER.steamId}</span>
              <ExternalLink size={11} color="rgba(255,255,255,0.3)" />
            </a>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <RankBadge rank={PLAYER.rank} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{PLAYER.mmr.toLocaleString()} MMR</span>
              <StatusDot status="online" />
            </div>
          </div>
        </div>

        {/* Win stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Матчей', value: PLAYER.totalMatches.toLocaleString(), color: '#FFFFFF' },
            { label: 'Побед', value: PLAYER.wins.toLocaleString(), color: '#4ADE80' },
            { label: 'Пораж', value: PLAYER.losses.toLocaleString(), color: '#F87171' },
            { label: 'Винрейт', value: `${PLAYER.winrate}%`, color: accentColor },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sync button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}
        >
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Синхронизация...' : 'Обновить статистику'}
        </button>
      </div>

      <div className="px-4 pb-24 flex flex-col gap-4">
        {/* Performance */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Средняя результативность</p>
          </div>
          <div className="flex gap-4 justify-around">
            <WinrateRing value={PLAYER.winrate} size={72} color="#4ADE80" label="Win Rate" />
            <WinrateRing value={Math.min(100, (PLAYER.avgKDA / 8) * 100)} size={72} color="#60A5FA" label="KDA Score" sublabel={PLAYER.avgKDA.toFixed(2)} />
            <WinrateRing value={Math.min(100, (PLAYER.avgGPM / 900) * 100)} size={72} color="#F59E0B" label="GPM Score" sublabel={PLAYER.avgGPM.toString()} />
          </div>
        </div>

        {/* Top heroes */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Лучшие герои</p>
          <div className="flex flex-col gap-0">
            {HERO_STATS.slice(0, 5).map((hs, i) => (
              <div key={hs.hero.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ width: 18, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>#{i + 1}</span>
                <HeroIcon hero={hs.hero} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="text-white" style={{ fontSize: 13, fontWeight: 500 }}>{hs.hero.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ProgressBar value={hs.winrate} color={hs.winrate >= 60 ? '#4ADE80' : '#FBBF24'} height={3} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ fontSize: 14, fontWeight: 700, color: hs.winrate >= 60 ? '#4ADE80' : '#FBBF24' }}>{hs.winrate.toFixed(0)}%</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{hs.matches} матчей</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity calendar */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} color="rgba(255,255,255,0.5)" />
            <p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Активность за 3 месяца</p>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {CALENDAR_DATA.map((d, i) => (
              <div
                key={i}
                title={`${d.value} матчей`}
                style={{
                  width: 9, height: 9, borderRadius: 2,
                  background: d.value === 0 ? 'rgba(255,255,255,0.05)' : accentColor,
                  opacity: d.value === 0 ? 1 : 0.15 + (d.value / 10) * 0.85,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>3 месяца назад</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Сегодня</span>
          </div>
        </div>

        {/* Recent matches */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Последние матчи</p>
            <button onClick={() => navigate('/app/games')} style={{ fontSize: 12, color: accentColor }}>Все матчи</button>
          </div>
          {MATCHES.slice(0, 5).map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: 'transparent' }}
              onClick={() => navigate(`/app/games/${m.id}`)}
            >
              <HeroIcon hero={m.hero} size={34} />
              <div className="flex-1 min-w-0">
                <p className="text-white" style={{ fontSize: 13 }}>{m.hero.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.kills}/{m.deaths}/{m.assists} · {formatTime(m.date)}</p>
              </div>
              <Badge variant={m.result === 'win' ? 'win' : 'loss'}>{m.result === 'win' ? 'W' : 'L'}</Badge>
            </div>
          ))}
        </div>

        {/* Played with */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Часто играл с</p>
          {[
            { name: 'Drakon95', matches: 142, wr: 61.2 },
            { name: 'NightRaven', matches: 98, wr: 58.4 },
            { name: 'Phantom_X', matches: 76, wr: 55.1 },
            { name: 'FrozenWill', matches: 54, wr: 49.8 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>👤</span>
              </div>
              <div className="flex-1">
                <p className="text-white" style={{ fontSize: 13 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.matches} матчей вместе</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: p.wr >= 55 ? '#4ADE80' : '#FBBF24' }}>{p.wr}%</span>
            </div>
          ))}
        </div>

        {/* Full stats table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white px-4 py-3" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Полная статистика</p>
          {[
            { label: 'Avg KDA', value: PLAYER.avgKDA.toFixed(2), color: '#4ADE80' },
            { label: 'Avg GPM', value: PLAYER.avgGPM.toString(), color: '#F59E0B' },
            { label: 'Avg XPM', value: PLAYER.avgXPM.toString(), color: '#60A5FA' },
            { label: 'Avg Duration', value: `${PLAYER.avgDuration} мин`, color: '#FFFFFF' },
            { label: 'Любимая роль', value: 'Midlaner', color: '#F59E0B' },
            { label: 'Любимая линия', value: 'Mid Lane', color: '#F59E0B' },
            { label: 'Любимая сторона', value: 'Radiant (55.2%)', color: '#4ADE80' },
            { label: 'Любимый регион', value: 'Europe East', color: '#60A5FA' },
            { label: 'Любимый режим', value: 'Ranked All Pick', color: '#FFFFFF' },
          ].map((s, i) => (
            <div key={s.label} className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



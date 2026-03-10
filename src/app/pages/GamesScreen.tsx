import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Filter, ChevronRight, Search, X } from 'lucide-react';
import { Header } from '../components/Header';
import { WinrateRing } from '../components/ui/WinrateRing';
import { HeroIcon, RoleTag } from '../components/ui/HeroIcon';
import { Badge } from '../components/ui/Badge';
import { SkeletonMatchCard } from '../components/ui/SkeletonLoader';
import { useApp } from '../context/AppContext';
import { formatDuration, formatTime, Match } from '../data/mockData';

const ROLES = ['Все', 'Carry', 'Midlaner', 'Offlaner', 'Pos 4', 'Pos 5'];
const RESULTS = ['Все', 'Победа', 'Поражение'];

function MatchCard({ match, onClick }: { match: Match; onClick: () => void }) {
  const isWin = match.result === 'win';
  const winColor = '#4ADE80';
  const loseColor = '#F87171';

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 flex gap-3 transition-all active:scale-[0.99]"
      style={{ background: '#111111', border: `1px solid ${isWin ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.08)'}` }}
    >
      <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
        <HeroIcon hero={match.hero} size={44} />
        <RoleTag role={match.role} compact />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>{match.hero.name}</span>
          <Badge variant={isWin ? 'win' : 'loss'}>{isWin ? 'Победа' : 'Пораж.'}</Badge>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>
            {match.side === 'radiant' ? '🟢' : '🔴'} {match.side === 'radiant' ? 'Radiant' : 'Dire'}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{match.kills}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>/</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: loseColor }}>{match.deaths}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>/</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{match.assists}</span>
          <span className="ml-2" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>KDA {match.kdaRatio.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⏱ {formatDuration(match.duration)}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>💰 {match.gpm}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⭐ {match.xpm}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{formatTime(match.date)}</span>
        </div>

        <div className="flex gap-1">
          {match.items.slice(0, 6).map(item => (
            <div key={item.id} title={item.name} style={{ width: 22, height: 22, borderRadius: 4, background: `${item.color}22`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 7, color: item.color, fontWeight: 700 }}>{item.name.slice(0, 2).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: `${match.performance >= 70 ? winColor : match.performance >= 50 ? '#F59E0B' : loseColor}18`, border: `1.5px solid ${match.performance >= 70 ? winColor : match.performance >= 50 ? '#F59E0B' : loseColor}35` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: match.performance >= 70 ? winColor : match.performance >= 50 ? '#F59E0B' : loseColor }}>{match.performance}</span>
        </div>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Score</span>
        <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
      </div>
    </button>
  );
}

export default function GamesScreen() {
  const navigate = useNavigate();
  const { accentColor, runtimeSnapshot, isLoading } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Все');
  const [resultFilter, setResultFilter] = useState('Все');
  const [showFilters, setShowFilters] = useState(false);

  const player = runtimeSnapshot.player as any;
  const matches = runtimeSnapshot.matches as Match[];

  const filtered = useMemo(() => matches.filter(m => {
    if (search && !m.hero.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'Все' && m.role !== roleFilter) return false;
    if (resultFilter === 'Победа' && m.result !== 'win') return false;
    if (resultFilter === 'Поражение' && m.result !== 'loss') return false;
    return true;
  }), [matches, search, roleFilter, resultFilter]);

  const wins = filtered.filter(m => m.result === 'win').length;
  const losses = filtered.filter(m => m.result === 'loss').length;

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" showSearch />

      <div className="px-4 pt-4 pb-3">
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <WinrateRing value={player.winrate} size={76} strokeWidth={6} color={accentColor} label="Винрейт" />
          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              { label: 'Матчей', value: player.totalMatches?.toLocaleString?.() ?? 0 },
              { label: 'Побед', value: player.wins?.toLocaleString?.() ?? 0, color: '#4ADE80' },
              { label: 'Поражений', value: player.losses?.toLocaleString?.() ?? 0, color: '#F87171' },
              { label: 'KDA', value: Number(player.avgKDA || 0).toFixed(2) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{s.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: (s as any).color ?? '#FFFFFF' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-col gap-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="rgba(255,255,255,0.35)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по герою..." className="w-full pl-10 pr-10 py-2.5 rounded-xl text-white placeholder:text-white/30 outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14 }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X size={14} color="rgba(255,255,255,0.4)" /></button>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className="flex-shrink-0 px-3 py-1.5 rounded-full" style={{ fontSize: 12, fontWeight: 500, background: roleFilter === r ? accentColor : 'rgba(255,255,255,0.06)', color: roleFilter === r ? '#000' : 'rgba(255,255,255,0.55)' }}>{r}</button>
            ))}
          </div>

          <button onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: showFilters ? `${accentColor}22` : 'rgba(255,255,255,0.06)', border: `1px solid ${showFilters ? accentColor + '44' : 'transparent'}` }}>
            <Filter size={15} color={showFilters ? accentColor : 'rgba(255,255,255,0.5)'} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            {RESULTS.map(r => (
              <button key={r} onClick={() => setResultFilter(r)} className="px-3 py-1.5 rounded-full" style={{ fontSize: 12, fontWeight: 500, background: resultFilter === r ? (r === 'Победа' ? 'rgba(74,222,128,0.15)' : r === 'Поражение' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.05)', color: resultFilter === r ? (r === 'Победа' ? '#4ADE80' : r === 'Поражение' ? '#F87171' : '#fff') : 'rgba(255,255,255,0.5)' }}>{r}</button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-24 flex flex-col gap-2.5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonMatchCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            <p className="text-white" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Матчей не найдено</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
              Показано {filtered.length} матчей · {wins}W {losses}L
            </p>
            {filtered.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => navigate(`/app/games/${match.id}`)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

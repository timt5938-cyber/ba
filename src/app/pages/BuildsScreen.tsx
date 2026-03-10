import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, TrendingUp, Star, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { Header } from '../components/Header';
import { HeroIcon, RoleTag, ItemIcon } from '../components/ui/HeroIcon';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';


const ROLES = ['Все', 'Carry', 'Midlaner', 'Offlaner', 'Pos 4', 'Pos 5'];

export default function BuildsScreen() {
  const navigate = useNavigate();
  const { accentColor, runtimeSnapshot } = useApp();
  const [filter, setFilter] = useState('Все');

  const builds = runtimeSnapshot.builds as any[];
  const heroStats = runtimeSnapshot.heroStats as any[];
  const filtered = filter === 'Все' ? builds : builds.filter(b => b.role === filter);

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>Сборки</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Аналитические рекомендации на основе ваших матчей · Патч 7.38
        </p>
      </div>

      {/* Analytical basis info */}
      <div className="px-4 py-2">
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.18)' }}>
          <Brain size={14} color="#60A5FA" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            Рекомендации формируются на основе ваших последних матчей, частых ошибок, винрейта с героем и патча 7.38
          </p>
        </div>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {ROLES.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full"
            style={{
              fontSize: 12, fontWeight: 600,
              background: filter === r ? accentColor : 'rgba(255,255,255,0.06)',
              color: filter === r ? '#000' : 'rgba(255,255,255,0.55)',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Your top heroes section */}
      <div className="px-4 py-3">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 0.5 }}>ВАШИ ТОП-ГЕРОИ</p>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {heroStats.slice(0, 6).map(hs => (
            <div
              key={hs.hero.id}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', width: 78 }}
              onClick={() => navigate(`/app/builds`)}
            >
              <HeroIcon hero={hs.hero} size={38} showName />
              <span style={{
                fontSize: 11,
                color: hs.winrate >= 60 ? '#4ADE80' : hs.winrate >= 50 ? '#FBBF24' : '#F87171',
                fontWeight: 700,
              }}>
                {hs.winrate.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Builds list */}
      <div className="px-4 pb-24 flex flex-col gap-3">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
          РЕКОМЕНДОВАННЫЕ СБОРКИ ({filtered.length})
        </p>
        {filtered.map(build => (
          <button
            key={build.id}
            onClick={() => navigate(`/app/builds/${build.id}`)}
            className="w-full text-left rounded-xl overflow-hidden transition-all active:scale-[0.99]"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 pb-3">
              <HeroIcon hero={build.hero} size={52} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white" style={{ fontSize: 16, fontWeight: 700 }}>{build.hero.name}</span>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <RoleTag role={build.role} compact />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.05)' }}>
                    {build.lane}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.05)' }}>
                    Патч {build.patch}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 pb-3 flex gap-4 items-end">
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Винрейт</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: build.winrate >= 60 ? '#4ADE80' : '#FBBF24' }}>
                  {build.winrate}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Популярность</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#60A5FA' }}>{build.popularity}%</p>
              </div>
              <div className="flex-1 pb-1">
                <ProgressBar value={build.winrate} color={build.winrate >= 60 ? '#4ADE80' : '#FBBF24'} height={4} />
              </div>
            </div>

            {/* Core items preview with CDN icons */}
            <div className="px-4 pb-3">
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>CORE ITEMS</p>
              <div className="flex gap-2">
                {build.coreItems.slice(0, 5).map(item => (
                  <ItemIcon key={item.id} cdnName={item.cdnName} name={item.name} color={item.color} size={34} />
                ))}
              </div>
            </div>

            {/* Why this build (analytical excerpt) */}
            <div className="px-4 pb-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                <div className="flex items-start gap-2 mb-2">
                  <Brain size={12} color="#60A5FA" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600 }}>Почему эта сборка</p>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  {build.analysis.whyThisBuild.slice(0, 120)}...
                </p>
              </div>
            </div>

            {/* Key error preview */}
            {build.analysis.playerErrors.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <AlertTriangle size={12} color="#FBBF24" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10, color: '#FBBF24', fontWeight: 600, marginBottom: 2 }}>
                      ОБНАРУЖЕННЫЕ ОШИБКИ
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                      {build.analysis.playerErrors[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Aspects preview */}
            {build.aspects.some(a => a.recommended) && (
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {build.aspects.filter(a => a.recommended).map(asp => (
                    <span key={asp.name} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.12)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.2)' }}>
                      ✦ {asp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div style={{ fontSize: 48 }}>⚔️</div>
            <p className="text-white" style={{ fontSize: 16, fontWeight: 600 }}>Сборок не найдено</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              Для этой роли пока нет рекомендаций — сыграйте больше матчей
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




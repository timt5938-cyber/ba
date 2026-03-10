import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Star, CheckCircle, AlertTriangle, Brain, TrendingUp, Zap,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { HeroIcon, RoleTag, ItemIcon } from '../components/ui/HeroIcon';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';
import { safeBack } from '../core/navigation';


const ITEM_PHASES = ['Стартовые', 'Core', 'Ситуативные', 'Late Game'];

export default function BuildDetailScreen() {
  const { buildId } = useParams();
  const navigate = useNavigate();
  const { accentColor, runtimeSnapshot } = useApp();
  const [tab, setTab] = useState(0);
  const [mainTab, setMainTab] = useState(0);

  const builds = runtimeSnapshot.builds as any[];
  const build = builds.find(b => b.id === buildId) ?? builds[0];
  if (!build) {
    return <div className="p-6 text-white">Сборка не найдена</div>;
  }
  const itemSets = [build.startingItems, build.coreItems, build.situationalItems, build.lategameItems];
  const currentItems = itemSets[tab];

  const TABS = [
    { label: 'Предметы' },
    { label: 'Скиллы' },
    { label: 'Анализ' },
    { label: 'Аспекты' },
  ] as const;

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}>
        <button onClick={() => safeBack(navigate, '/app/builds')}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <ArrowLeft size={18} color="rgba(255,255,255,0.8)" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <HeroIcon hero={build.hero} size={28} />
          <p className="text-white truncate" style={{ fontSize: 15, fontWeight: 700 }}>
            {build.hero.name}
          </p>
          <RoleTag role={build.role} compact />
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 py-4" style={{ background: `linear-gradient(180deg, ${build.hero.color}12, transparent)` }}>
        <div className="flex items-center gap-4 mb-4">
          <HeroIcon hero={build.hero} size={60} />
          <div>
            <h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>{build.hero.name}</h2>
            <div className="flex gap-2 mt-1 flex-wrap">
              <RoleTag role={build.role} />
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                {build.lane}
              </span>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                Патч {build.patch}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#4ADE80' }}>{build.winrate}%</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Винрейт сборки</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid rgba(96,165,250,0.15)' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#60A5FA' }}>{build.popularity}%</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Популярность</p>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex px-4 gap-0 mb-0 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setMainTab(i)}
            className="px-4 py-2.5 flex-shrink-0"
            style={{
              fontSize: 13, fontWeight: 600,
              color: mainTab === i ? accentColor : 'rgba(255,255,255,0.4)',
              borderBottom: `2px solid ${mainTab === i ? accentColor : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24 pt-4 flex flex-col gap-4">
        {/* ── TAB 0: Items ── */}
        {mainTab === 0 && (
          <>
            {/* Item phase selector */}
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {ITEM_PHASES.map((p, i) => (
                <button key={i} onClick={() => setTab(i)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full"
                  style={{ fontSize: 12, fontWeight: 600, background: tab === i ? accentColor : 'rgba(255,255,255,0.06)', color: tab === i ? '#000' : 'rgba(255,255,255,0.55)' }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Items grid with CDN icons */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: 0.5 }}>
                {ITEM_PHASES[tab].toUpperCase()}
              </p>
              {currentItems.length === 0 ? (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Нет предметов</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {currentItems.map(item => (
                    <div key={item.id} className="flex flex-col items-center gap-2">
                      <ItemIcon cdnName={item.cdnName} name={item.name} color={item.color} size={60} />
                      <div className="text-center">
                        <p className="text-white" style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</p>
                        {item.cost > 0 && (
                          <p style={{ fontSize: 10, color: '#F59E0B' }}>💰 {item.cost.toLocaleString()}g</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Why this build */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={15} color="#60A5FA" />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#93C5FD' }}>Почему эта сборка лучше для ваших матчей</p>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{build.analysis.whyThisBuild}</p>
            </div>

            {/* Timing errors */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} color="#FBBF24" />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Частые ошибки в таймингах</p>
              </div>
              {build.analysis.timingErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 py-2.5"
                  style={{ borderBottom: i < build.analysis.timingErrors.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <AlertCircle size={13} color="#FBBF24" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{err}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TAB 1: Skills ── */}
        {mainTab === 1 && (
          <div className="flex flex-col gap-4">
            {/* Skill build */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Порядок прокачки</p>
              <div className="flex flex-col gap-3">
                {build.skillBuild.map((sb, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${build.hero.color}18`, border: `1.5px solid ${build.hero.color}40` }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: build.hero.color }}>{sb.level}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: 13 }}>{sb.skill}</p>
                    </div>
                    {i === 0 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>приоритет</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Talents */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Таланты</p>
              {build.talents.map((talent, i) => (
                <div key={i} className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < build.talents.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${build.hero.color}15`, border: `1px solid ${build.hero.color}35` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: build.hero.color }}>
                      {10 + i * 5}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#FBBF24', marginBottom: 2 }}>Уровень {10 + i * 5}</p>
                    <p className="text-white" style={{ fontSize: 13 }}>{talent}</p>
                  </div>
                  <Star size={14} color="#FBBF24" />
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Советы по игре</p>
              {build.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5"
                  style={{ borderBottom: i < build.tips.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <CheckCircle size={15} color="#4ADE80" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: Analysis ── */}
        {mainTab === 2 && (
          <div className="flex flex-col gap-4">
            {/* What you do well */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} color="#4ADE80" />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#4ADE80' }}>Что ты делаешь хорошо</p>
              </div>
              {build.analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 py-2.5"
                  style={{ borderBottom: i < build.analysis.strengths.length - 1 ? '1px solid rgba(74,222,128,0.1)' : 'none' }}>
                  <CheckCircle2 size={14} color="#4ADE80" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{s}</p>
                </div>
              ))}
            </div>

            {/* Detected player errors */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} color="#F87171" />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F87171' }}>Ошибки в прошлых матчах</p>
              </div>
              {build.analysis.playerErrors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 py-2.5"
                  style={{ borderBottom: i < build.analysis.playerErrors.length - 1 ? '1px solid rgba(239,68,68,0.1)' : 'none' }}>
                  <AlertCircle size={14} color="#F87171" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{e}</p>
                </div>
              ))}
            </div>

            {/* What to improve */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} color="#FBBF24" />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>Что стоит улучшить</p>
              </div>
              {build.analysis.improvements.map((imp, i) => (
                <div key={i} className="flex items-start gap-2 py-2.5"
                  style={{ borderBottom: i < build.analysis.improvements.length - 1 ? '1px solid rgba(251,191,36,0.1)' : 'none' }}>
                  <Star size={13} color="#FBBF24" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{imp}</p>
                </div>
              ))}
            </div>

            {/* Why this build for YOUR matches */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} color="#60A5FA" />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#93C5FD' }}>Почему эта сборка лучше для твоих матчей</p>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{build.analysis.whyThisBuild}</p>
            </div>

            {/* Timing errors */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} color="#FBBF24" />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Частые ошибки в таймингах и предметах</p>
              </div>
              {build.analysis.timingErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-3 py-3"
                  style={{ borderBottom: i < build.analysis.timingErrors.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: err.includes('✓') ? '#4ADE80' : '#FBBF24', flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{err}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: Aspects / Facets ── */}
        {mainTab === 3 && (
          <div className="flex flex-col gap-4">
            {/* Info */}
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                Аспекты (Facets) — игровые модификаторы героя, влияющие на стиль игры и рекомендации по сборке. Выбор аспекта влияет на оптимальный item path.
              </p>
            </div>

            {build.aspects.map((asp, i) => (
              <div key={i} className="rounded-2xl p-4"
                style={{ background: asp.recommended ? 'rgba(167,139,250,0.08)' : '#111', border: `1px solid ${asp.recommended ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                {/* Aspect header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: asp.recommended ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${asp.recommended ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>✦</span>
                    </div>
                    <div>
                      <p className="text-white" style={{ fontSize: 14, fontWeight: 700 }}>{asp.name}</p>
                      {asp.recommended && (
                        <span style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600 }}>✓ РЕКОМЕНДУЕТСЯ</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 8 }}>
                  {asp.description}
                </p>

                {/* Effect */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: asp.recommended ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${asp.recommended ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                  <Zap size={13} color={asp.recommended ? '#A78BFA' : 'rgba(255,255,255,0.4)'} />
                  <p style={{ fontSize: 12, color: asp.recommended ? '#C4B5FD' : 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                    {asp.effect}
                  </p>
                </div>

                {/* Linked build effect */}
                {asp.recommended && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                    <p style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600, marginBottom: 4 }}>
                      СВЯЗЬ СО СБОРКОЙ
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                      Этот аспект усиливает рекомендованный item path и увеличивает эффективность Core предметов в teamfight на 15-20%.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {build.aspects.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <span style={{ fontSize: 40 }}>✦</span>
                <p className="text-white" style={{ fontSize: 15 }}>Нет данных об аспектах</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




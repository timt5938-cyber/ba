import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { Header } from '../components/Header';
import { WinrateRing } from '../components/ui/WinrateRing';
import { HeroIcon } from '../components/ui/HeroIcon';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';


const RADAR_DATA = [
  { skill: 'Farming', A: 82 }, { skill: 'Teamfight', A: 74 },
  { skill: 'Ganking', A: 68 }, { skill: 'Warding', A: 55 },
  { skill: 'Early Game', A: 72 }, { skill: 'Late Game', A: 88 },
];

const PERIODS = ['7 дней', '30 дней', '3 мес', 'Всё время'];

export default function AnalyticsScreen() {
  const { accentColor, runtimeSnapshot } = useApp();
  const PLAYER: any = runtimeSnapshot.player;
  const HERO_STATS: any[] = runtimeSnapshot.heroStats as any[];
  const WINRATE_DAILY: any[] = runtimeSnapshot.analytics.winrateDaily as any[];
  const WINRATE_WEEKLY: any[] = runtimeSnapshot.analytics.winrateWeekly as any[];
  const GPM_TREND: any[] = runtimeSnapshot.analytics.gpmTrend as any[];
  const KDA_TREND: any[] = runtimeSnapshot.analytics.kdaTrend as any[];
  const ROLE_STATS: any[] = runtimeSnapshot.analytics.roleStats as any[];
  const SIDE_STATS: any[] = runtimeSnapshot.analytics.sideStats as any[];
  const HERO_WINRATE_CHART: any[] = runtimeSnapshot.analytics.heroWinrateChart as any[];
  const [period, setPeriod] = useState(0);
  const [tab, setTab] = useState(0);

  const TABS = ['Обзор', 'Герои', 'Тренды', 'Карта'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ fontSize: 12, color: p.color || '#fff', fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(p.name === 'gpm' || p.name === 'xpm' ? 0 : 1) : p.value}
            {p.name === 'winrate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>Аналитика</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Глубокая статистика вашей игры</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-1.5 px-4 py-2">
        {PERIODS.map((p, i) => (
          <button
            key={p}
            onClick={() => setPeriod(i)}
            className="flex-1 py-1.5 rounded-xl"
            style={{ fontSize: 12, fontWeight: 600, background: period === i ? accentColor : 'rgba(255,255,255,0.06)', color: period === i ? '#000' : 'rgba(255,255,255,0.5)' }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main tabs */}
      <div className="flex px-4 gap-1 mt-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="px-4 py-2.5"
            style={{
              fontSize: 13, fontWeight: 600,
              color: tab === i ? accentColor : 'rgba(255,255,255,0.4)',
              borderBottom: `2px solid ${tab === i ? accentColor : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24 pt-4 flex flex-col gap-4">
        {tab === 0 && (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 flex flex-col items-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <WinrateRing value={PLAYER.winrate} size={76} color={accentColor} label="Общий винрейт" />
              </div>
              <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Avg GPM', value: PLAYER.avgGPM, color: '#F59E0B' },
                  { label: 'Avg XPM', value: PLAYER.avgXPM, color: '#60A5FA' },
                  { label: 'Avg KDA', value: PLAYER.avgKDA.toFixed(2), color: '#4ADE80' },
                  { label: 'Avg Dur', value: `${PLAYER.avgDuration}m`, color: '#94A3B8' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Winrate daily chart */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between items-center mb-4">
                <p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Динамика винрейта</p>
                <Badge variant="win">+4.3% за 7 дней</Badge>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={WINRATE_DAILY}>
                  <defs>
                    <linearGradient id="wrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 80]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="winrate" name="winrate" stroke={accentColor} strokeWidth={2} fill="url(#wrGrad)" dot={{ fill: accentColor, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Side stats */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Radiant vs Dire</p>
              <div className="flex gap-6 justify-center items-center">
                <WinrateRing value={SIDE_STATS[0]?.value ?? 0} size={72} color="#4ADE80" label="Radiant" sublabel={`${SIDE_STATS[0]?.value ?? 0}%`} />
                <div className="flex flex-col gap-2">
                  <ProgressBar value={SIDE_STATS[0]?.value ?? 0} label="Radiant" showLabel color="#4ADE80" />
                  <ProgressBar value={SIDE_STATS[1]?.value ?? 0} label="Dire" showLabel color="#F87171" />
                </div>
                <WinrateRing value={SIDE_STATS[1]?.value ?? 0} size={72} color="#F87171" label="Dire" sublabel={`${SIDE_STATS[1]?.value ?? 0}%`} />
              </div>
            </div>

            {/* Role performance */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>По ролям</p>
              <div className="flex flex-col gap-3">
                {ROLE_STATS.map(r => (
                  <div key={r.role} className="flex items-center gap-3">
                    <span style={{ width: 80, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{r.role}</span>
                    <div className="flex-1">
                      <ProgressBar value={r.winrate} color={r.color} height={5} />
                    </div>
                    <span style={{ width: 40, fontSize: 12, fontWeight: 700, color: r.color, textAlign: 'right' }}>{r.winrate}%</span>
                    <span style={{ width: 40, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>{r.matches}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar skills */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-2" style={{ fontSize: 13, fontWeight: 600 }}>Профиль игрока</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <Radar name="Игрок" dataKey="A" stroke={accentColor} fill={accentColor} fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Growth zones */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#93C5FD', marginBottom: 10 }}>📈 Зоны роста</p>
              {[
                { text: 'Pos 4 / Pos 5 — потенциал роста WR на 8% через ward coverage', color: '#4ADE80' },
                { text: 'Контроль смертей — среднее выше нормы (5.1 vs 4.0)', color: '#FBBF24' },
                { text: 'Offlane — слабейшая роль (48.4%), требует практики', color: '#F87171' },
              ].map((z, i) => (
                <div key={i} className="flex items-start gap-2 py-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: z.color }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{z.text}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 1 && (
          <>
            {/* Hero winrate bar chart */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Топ героев — Винрейт</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={HERO_WINRATE_CHART} layout="vertical" barSize={10}>
                  <XAxis type="number" domain={[40, 70]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="winrate" name="winrate" radius={5}>
                    {HERO_WINRATE_CHART.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hero stats list */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex px-4 py-2.5 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ flex: '1 1 auto', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>ГЕРОЙ</span>
                <span style={{ width: 44, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>WR%</span>
                <span style={{ width: 44, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>KDA</span>
                <span style={{ width: 40, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>M</span>
              </div>
              {HERO_STATS.map((hs, i) => (
                <div key={hs.hero.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < HERO_STATS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ width: 20, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                  <HeroIcon hero={hs.hero} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white" style={{ fontSize: 13, fontWeight: 500 }}>{hs.hero.name}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{hs.avgGPM} GPM</p>
                  </div>
                  <span style={{ width: 44, fontSize: 14, fontWeight: 700, color: hs.winrate >= 60 ? '#4ADE80' : hs.winrate >= 50 ? '#FBBF24' : '#F87171', textAlign: 'right' }}>{hs.winrate.toFixed(0)}%</span>
                  <span style={{ width: 44, fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>{hs.avgKDA.toFixed(1)}</span>
                  <span style={{ width: 40, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{hs.matches}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 2 && (
          <>
            {/* GPM trend */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>GPM по последним матчам</p>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={GPM_TREND}>
                  <XAxis dataKey="game" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={v => `#${v}`} axisLine={false} tickLine={false} />
                  <YAxis domain={[300, 1000]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="gpm" name="gpm" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* KDA trend */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>KDA тренд</p>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={KDA_TREND}>
                  <defs>
                    <linearGradient id="kdaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="game" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={v => `#${v}`} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="kda" name="KDA" stroke="#60A5FA" strokeWidth={2} fill="url(#kdaGrad)" dot={{ fill: '#60A5FA', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly WR */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Винрейт по неделям</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={WINRATE_WEEKLY} barSize={18}>
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[45, 70]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="winrate" name="winrate" radius={4} fill={accentColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-3" style={{ fontSize: 13, fontWeight: 600 }}>💡 Персональные инсайты</p>
              {[
                { text: 'Вы играете лучше всего РІ утренние часы (10:00–14:00)', icon: '🌅' },
                { text: 'Winrate падает после 3+ часов игры подряд', icon: '⚠️' },
                { text: 'Mid роль приносит на 12% больше MMR', icon: '📈' },
                { text: 'Пятница — самый результативный день', icon: '📅' },
              ].map((ins, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 18 }}>{ins.icon}</span>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{ins.text}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 3 && (
          <>
            {/* Activity heatmap */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>Активность по времени суток</p>
              <div className="flex flex-col gap-1">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, di) => (
                  <div key={day} className="flex items-center gap-1">
                    <span style={{ width: 24, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>{day}</span>
                    <div className="flex gap-0.5 flex-1">
                      {Array.from({ length: 24 }, (_, h) => {
                        const val = Math.max(0, Math.floor(Math.sin((h - 14) / 6) * 4 + Math.random() * 3 + (di > 4 ? 3 : 1)));
                        const opacity = val === 0 ? 0.05 : 0.15 + (val / 8) * 0.85;
                        return (
                          <div
                            key={h}
                            title={`${day} ${h}:00 — ${val} матчей`}
                            style={{ flex: 1, height: 16, borderRadius: 2, background: accentColor, opacity }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Меньше</span>
                  {[0.05, 0.2, 0.4, 0.65, 0.9].map((op, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: accentColor, opacity: op }} />
                  ))}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Больше</span>
                </div>
              </div>
            </div>

            {/* Region stats */}
            <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white mb-4" style={{ fontSize: 13, fontWeight: 600 }}>По регионам</p>
              {[
                { region: 'Europe East', pct: 82, wr: 55.1, color: '#60A5FA' },
                { region: 'Europe West', pct: 12, wr: 51.8, color: '#A78BFA' },
                { region: 'US East', pct: 4, wr: 48.2, color: '#F97316' },
                { region: 'SE Asia', pct: 2, wr: 50.0, color: '#4ADE80' },
              ].map(r => (
                <div key={r.region} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex-1">
                    <p className="text-white" style={{ fontSize: 13 }}>{r.region}</p>
                    <ProgressBar value={r.pct} color={r.color} height={3} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 28 }}>{r.pct}%</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.wr >= 52 ? '#4ADE80' : '#F87171', width: 40, textAlign: 'right' }}>{r.wr}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


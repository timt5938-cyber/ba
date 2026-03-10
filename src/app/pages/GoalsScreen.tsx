import React, { useState } from 'react';
import { Target, Plus, Check, Flame, Trophy, X, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { Goal } from '../data/mockData';

const TYPE_ICONS: Record<Goal['type'], string> = {
  winrate: '??',
  kda:     '?',
  matches: '??',
  deaths:  '??',
  streak:  '??',
};

const TYPE_LABELS: Record<Goal['type'], string> = {
  winrate: 'Winrate',
  kda:     'KDA',
  matches: 'Матчи',
  deaths:  'Смерти',
  streak:  'Серия',
};

function GoalCard({ goal, accentColor }: { goal: Goal; accentColor: string }) {
  const pct = Math.min(100, (goal.current / goal.target) * 100);
  const isReverse = goal.type === 'deaths';
  const progress = isReverse ? Math.min(100, (goal.target / Math.max(goal.current, 0.1)) * 100) : pct;

  const progressColor = goal.completed ? '#4ADE80' : progress >= 80 ? '#F59E0B' : accentColor;

  return (
    <div className="rounded-2xl p-4" style={{ background: goal.completed ? 'rgba(34,197,94,0.05)' : '#111111', border: `1px solid ${goal.completed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>{TYPE_ICONS[goal.type]}</span>
          <div>
            <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>{goal.title}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{goal.description}</p>
          </div>
        </div>
        {goal.completed ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)' }}><Check size={14} color="#4ADE80" /></div>
        ) : <Badge variant="neutral" size="sm">{TYPE_LABELS[goal.type]}</Badge>}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: progressColor }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}99, ${progressColor})`, borderRadius: '9999px' }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {goal.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Flame size={11} color="#F87171" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#F87171' }}>x{goal.streak} серия</span>
            </div>
          )}
          {goal.deadline && !goal.completed && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              до {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AddGoalModal({ onClose, accentColor, onCreate }: { onClose: () => void; accentColor: string; onCreate: (goal: Goal) => void }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState<Goal['type']>('winrate');

  const GOAL_TYPES: Goal['type'][] = ['winrate', 'kda', 'matches', 'deaths', 'streak'];

  const create = () => {
    const targetValue = Number(target || 0);
    if (!title || !targetValue) return;
    onCreate({
      id: `g_${Date.now()}`,
      title,
      description: `Пользовательская цель (${TYPE_LABELS[type]})`,
      target: targetValue,
      current: 0,
      unit: type === 'winrate' ? '%' : type === 'matches' ? 'матчей' : '',
      type,
      deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
      completed: false,
      streak: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white" style={{ fontSize: 18, fontWeight: 700 }}>Новая цель</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}><X size={16} color="rgba(255,255,255,0.6)" /></button>
        </div>

        <div className="flex flex-col gap-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название цели" className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14 }} />
          <div className="flex gap-2 flex-wrap">
            {GOAL_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} className="px-3 py-1.5 rounded-lg" style={{ fontSize: 12, fontWeight: 600, background: type === t ? accentColor : 'rgba(255,255,255,0.06)', color: type === t ? '#000' : 'rgba(255,255,255,0.6)' }}>
                {TYPE_ICONS[t]} {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Целевое значение" type="number" className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14 }} />
          <button onClick={create} className="w-full py-3.5 rounded-2xl mt-2" style={{ background: accentColor, color: '#000', fontSize: 15, fontWeight: 700 }}>Создать цель</button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsScreen() {
  const { accentColor, showToast, runtimeSnapshot, upsertGoal } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const goals = runtimeSnapshot.goals as Goal[];
  const achievements = runtimeSnapshot.achievements as any[];

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);
  const shown = activeTab === 'active' ? active : completed;

  const totalStreak = active.reduce((sum, g) => sum + g.streak, 0);
  const completedCount = completed.length;
  const totalGoals = goals.length;

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#080808' }}>
      <Header title="Dota Scope" />

      <div className="px-4 pb-24">
        <div className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1"><Target size={18} color={accentColor} /><h2 className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>Цели</h2></div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Отслеживайте прогресс и достигайте новых вершин</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{ label: 'Активных', value: active.length, icon: '??', color: accentColor }, { label: 'Выполнено', value: completedCount, icon: '?', color: '#4ADE80' }, { label: 'Серия', value: totalStreak, icon: '??', color: '#F87171' }].map(s => (
            <div key={s.label} className="rounded-xl p-3 flex flex-col items-center gap-1" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span><span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-5" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-2"><p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Общий прогресс</p><span style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>{completedCount}/{totalGoals}</span></div>
          <ProgressBar value={(completedCount / Math.max(1, totalGoals)) * 100} color={accentColor} height={8} />
        </div>

        <div className="flex rounded-xl p-1 mb-4 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[{ id: 'active' as const, label: `Активные (${active.length})` }, { id: 'completed' as const, label: `Выполнены (${completed.length})` }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="flex-1 py-2.5 rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 600, background: activeTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.4)' }}>{t.label}</button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mb-6">{shown.map(goal => <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />)}</div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3"><Trophy size={16} color="#F59E0B" /><p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Достижения</p></div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((ach: any) => (
              <div key={ach.id} className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center" style={{ background: ach.completed ? '#111111' : 'rgba(255,255,255,0.02)', border: `1px solid ${ach.completed ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`, opacity: ach.completed ? 1 : 0.45 }}>
                <span style={{ fontSize: 24, filter: ach.completed ? 'none' : 'grayscale(1)' }}>{ach.icon}</span>
                <p className="text-white" style={{ fontSize: 11, fontWeight: 600 }}>{ach.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3"><TrendingUp size={14} color={accentColor} /><p className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Рекомендуемые цели</p></div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Рекомендации строятся на ваших последних матчах и трендах.</p>
        </div>
      </div>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-20 right-5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-20" style={{ background: accentColor, boxShadow: `0 8px 24px ${accentColor}44` }}><Plus size={24} color="#000" /></button>

      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          accentColor={accentColor}
          onCreate={(goal) => {
            upsertGoal(goal);
            showToast('Цель добавлена!', 'success');
          }}
        />
      )}
    </div>
  );
}


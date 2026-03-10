import React from 'react';

type BadgeVariant = 'win' | 'loss' | 'neutral' | 'accent' | 'gold' | 'warning' | 'info';

interface Props {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const STYLES: Record<BadgeVariant, string> = {
  win:     'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/25',
  loss:    'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/25',
  neutral: 'bg-white/08 text-white/60 border border-white/12',
  accent:  'bg-white/12 text-white border border-white/20',
  gold:    'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/25',
  warning: 'bg-[#F97316]/15 text-[#FB923C] border border-[#F97316]/25',
  info:    'bg-[#60A5FA]/15 text-[#93C5FD] border border-[#60A5FA]/25',
};

export function Badge({ variant = 'neutral', children, size = 'sm', dot = false }: Props) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-semibold tracking-wide ${STYLES[variant]} ${sizeClass}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function RankBadge({ rank }: { rank: string }) {
  const colors: Record<string, string> = {
    'Herald': '#6B7280', 'Guardian': '#6B7280', 'Crusader': '#92400E', 'Archon': '#6D28D9',
    'Legend': '#0284C7', 'Ancient': '#047857', 'Divine': '#7C3AED', 'Immortal': '#DC2626',
  };
  const color = Object.entries(colors).find(([k]) => rank.includes(k))?.[1] ?? '#6B7280';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold"
      style={{ fontSize: 10, background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      🏅 {rank}
    </span>
  );
}

export function StatusDot({ status }: { status: 'online' | 'offline' | 'syncing' | 'error' }) {
  const map = { online: '#22C55E', offline: '#6B7280', syncing: '#F59E0B', error: '#EF4444' };
  const label = { online: 'В сети', offline: 'Офлайн', syncing: 'Синхронизация...', error: 'Ошибка' };
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: map[status] }} />
      <span style={{ color: map[status] }}>{label[status]}</span>
    </span>
  );
}

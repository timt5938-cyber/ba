import React, { useState } from 'react';
import { Hero } from '../../data/mockData';
import { dotaAssets } from '../../core/assets';

interface Props {
  hero: Hero;
  size?: number;
  showName?: boolean;
}

export function HeroIcon({ hero, size = 40, showName = false }: Props) {
  const [imgError, setImgError] = useState(false);
  const borderRadius = Math.max(6, size * 0.18);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        style={{
          width: size, height: size, borderRadius,
          background: `linear-gradient(135deg, ${hero.color}33, ${hero.color}66)`,
          border: `1.5px solid ${hero.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!imgError && hero.cdnName ? (
          <img
            src={dotaAssets.getHeroIcon(hero.cdnName)}
            alt={hero.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        ) : (
          <span style={{ color: hero.color, fontSize: size * 0.3, fontWeight: 700, letterSpacing: -0.5 }}>
            {hero.short}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-white/70 text-center" style={{ fontSize: 10, lineHeight: 1.2, maxWidth: size + 8 }}>
          {hero.name}
        </span>
      )}
    </div>
  );
}

interface ItemIconProps {
  cdnName: string;
  name: string;
  color: string;
  size?: number;
}

export function ItemIcon({ cdnName, name, color, size = 36 }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const cdnUrl = dotaAssets.getItemIcon(cdnName);

  return (
    <div
      title={name}
      style={{
        width: size, height: size, borderRadius: Math.max(4, size * 0.18),
        background: imgError ? `${color}18` : '#1A1A1A',
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      {!imgError ? (
        <img
          src={cdnUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: Math.max(7, size * 0.22), color, fontWeight: 800 }}>
          {name.slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}

interface RoleTagProps {
  role: string;
  compact?: boolean;
}

export function RoleTag({ role, compact = false }: RoleTagProps) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'Carry':    { bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80', border: 'rgba(34,197,94,0.25)' },
    'Midlaner': { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', border: 'rgba(245,158,11,0.25)' },
    'Offlaner': { bg: 'rgba(239,68,68,0.12)',  text: '#F87171', border: 'rgba(239,68,68,0.25)' },
    'Pos 4':    { bg: 'rgba(96,165,250,0.12)', text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
    'Pos 5':    { bg: 'rgba(167,139,250,0.12)',text: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
  };
  const icons: Record<string, string> = {
    'Carry': '??', 'Midlaner': '??', 'Offlaner': '???', 'Pos 4': '??', 'Pos 5': '??',
  };
  const style = colors[role] ?? { bg: 'rgba(148,163,184,0.12)', text: '#94A3B8', border: 'rgba(148,163,184,0.25)' };
  const icon = icons[role] ?? '??';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: compact ? '1px 6px' : '2px 8px',
      borderRadius: 6,
      fontSize: compact ? 10 : 11,
      fontWeight: 600,
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {!compact && <span style={{ fontSize: 9 }}>{icon}</span>}
      {role}
    </span>
  );
}


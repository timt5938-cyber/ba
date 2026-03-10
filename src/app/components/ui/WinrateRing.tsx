import React from 'react';

interface Props {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function WinrateRing({ value, size = 80, strokeWidth = 6, color = '#FFFFFF', label, sublabel }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white leading-none" style={{ fontSize: size * 0.22, fontWeight: 600 }}>
            {value.toFixed(1)}
          </span>
          <span style={{ fontSize: size * 0.14, color: 'rgba(255,255,255,0.5)' }}>%</span>
        </div>
      </div>
      {label && <p className="text-white/60 text-center" style={{ fontSize: 11 }}>{label}</p>}
      {sublabel && <p className="text-white/40 text-center" style={{ fontSize: 10 }}>{sublabel}</p>}
    </div>
  );
}

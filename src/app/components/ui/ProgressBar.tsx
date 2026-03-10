import React from 'react';

interface Props {
  value: number;    // 0-100
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

export function ProgressBar({ value, max = 100, color = '#FFFFFF', height = 6, showLabel = false, label, animated = true }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-white/60" style={{ fontSize: 12 }}>{label}</span>}
          {showLabel && <span className="text-white/80" style={{ fontSize: 12, fontWeight: 600 }}>{value.toFixed(1)}{max === 100 ? '%' : `/${max}`}</span>}
        </div>
      )}
      <div style={{ height, background: 'rgba(255,255,255,0.08)', borderRadius: height }} className="w-full overflow-hidden">
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: height,
            transition: animated ? 'width 0.6s ease' : 'none',
          }}
        />
      </div>
    </div>
  );
}

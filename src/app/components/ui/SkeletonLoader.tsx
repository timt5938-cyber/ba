import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex gap-3">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonHeroRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

// inject shimmer keyframes
const style = document.createElement('style');
style.textContent = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
document.head.appendChild(style);

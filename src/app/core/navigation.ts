import type { NavigateFunction } from 'react-router';

function getHistoryIndex(): number {
  if (typeof window === 'undefined') return 0;
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === 'number' ? idx : 0;
}

export function safeBack(navigate: NavigateFunction, fallbackPath: string): void {
  if (getHistoryIndex() > 0) {
    navigate(-1);
    return;
  }
  navigate(fallbackPath);
}


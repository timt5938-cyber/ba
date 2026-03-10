import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = {
  success: <CheckCircle size={16} color="#4ADE80" />,
  error:   <XCircle size={16} color="#F87171" />,
  info:    <Info size={16} color="#60A5FA" />,
  warning: <AlertTriangle size={16} color="#FBBF24" />,
};

const COLORS = {
  success: '#4ADE80',
  error:   '#F87171',
  info:    '#60A5FA',
  warning: '#FBBF24',
};

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none" style={{ width: 'min(90vw, 380px)' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: '#1A1A1A',
            border: `1px solid ${COLORS[toast.type]}33`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${COLORS[toast.type]}15`,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {ICONS[toast.type]}
          <span className="text-white" style={{ fontSize: 13 }}>{toast.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

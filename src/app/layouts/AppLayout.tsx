import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { RightDrawer } from '../components/RightDrawer';
import { ToastContainer } from '../components/ToastContainer';
import { NativeBackHandler } from '../components/NativeBackHandler';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export function AppLayout() {
  const { isAuthenticated, showToast, syncNow } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const handleFAB = async () => {
    showToast('Синхронизация запущена...', 'info');
    const result = await syncNow();
    showToast(result.message || (result.status === 'success' ? 'Данные обновлены!' : 'Ошибка синхронизации'), result.status === 'success' ? 'success' : 'warning');
  };

  return (
    <div className="flex h-full w-full relative" style={{ background: '#080808' }}>
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          <Outlet />
        </main>
      </div>

      <RightDrawer />
      <NativeBackHandler />

      <button
        onClick={handleFAB}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center z-30 shadow-lg"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
      >
        <Plus size={22} color="white" />
      </button>

      <ToastContainer />
    </div>
  );
}


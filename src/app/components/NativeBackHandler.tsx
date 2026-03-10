import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useApp } from '../context/AppContext';

export function NativeBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { drawerOpen, setDrawerOpen } = useApp();

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (drawerOpen) {
        setDrawerOpen(false);
        return;
      }

      if (canGoBack) {
        navigate(-1);
        return;
      }

      if (location.pathname !== '/app/games' && location.pathname !== '/auth' && location.pathname !== '/') {
        navigate('/app/games');
        return;
      }

      CapacitorApp.exitApp();
    });

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, [drawerOpen, location.pathname, navigate, setDrawerOpen]);

  return null;
}

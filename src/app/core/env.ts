const readEnv = (key: string, fallback = ''): string => {
  try {
    return (import.meta as any)?.env?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

export const appEnv = {
  mode: readEnv('MODE', 'development'),
  isDev: readEnv('MODE', 'development') !== 'production',
  openDotaBaseUrl: readEnv('VITE_OPENDOTA_BASE_URL', 'https://api.opendota.com/api'),
  openDotaApiKey: readEnv('VITE_OPENDOTA_API_KEY', ''),
  enableLiveOpenDota: readEnv('VITE_ENABLE_LIVE_OPENDOTA', 'true') !== 'false',
  useProductionBackend: readEnv('VITE_USE_PRODUCTION_BACKEND', 'false') === 'true',
  backendBaseUrl: readEnv('VITE_BACKEND_BASE_URL', 'http://176.109.111.11:8080'),
};


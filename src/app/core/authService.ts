import { AuthSession, AuthUser, ForgotPasswordRequest, ResetCodePayload } from '../domain/types';
import { appEnv } from './env';
import { storage } from './storage';

interface StoredAuthState {
  users: Array<AuthUser & { password: string }>;
  resetCodes: Array<{ identity: string; code: string; expiresAt: string }>;
  session?: AuthSession;
}

const AUTH_KEY = 'dota_scope_auth_v1';

const createToken = () => `${Math.random().toString(36).slice(2)}.${Date.now()}`;

const readState = (): StoredAuthState => storage.get<StoredAuthState>(AUTH_KEY, {
  users: [],
  resetCodes: [],
});

const writeState = (state: StoredAuthState) => storage.set(AUTH_KEY, state);

const issueSession = (user: AuthUser): AuthSession => {
  const now = Date.now();
  return {
    user,
    accessToken: createToken(),
    refreshToken: createToken(),
    expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
  };
};

const toAuthUser = (raw: any): AuthUser => ({
  id: String(raw?.id ?? ''),
  email: raw?.email ?? undefined,
  username: raw?.username ?? raw?.display_name ?? 'user',
  createdAt: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
});

const apiBase = `${appEnv.backendBaseUrl.replace(/\/+$/, '')}/api`;

const backendRequest = async <T>(path: string, init: RequestInit = {}, token?: string): Promise<T> => {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(payload?.error || `Backend ${response.status}`);
  }
  return payload as T;
};

export const authService = {
  getSession(): AuthSession | undefined {
    const state = readState();
    const session = state.session;
    if (!session) return undefined;
    if (appEnv.useProductionBackend) {
      const isLikelyMockUser = String(session.user?.id || '').startsWith('u_');
      if (isLikelyMockUser) {
        delete state.session;
        writeState(state);
        return undefined;
      }
    }
    return session;
  },

  async register(params: { identity: string; password: string; username?: string }): Promise<AuthSession> {
    if (appEnv.useProductionBackend) {
      const payload = await backendRequest<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const session: AuthSession = {
        user: toAuthUser(payload.user),
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
      const state = readState();
      state.session = session;
      writeState(state);
      return session;
    }

    const state = readState();
    const identity = params.identity.trim().toLowerCase();
    const already = state.users.find(u => (u.email?.toLowerCase() === identity) || u.username.toLowerCase() === identity);
    if (already) throw new Error('Пользователь уже существует');
    const user: AuthUser & { password: string } = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      email: identity.includes('@') ? identity : undefined,
      username: params.username?.trim() || identity.split('@')[0] || identity,
      password: params.password,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    const session = issueSession(user);
    state.session = session;
    writeState(state);
    return session;
  },

  async login(params: { identity: string; password: string }): Promise<AuthSession> {
    if (appEnv.useProductionBackend) {
      const payload = await backendRequest<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const session: AuthSession = {
        user: toAuthUser(payload.user),
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
      const state = readState();
      state.session = session;
      writeState(state);
      return session;
    }

    const state = readState();
    const identity = params.identity.trim().toLowerCase();
    const user = state.users.find(u => (u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity) && u.password === params.password);
    if (!user) throw new Error('Неверные учетные данные');
    const session = issueSession(user);
    state.session = session;
    writeState(state);
    return session;
  },

  async logout(): Promise<void> {
    const state = readState();
    if (appEnv.useProductionBackend && state.session?.refreshToken) {
      try {
        await backendRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: state.session.refreshToken }),
        });
      } catch {
        // keep local cleanup even if network fails
      }
    }
    delete state.session;
    writeState(state);
  },

  async requestPasswordReset(payload: ForgotPasswordRequest): Promise<{ code: string }> {
    if (appEnv.useProductionBackend) {
      return backendRequest<{ code: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const state = readState();
    const identity = payload.identity.trim().toLowerCase();
    const userExists = state.users.some(u => u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity);
    if (!userExists) throw new Error('Пользователь не найден');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    state.resetCodes = state.resetCodes.filter(c => c.identity !== identity);
    state.resetCodes.push({
      identity,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    writeState(state);
    return { code };
  },

  async verifyResetCode(identity: string, code: string): Promise<boolean> {
    if (appEnv.useProductionBackend) return code.trim().length >= 4;
    const state = readState();
    const key = identity.trim().toLowerCase();
    const found = state.resetCodes.find(c => c.identity === key && c.code === code);
    if (!found) return false;
    return new Date(found.expiresAt).getTime() >= Date.now();
  },

  async resetPassword(payload: ResetCodePayload): Promise<void> {
    if (appEnv.useProductionBackend) {
      await backendRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return;
    }

    const state = readState();
    const identity = payload.identity.trim().toLowerCase();
    const codeOk = await this.verifyResetCode(identity, payload.code);
    if (!codeOk) throw new Error('Код сброса некорректен или истек');
    const user = state.users.find(u => u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity);
    if (!user) throw new Error('Пользователь не найден');
    user.password = payload.newPassword;
    state.resetCodes = state.resetCodes.filter(c => c.identity !== identity);
    writeState(state);
  },

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    if (appEnv.useProductionBackend) {
      const state = readState();
      const payload = await backendRequest<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      if (!state.session) throw new Error('Сессия недействительна');
      const nextSession: AuthSession = {
        ...state.session,
        accessToken: payload.accessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
      state.session = nextSession;
      writeState(state);
      return nextSession;
    }

    const state = readState();
    const session = state.session;
    if (!session || session.refreshToken !== refreshToken) throw new Error('Сессия недействительна');
    const nextSession = issueSession(session.user);
    state.session = nextSession;
    writeState(state);
    return nextSession;
  },
};

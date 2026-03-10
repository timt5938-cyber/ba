import { AuthSession, AuthUser, ForgotPasswordRequest, ResetCodePayload } from '../domain/types';
import { storage } from './storage';

interface StoredAuthState {
  users: Array<AuthUser & { password: string }>;
  resetCodes: Array<{ identity: string; code: string; expiresAt: string }>;
  session?: AuthSession;
}

const AUTH_KEY = 'dota_scope_auth_v1';

const createToken = () => `${Math.random().toString(36).slice(2)}.${Date.now()}`;

const readState = (): StoredAuthState => storage.get<StoredAuthState>(AUTH_KEY, {
  users: [
    {
      id: 'u_demo',
      email: 'demo@dotascope.dev',
      username: 'GhostBlade',
      password: '123456',
      createdAt: '2026-03-01T00:00:00.000Z',
    },
  ],
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

export const authService = {
  getSession(): AuthSession | undefined {
    return readState().session;
  },

  async register(params: { identity: string; password: string; username?: string }): Promise<AuthSession> {
    const state = readState();
    const identity = params.identity.trim().toLowerCase();
    const already = state.users.find(u => (u.email?.toLowerCase() === identity) || u.username.toLowerCase() === identity);
    if (already) {
      throw new Error('Пользователь уже существует');
    }
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
    const state = readState();
    const identity = params.identity.trim().toLowerCase();
    const user = state.users.find(u => (u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity) && u.password === params.password);
    if (!user) {
      throw new Error('Неверные учетные данные');
    }
    const session = issueSession(user);
    state.session = session;
    writeState(state);
    return session;
  },

  async logout(): Promise<void> {
    const state = readState();
    delete state.session;
    writeState(state);
  },

  async requestPasswordReset(payload: ForgotPasswordRequest): Promise<{ code: string }> {
    const state = readState();
    const identity = payload.identity.trim().toLowerCase();
    const userExists = state.users.some(u => u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity);
    if (!userExists) {
      throw new Error('Пользователь не найден');
    }
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
    const state = readState();
    const key = identity.trim().toLowerCase();
    const found = state.resetCodes.find(c => c.identity === key && c.code === code);
    if (!found) return false;
    if (new Date(found.expiresAt).getTime() < Date.now()) return false;
    return true;
  },

  async resetPassword(payload: ResetCodePayload): Promise<void> {
    const state = readState();
    const identity = payload.identity.trim().toLowerCase();
    const codeOk = await this.verifyResetCode(identity, payload.code);
    if (!codeOk) {
      throw new Error('Код сброса некорректен или истек');
    }
    const user = state.users.find(u => u.email?.toLowerCase() === identity || u.username.toLowerCase() === identity);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    user.password = payload.newPassword;
    state.resetCodes = state.resetCodes.filter(c => c.identity !== identity);
    writeState(state);
  },

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    const state = readState();
    const session = state.session;
    if (!session || session.refreshToken !== refreshToken) {
      throw new Error('Сессия недействительна');
    }
    const nextSession = issueSession(session.user);
    state.session = nextSession;
    writeState(state);
    return nextSession;
  },
};


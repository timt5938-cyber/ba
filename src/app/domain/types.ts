export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface ForgotPasswordRequest {
  identity: string;
}

export interface ResetCodePayload {
  identity: string;
  code: string;
  newPassword: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: SyncStatus;
  startedAt: string;
  completedAt?: string;
  message?: string;
  fetchedMatches?: number;
}

export interface SteamBindingResult {
  profileUrl: string;
  vanityName?: string;
  steamId64?: string;
  displayName?: string;
  avatar?: string;
}

export interface DotaStaticsEntity {
  id: number | string;
  name: string;
  shortName?: string;
  localizedName?: string;
  slug?: string;
  icon?: string;
}

export interface DotaStatics {
  heroesById: Record<number, DotaStaticsEntity>;
  itemsById: Record<number, DotaStaticsEntity>;
  abilitiesById: Record<number, DotaStaticsEntity>;
  regionsById: Record<number, DotaStaticsEntity>;
  gameModesById: Record<number, DotaStaticsEntity>;
  patches: DotaStaticsEntity[];
}

export interface ExportBundle {
  summary: string;
  analyticsCsv: string;
  matchesCsv: string;
  buildsCsv: string;
  generatedAt: string;
}


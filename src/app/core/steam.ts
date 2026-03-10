import { SteamBindingResult } from '../domain/types';

const STEAM_PROFILE_RE = /^https:\/\/steamcommunity\.com\/(id|profiles)\/([^/?#]+)\/?/i;

export function parseSteamProfileUrl(input: string): { kind: 'id' | 'profiles'; value: string; normalizedUrl: string } | null {
  const trimmed = input.trim();
  const match = trimmed.match(STEAM_PROFILE_RE);
  if (!match) return null;
  const kind = match[1].toLowerCase() as 'id' | 'profiles';
  const value = match[2];
  return {
    kind,
    value,
    normalizedUrl: `https://steamcommunity.com/${kind}/${value}/`,
  };
}

export async function resolveSteamProfile(inputUrl: string): Promise<SteamBindingResult> {
  const parsed = parseSteamProfileUrl(inputUrl);
  if (!parsed) {
    throw new Error('Некорректная ссылка Steam профиля');
  }

  const xmlUrl = `${parsed.normalizedUrl}?xml=1`;
  const res = await fetch(xmlUrl);
  if (!res.ok) {
    throw new Error('Не удалось получить публичный Steam профиль');
  }
  const xml = await res.text();

  const pick = (tag: string): string | undefined => {
    const rx = new RegExp(`<${tag}>([^<]+)<\/${tag}>`, 'i');
    return xml.match(rx)?.[1];
  };

  return {
    profileUrl: parsed.normalizedUrl,
    vanityName: parsed.kind === 'id' ? parsed.value : undefined,
    steamId64: pick('steamID64') || (parsed.kind === 'profiles' ? parsed.value : undefined),
    displayName: pick('steamID'),
    avatar: pick('avatarFull') || pick('avatarMedium') || pick('avatarIcon'),
  };
}


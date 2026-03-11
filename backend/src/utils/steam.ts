const steamRegex = /^https?:\/\/steamcommunity\.com\/(id|profiles)\/([^\/\?#]+)\/?/i;

export type SteamParsed = {
  profileUrl: string;
  type: 'id' | 'profiles';
  value: string;
};

export type SteamProfileResolved = {
  profileUrl: string;
  vanityName?: string;
  steamId64?: string;
  displayName?: string;
  avatar?: string;
};

export function parseSteamUrl(url: string): SteamParsed {
  const normalized = url.trim();
  const match = normalized.match(steamRegex);
  if (!match) {
    throw new Error('Invalid Steam profile URL');
  }

  const type = match[1].toLowerCase() as 'id' | 'profiles';
  const value = match[2];

  return {
    profileUrl: `https://steamcommunity.com/${type}/${value}/`,
    type,
    value,
  };
}

export async function resolveSteamProfile(url: string): Promise<SteamProfileResolved> {
  const parsed = parseSteamUrl(url);
  const xmlUrl = `${parsed.profileUrl}?xml=1`;
  const res = await fetch(xmlUrl);
  if (!res.ok) throw new Error('Steam profile is not reachable');
  const xml = await res.text();

  const pick = (tag: string): string | undefined => {
    const rx = new RegExp(`<${tag}>([^<]+)<\\/${tag}>`, 'i');
    return xml.match(rx)?.[1];
  };

  return {
    profileUrl: parsed.profileUrl,
    vanityName: parsed.type === 'id' ? parsed.value : undefined,
    steamId64: pick('steamID64') || (parsed.type === 'profiles' ? parsed.value : undefined),
    displayName: pick('steamID'),
    avatar: pick('avatarFull') || pick('avatarMedium') || pick('avatarIcon'),
  };
}

export function steamId64ToAccountId(steamId64: string): number {
  const normalized = steamId64.trim();
  if (!/^\d{17}$/.test(normalized)) {
    throw new Error('Invalid steam_id64 format');
  }
  const base = BigInt('76561197960265728');
  const accountId = Number(BigInt(normalized) - base);
  if (!Number.isFinite(accountId) || accountId <= 0) {
    throw new Error('Invalid OpenDota account_id derived from steam_id64');
  }
  return accountId;
}

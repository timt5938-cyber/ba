// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeType = 'bw' | 'red' | 'green';

export interface Hero {
  id: string;
  name: string;
  short: string;
  attr: 'str' | 'agi' | 'int' | 'uni';
  color: string;
  roles: string[];
  cdnName: string; // OpenDota / Steam CDN name
}

export interface Item {
  id: string;
  name: string;
  cost: number;
  color: string;
  cdnName: string; // OpenDota item CDN name
}

export interface Aspect {
  name: string;
  description: string;
  recommended: boolean;
  effect: string;
}

export interface BuildAnalysis {
  whyThisBuild: string;
  playerErrors: string[];
  strengths: string[];
  improvements: string[];
  timingErrors: string[];
}

export interface Match {
  id: string;
  hero: Hero;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  duration: number;
  gpm: number;
  xpm: number;
  lastHits: number;
  denies: number;
  heroDamage: number;
  towerDamage: number;
  healing: number;
  netWorth: number;
  rank: string;
  date: string;
  role: string;
  lane: string;
  side: 'radiant' | 'dire';
  patch: string;
  gameMode: string;
  region: string;
  items: Item[];
  performance: number;
  kdaRatio: number;
}

export interface HeroStat {
  hero: Hero;
  matches: number;
  wins: number;
  losses: number;
  winrate: number;
  avgKDA: number;
  avgGPM: number;
  avgXPM: number;
  lastPlayed: string;
}

export interface Build {
  id: string;
  hero: Hero;
  role: string;
  lane: string;
  winrate: number;
  popularity: number;
  patch: string;
  startingItems: Item[];
  coreItems: Item[];
  situationalItems: Item[];
  lategameItems: Item[];
  talents: string[];
  skillBuild: { level: number; skill: string }[];
  why: string;
  tips: string[];
  analysis: BuildAnalysis;
  aspects: Aspect[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  type: 'winrate' | 'kda' | 'matches' | 'deaths' | 'streak';
  deadline?: string;
  completed: boolean;
  streak: number;
}

export interface Notification {
  id: string;
  type: 'match' | 'stat' | 'build' | 'warning' | 'system' | 'sync';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Player {
  id: string;
  name: string;
  steamId: string;
  steamUrl: string;
  rank: string;
  rankTier: number;
  mmr: number;
  wins: number;
  losses: number;
  totalMatches: number;
  winrate: number;
  avgKDA: number;
  avgGPM: number;
  avgXPM: number;
  avgDuration: number;
  lastSync: string;
  registeredAt: string;
  country: string;
  lastMatch: string;
}

export interface SteamAccount {
  id: string;
  name: string;
  steamId: string;
  steamUrl: string;
  rank: string;
  rankTier: number;
  mmr: number;
  winrate: number;
  totalMatches: number;
  wins: number;
  losses: number;
  lastSync: string;
  active: boolean;
  country: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getHeroCdnUrl(cdnName: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cdnName}_horz.jpg`;
}

export function getItemCdnUrl(cdnName: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cdnName}.png`;
}

export function getRankIconUrl(tier: number): string {
  const rank = Math.floor(tier / 10);
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${rank}.png`;
}

// ─── Hero Definitions ─────────────────────────────────────────────────────────

export const HEROES: Record<string, Hero> = {
  invoker:  { id: 'invoker',  name: 'Invoker',           short: 'INV', attr: 'uni', color: '#F59E0B', roles: ['Midlaner', 'Carry'],        cdnName: 'invoker' },
  pudge:    { id: 'pudge',    name: 'Pudge',              short: 'PDG', attr: 'str', color: '#EF4444', roles: ['Pos 4', 'Offlaner'],         cdnName: 'pudge' },
  antimage: { id: 'antimage', name: 'Anti-Mage',          short: 'AM',  attr: 'agi', color: '#8B5CF6', roles: ['Carry'],                     cdnName: 'antimage' },
  crystal:  { id: 'crystal',  name: 'Crystal Maiden',     short: 'CM',  attr: 'int', color: '#60A5FA', roles: ['Pos 5'],                     cdnName: 'crystal_maiden' },
  axe:      { id: 'axe',      name: 'Axe',                short: 'AXE', attr: 'str', color: '#DC2626', roles: ['Offlaner'],                  cdnName: 'axe' },
  jugg:     { id: 'jugg',     name: 'Juggernaut',         short: 'JUG', attr: 'agi', color: '#22C55E', roles: ['Carry'],                     cdnName: 'juggernaut' },
  sf:       { id: 'sf',       name: 'Shadow Fiend',       short: 'SF',  attr: 'agi', color: '#EC4899', roles: ['Midlaner', 'Carry'],         cdnName: 'nevermore' },
  void:     { id: 'void',     name: 'Faceless Void',      short: 'FV',  attr: 'agi', color: '#6366F1', roles: ['Carry'],                     cdnName: 'faceless_void' },
  qop:      { id: 'qop',      name: 'Queen of Pain',      short: 'QoP', attr: 'int', color: '#A855F7', roles: ['Midlaner'],                  cdnName: 'queenofpain' },
  lion:     { id: 'lion',     name: 'Lion',               short: 'LIO', attr: 'int', color: '#F97316', roles: ['Pos 5'],                     cdnName: 'lion' },
  rubick:   { id: 'rubick',   name: 'Rubick',             short: 'RUB', attr: 'int', color: '#14B8A6', roles: ['Pos 4'],                     cdnName: 'rubick' },
  lina:     { id: 'lina',     name: 'Lina',               short: 'LIN', attr: 'int', color: '#F43F5E', roles: ['Midlaner', 'Pos 5'],         cdnName: 'lina' },
  wr:       { id: 'wr',       name: 'Windranger',         short: 'WR',  attr: 'uni', color: '#84CC16', roles: ['Midlaner', 'Pos 4'],         cdnName: 'windrunner' },
  pa:       { id: 'pa',       name: 'Phantom Assassin',   short: 'PA',  attr: 'agi', color: '#E879F9', roles: ['Carry'],                     cdnName: 'phantom_assassin' },
  dk:       { id: 'dk',       name: 'Dragon Knight',      short: 'DK',  attr: 'str', color: '#D97706', roles: ['Midlaner', 'Offlaner'],      cdnName: 'dragon_knight' },
  es:       { id: 'es',       name: 'Earthshaker',        short: 'ES',  attr: 'str', color: '#92400E', roles: ['Pos 4', 'Pos 5'],            cdnName: 'earthshaker' },
  tide:     { id: 'tide',     name: 'Tidehunter',         short: 'TH',  attr: 'str', color: '#0284C7', roles: ['Offlaner', 'Pos 4'],         cdnName: 'tidehunter' },
};

// ─── Item Definitions ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, Item> = {
  bkb:        { id: 'bkb',        name: 'BKB',            cost: 4050, color: '#F59E0B', cdnName: 'black_king_bar' },
  linkens:    { id: 'linkens',    name: "Linken's",        cost: 5050, color: '#6366F1', cdnName: 'linken_sphere' },
  bfury:      { id: 'bfury',      name: 'Battlefury',      cost: 4700, color: '#F97316', cdnName: 'battle_fury' },
  manta:      { id: 'manta',      name: 'Manta Style',     cost: 4100, color: '#22C55E', cdnName: 'manta' },
  aghs:       { id: 'aghs',       name: "Aghanim's",       cost: 4200, color: '#A855F7', cdnName: 'ultimate_scepter' },
  desolator:  { id: 'desolator',  name: 'Desolator',       cost: 3500, color: '#EF4444', cdnName: 'desolator' },
  butterfly:  { id: 'butterfly',  name: 'Butterfly',       cost: 4975, color: '#3B82F6', cdnName: 'butterfly' },
  mkb:        { id: 'mkb',        name: 'MKB',             cost: 4000, color: '#DC2626', cdnName: 'monkey_king_bar' },
  daedalus:   { id: 'daedalus',   name: 'Daedalus',        cost: 5150, color: '#F59E0B', cdnName: 'greater_crit' },
  satanic:    { id: 'satanic',    name: 'Satanic',         cost: 5050, color: '#7C3AED', cdnName: 'satanic' },
  blink:      { id: 'blink',      name: 'Blink Dagger',    cost: 2250, color: '#60A5FA', cdnName: 'blink' },
  shadow:     { id: 'shadow',     name: 'Shadow Blade',    cost: 3000, color: '#4B5563', cdnName: 'invis_sword' },
  travels:    { id: 'travels',    name: 'BoT',             cost: 2450, color: '#D97706', cdnName: 'travel_boots' },
  phase:      { id: 'phase',      name: 'Phase Boots',     cost: 1500, color: '#F97316', cdnName: 'phase_boots' },
  treads:     { id: 'treads',     name: 'Treads',          cost: 1400, color: '#6B7280', cdnName: 'power_treads' },
  ward:       { id: 'ward',       name: 'Obs Ward',        cost: 0,    color: '#84CC16', cdnName: 'ward_observer' },
  smoke:      { id: 'smoke',      name: 'Smoke',           cost: 75,   color: '#6366F1', cdnName: 'smoke_of_deceit' },
  dust:       { id: 'dust',       name: 'Sentry',          cost: 50,   color: '#F59E0B', cdnName: 'ward_sentry' },
  tp:         { id: 'tp',         name: 'TP Scroll',       cost: 100,  color: '#22C55E', cdnName: 'tpscroll' },
  clarity:    { id: 'clarity',    name: 'Clarity',         cost: 50,   color: '#93C5FD', cdnName: 'clarity' },
  veil:       { id: 'veil',       name: 'Veil of Discord', cost: 1525, color: '#A855F7', cdnName: 'veil_of_discord' },
  glimmer:    { id: 'glimmer',    name: 'Glimmer Cape',    cost: 1850, color: '#818CF8', cdnName: 'glimmer_cape' },
  force:      { id: 'force',      name: 'Force Staff',     cost: 2200, color: '#34D399', cdnName: 'force_staff' },
  lotus:      { id: 'lotus',      name: 'Lotus Orb',       cost: 3500, color: '#10B981', cdnName: 'lotus_orb' },
};

// ─── Steam Accounts ───────────────────────────────────────────────────────────

export const STEAM_ACCOUNTS: SteamAccount[] = [
  {
    id: '76561198012345678',
    name: 'GhostBlade',
    steamId: 'thposw',
    steamUrl: 'https://steamcommunity.com/id/thposw/',
    rank: 'Immortal',
    rankTier: 82,
    mmr: 7350,
    winrate: 54.9,
    totalMatches: 5188,
    wins: 2847,
    losses: 2341,
    lastSync: '2026-03-10T08:30:00',
    active: true,
    country: 'RU',
  },
  {
    id: '76561198044441234',
    name: 'GhostBlade_Alt',
    steamId: 'ghostblade_alt',
    steamUrl: 'https://steamcommunity.com/id/ghostblade_alt/',
    rank: 'Divine',
    rankTier: 75,
    mmr: 5680,
    winrate: 51.2,
    totalMatches: 1247,
    wins: 638,
    losses: 609,
    lastSync: '2026-03-08T14:00:00',
    active: false,
    country: 'RU',
  },
];

// ─── Mock Player ──────────────────────────────────────────────────────────────

export const PLAYER: Player = {
  id: '76561198012345678',
  name: 'GhostBlade',
  steamId: 'thposw',
  steamUrl: 'https://steamcommunity.com/id/thposw/',
  rank: 'Immortal',
  rankTier: 82,
  mmr: 7350,
  wins: 2847,
  losses: 2341,
  totalMatches: 5188,
  winrate: 54.9,
  avgKDA: 3.42,
  avgGPM: 612,
  avgXPM: 588,
  avgDuration: 38,
  lastSync: '2026-03-10T08:30:00',
  registeredAt: '2024-01-15',
  country: 'RU',
  lastMatch: '2026-03-09T22:15:00',
};

// ─── Mock Matches ─────────────────────────────────────────────────────────────

export const MATCHES: Match[] = [
  {
    id: '7891234567', hero: HEROES.invoker, result: 'win', kills: 12, deaths: 2, assists: 8,
    duration: 2520, gpm: 748, xpm: 812, lastHits: 312, denies: 18, heroDamage: 48200,
    towerDamage: 12400, healing: 0, netWorth: 28400, rank: 'Immortal', date: '2026-03-09T22:15:00',
    role: 'Midlaner', lane: 'Mid', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.shadow, ITEMS.travels, ITEMS.bkb, ITEMS.aghs, ITEMS.daedalus, ITEMS.linkens],
    performance: 91, kdaRatio: 10.0,
  },
  {
    id: '7891234566', hero: HEROES.pa, result: 'win', kills: 18, deaths: 3, assists: 4,
    duration: 1980, gpm: 812, xpm: 756, lastHits: 380, denies: 12, heroDamage: 61200,
    towerDamage: 8200, healing: 0, netWorth: 31200, rank: 'Immortal', date: '2026-03-09T19:40:00',
    role: 'Carry', lane: 'Safe', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.treads, ITEMS.bfury, ITEMS.bkb, ITEMS.daedalus, ITEMS.butterfly, ITEMS.satanic],
    performance: 96, kdaRatio: 7.33,
  },
  {
    id: '7891234565', hero: HEROES.axe, result: 'loss', kills: 5, deaths: 8, assists: 12,
    duration: 3120, gpm: 498, xpm: 512, lastHits: 142, denies: 6, heroDamage: 24100,
    towerDamage: 3400, healing: 0, netWorth: 16800, rank: 'Immortal', date: '2026-03-09T17:00:00',
    role: 'Offlaner', lane: 'Off', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.phase, ITEMS.blink, ITEMS.aghs, ITEMS.bkb, ITEMS.travels, ITEMS.satanic],
    performance: 48, kdaRatio: 2.13,
  },
  {
    id: '7891234564', hero: HEROES.sf, result: 'win', kills: 14, deaths: 4, assists: 6,
    duration: 2280, gpm: 698, xpm: 780, lastHits: 295, denies: 22, heroDamage: 52800,
    towerDamage: 9600, healing: 0, netWorth: 26100, rank: 'Immortal', date: '2026-03-09T14:20:00',
    role: 'Midlaner', lane: 'Mid', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.shadow, ITEMS.desolator, ITEMS.bkb, ITEMS.daedalus, ITEMS.mkb, ITEMS.travels],
    performance: 82, kdaRatio: 5.0,
  },
  {
    id: '7891234563', hero: HEROES.void, result: 'loss', kills: 8, deaths: 6, assists: 9,
    duration: 2880, gpm: 641, xpm: 598, lastHits: 266, denies: 8, heroDamage: 38400,
    towerDamage: 5200, healing: 0, netWorth: 22600, rank: 'Immortal', date: '2026-03-08T21:50:00',
    role: 'Carry', lane: 'Safe', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.treads, ITEMS.manta, ITEMS.butterfly, ITEMS.bkb, ITEMS.linkens, ITEMS.satanic],
    performance: 62, kdaRatio: 2.83,
  },
  {
    id: '7891234562', hero: HEROES.rubick, result: 'win', kills: 3, deaths: 5, assists: 22,
    duration: 2640, gpm: 412, xpm: 448, lastHits: 78, denies: 3, heroDamage: 16200,
    towerDamage: 2400, healing: 820, netWorth: 14200, rank: 'Immortal', date: '2026-03-08T18:30:00',
    role: 'Pos 4', lane: 'Safe', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.travels, ITEMS.ward, ITEMS.smoke, ITEMS.dust],
    performance: 74, kdaRatio: 5.0,
  },
  {
    id: '7891234561', hero: HEROES.invoker, result: 'win', kills: 16, deaths: 3, assists: 11,
    duration: 2100, gpm: 724, xpm: 798, lastHits: 328, denies: 28, heroDamage: 54600,
    towerDamage: 14200, healing: 0, netWorth: 27800, rank: 'Immortal', date: '2026-03-08T15:00:00',
    role: 'Midlaner', lane: 'Mid', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.travels, ITEMS.aghs, ITEMS.bkb, ITEMS.daedalus, ITEMS.linkens, ITEMS.satanic],
    performance: 94, kdaRatio: 9.0,
  },
  {
    id: '7891234560', hero: HEROES.lina, result: 'loss', kills: 6, deaths: 9, assists: 14,
    duration: 3360, gpm: 488, xpm: 502, lastHits: 162, denies: 4, heroDamage: 32100,
    towerDamage: 4600, healing: 0, netWorth: 18400, rank: 'Immortal', date: '2026-03-07T22:10:00',
    role: 'Pos 5', lane: 'Safe', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.daedalus, ITEMS.travels, ITEMS.ward, ITEMS.smoke],
    performance: 45, kdaRatio: 2.22,
  },
  {
    id: '7891234559', hero: HEROES.antimage, result: 'win', kills: 11, deaths: 2, assists: 6,
    duration: 2760, gpm: 862, xpm: 788, lastHits: 412, denies: 14, heroDamage: 44200,
    towerDamage: 18600, healing: 0, netWorth: 34800, rank: 'Immortal', date: '2026-03-07T19:30:00',
    role: 'Carry', lane: 'Safe', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.travels, ITEMS.bfury, ITEMS.manta, ITEMS.butterfly, ITEMS.bkb, ITEMS.satanic],
    performance: 89, kdaRatio: 8.5,
  },
  {
    id: '7891234558', hero: HEROES.qop, result: 'win', kills: 19, deaths: 4, assists: 9,
    duration: 1920, gpm: 688, xpm: 742, lastHits: 246, denies: 16, heroDamage: 58400,
    towerDamage: 7800, healing: 0, netWorth: 24600, rank: 'Immortal', date: '2026-03-07T16:00:00',
    role: 'Midlaner', lane: 'Mid', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.bkb, ITEMS.daedalus, ITEMS.linkens, ITEMS.travels],
    performance: 95, kdaRatio: 7.0,
  },
  {
    id: '7891234557', hero: HEROES.es, result: 'win', kills: 4, deaths: 4, assists: 24,
    duration: 2160, gpm: 368, xpm: 382, lastHits: 62, denies: 2, heroDamage: 18200,
    towerDamage: 3200, healing: 0, netWorth: 12400, rank: 'Immortal', date: '2026-03-06T21:20:00',
    role: 'Pos 4', lane: 'Off', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.travels, ITEMS.bkb, ITEMS.ward, ITEMS.smoke],
    performance: 78, kdaRatio: 7.0,
  },
  {
    id: '7891234556', hero: HEROES.dk, result: 'loss', kills: 7, deaths: 7, assists: 8,
    duration: 2880, gpm: 512, xpm: 528, lastHits: 188, denies: 9, heroDamage: 26400,
    towerDamage: 11200, healing: 0, netWorth: 19200, rank: 'Immortal', date: '2026-03-06T18:40:00',
    role: 'Midlaner', lane: 'Mid', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.phase, ITEMS.bkb, ITEMS.aghs, ITEMS.travels, ITEMS.daedalus, ITEMS.linkens],
    performance: 54, kdaRatio: 2.14,
  },
  {
    id: '7891234555', hero: HEROES.wr, result: 'win', kills: 9, deaths: 3, assists: 16,
    duration: 2400, gpm: 548, xpm: 564, lastHits: 198, denies: 11, heroDamage: 34600,
    towerDamage: 6400, healing: 0, netWorth: 21200, rank: 'Immortal', date: '2026-03-05T20:00:00',
    role: 'Midlaner', lane: 'Mid', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.phase, ITEMS.aghs, ITEMS.bkb, ITEMS.daedalus, ITEMS.linkens, ITEMS.travels],
    performance: 81, kdaRatio: 8.33,
  },
  {
    id: '7891234554', hero: HEROES.pudge, result: 'win', kills: 8, deaths: 6, assists: 18,
    duration: 2760, gpm: 398, xpm: 412, lastHits: 82, denies: 4, heroDamage: 22400,
    towerDamage: 2800, healing: 2400, netWorth: 15200, rank: 'Immortal', date: '2026-03-05T17:20:00',
    role: 'Pos 4', lane: 'Roam', side: 'dire', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.bkb, ITEMS.satanic, ITEMS.travels, ITEMS.ward],
    performance: 66, kdaRatio: 4.33,
  },
  {
    id: '7891234553', hero: HEROES.lion, result: 'loss', kills: 2, deaths: 10, assists: 12,
    duration: 3240, gpm: 342, xpm: 358, lastHits: 52, denies: 1, heroDamage: 14200,
    towerDamage: 1800, healing: 0, netWorth: 10800, rank: 'Immortal', date: '2026-03-04T22:30:00',
    role: 'Pos 5', lane: 'Safe', side: 'radiant', patch: '7.38', gameMode: 'Ranked All Pick',
    region: 'Europe East', items: [ITEMS.blink, ITEMS.aghs, ITEMS.travels, ITEMS.ward, ITEMS.smoke, ITEMS.dust],
    performance: 32, kdaRatio: 1.40,
  },
];

// ─── Hero Stats ───────────────────────────────────────────────────────────────

export const HERO_STATS: HeroStat[] = [
  { hero: HEROES.invoker,  matches: 248, wins: 158, losses: 90,  winrate: 63.7, avgKDA: 5.82, avgGPM: 718, avgXPM: 794, lastPlayed: '2026-03-09' },
  { hero: HEROES.pa,       matches: 186, wins: 112, losses: 74,  winrate: 60.2, avgKDA: 6.44, avgGPM: 784, avgXPM: 742, lastPlayed: '2026-03-09' },
  { hero: HEROES.sf,       matches: 162, wins: 98,  losses: 64,  winrate: 60.5, avgKDA: 5.12, avgGPM: 672, avgXPM: 758, lastPlayed: '2026-03-09' },
  { hero: HEROES.antimage, matches: 144, wins: 84,  losses: 60,  winrate: 58.3, avgKDA: 7.14, avgGPM: 838, avgXPM: 768, lastPlayed: '2026-03-07' },
  { hero: HEROES.qop,      matches: 138, wins: 82,  losses: 56,  winrate: 59.4, avgKDA: 6.28, avgGPM: 654, avgXPM: 712, lastPlayed: '2026-03-07' },
  { hero: HEROES.wr,       matches: 116, wins: 66,  losses: 50,  winrate: 56.9, avgKDA: 5.64, avgGPM: 528, avgXPM: 554, lastPlayed: '2026-03-05' },
  { hero: HEROES.void,     matches: 108, wins: 58,  losses: 50,  winrate: 53.7, avgKDA: 4.18, avgGPM: 618, avgXPM: 578, lastPlayed: '2026-03-08' },
  { hero: HEROES.rubick,   matches: 94,  wins: 52,  losses: 42,  winrate: 55.3, avgKDA: 4.82, avgGPM: 398, avgXPM: 438, lastPlayed: '2026-03-08' },
  { hero: HEROES.axe,      matches: 88,  wins: 44,  losses: 44,  winrate: 50.0, avgKDA: 2.98, avgGPM: 488, avgXPM: 502, lastPlayed: '2026-03-09' },
  { hero: HEROES.dk,       matches: 76,  wins: 38,  losses: 38,  winrate: 50.0, avgKDA: 3.24, avgGPM: 512, avgXPM: 528, lastPlayed: '2026-03-06' },
  { hero: HEROES.lina,     matches: 72,  wins: 34,  losses: 38,  winrate: 47.2, avgKDA: 3.68, avgGPM: 468, avgXPM: 488, lastPlayed: '2026-03-07' },
  { hero: HEROES.pudge,    matches: 64,  wins: 30,  losses: 34,  winrate: 46.9, avgKDA: 3.12, avgGPM: 382, avgXPM: 402, lastPlayed: '2026-03-05' },
];

// ─── Builds ───────────────────────────────────────────────────────────────────

export const BUILDS: Build[] = [
  {
    id: 'b1', hero: HEROES.invoker, role: 'Midlaner', lane: 'Mid', winrate: 64.8, popularity: 92, patch: '7.38',
    startingItems: [ITEMS.clarity, ITEMS.tp],
    coreItems:     [ITEMS.travels, ITEMS.aghs, ITEMS.bkb],
    situationalItems: [ITEMS.linkens, ITEMS.daedalus, ITEMS.satanic],
    lategameItems: [ITEMS.daedalus, ITEMS.mkb, ITEMS.butterfly],
    talents: [
      'Ур. 10: +80 урона Invoker',
      'Ур. 15: −1.5с Cold Snap',
      'Ур. 20: +60% урона Chaos Meteor',
      'Ур. 25: Sunstrike сжигает 15% маны',
    ],
    skillBuild: [
      { level: 1, skill: 'Exort (Q·Q·Q)' },
      { level: 2, skill: 'Exort (Q·Q·Q)' },
      { level: 3, skill: 'Quas (W·W·W)' },
      { level: 4, skill: 'Invoke' },
      { level: 5, skill: 'Exort' },
      { level: 6, skill: 'Exort' },
      { level: 7, skill: 'Invoke' },
    ],
    why: 'Сборка максимизирует burst damage через Chaos Meteor + Cold Snap. Aghanim\'s открывает Deafening Blast, BKB защищает от контроля.',
    tips: [
      'В 248 матчах на Invoker твой пик GPM — 748, а среднее — 718. Основная потеря фарма на 12−18 минуте',
      'Покупай BKB раньше в высоком MMR — ты умираешь от бёрстов без него в 62% проигрышей',
      'EMP до Meteor combo — обязательно. Без дрейна маны урон снижается на 28%',
    ],
    analysis: {
      whyThisBuild: 'В 63.7% твоих проигрышей на Invoker ты покупал Shadow Blade вместо Travels. Это задерживает Aghanim\'s на 3−5 минут и лишает тебя глобального присутствия. Данная сборка исправляет твой типичный item path.',
      playerErrors: [
        'Shadow Blade вместо Travels в 41% матчей — теряешь 180-220 GPM за счёт меньшей мобильности',
        'BKB покупается после 25 минуты в 58% матчей, тогда как оптимально — до 22 минуты',
        'EMP редко используется как харасс на мид лайне — в среднем 1.2 каста против оптимальных 3-4',
        'Invoke в начале матча не привязан к ротации — ты жертвуешь 2-3 сейвами за игру',
      ],
      strengths: [
        'Твой Chaos Meteor + Cold Snap combo выше среднего по серверу на 18%',
        'GPM в winning матчах 748 — это топ-8% Immortal сегмента на Invoker',
        'Отличный тайминг Sunstrike по целям в 70% активаций — точность выше нормы',
      ],
      improvements: [
        'Переходи на Boots of Travel как основные сапоги — это решит проблему присутствия на карте',
        'Приоритизируй BKB на 20-22 минуте, даже если нужно пропустить один стак лагеря',
        'Используй EMP как харасс на лайне, не только в комбо — это даст тебе доминирование на мид',
      ],
      timingErrors: [
        'Aghanim\'s Scepter — твой текущий тайминг 22 мин, цель 18 мин',
        'BKB — текущий тайминг 28 мин, цель 22 мин',
        'Boots of Travel — текущий тайминг 16 мин, цель 14 мин',
      ],
    },
    aspects: [
      { name: 'Invoker Agnostic', description: 'Нейтральный аспект — равномерный доступ ко всем заклинаниям', recommended: false, effect: 'Все комбинации доступны' },
      { name: 'Cold Focus', description: 'Усиливает Quas заклинания — больший Cold Snap контроль', recommended: true, effect: '+15% урон Cold Snap, −0.5с CD' },
      { name: 'Sun\'s Wrath', description: 'Усиливает Exort — больший burst через Sunstrike', recommended: false, effect: '+20% урон Sunstrike' },
    ],
  },
  {
    id: 'b2', hero: HEROES.pa, role: 'Carry', lane: 'Safe', winrate: 61.2, popularity: 88, patch: '7.38',
    startingItems: [ITEMS.treads, ITEMS.tp],
    coreItems:     [ITEMS.bfury, ITEMS.bkb, ITEMS.daedalus],
    situationalItems: [ITEMS.butterfly, ITEMS.mkb, ITEMS.satanic],
    lategameItems: [ITEMS.butterfly, ITEMS.satanic, ITEMS.aghs],
    talents: [
      'Ур. 10: +25 урона PA',
      'Ур. 15: +12% шанс Coup de Grace',
      'Ур. 20: −5с КД Phantom Strike',
      'Ур. 25: Blur — полная невидимость',
    ],
    skillBuild: [
      { level: 1, skill: 'Stifling Dagger' },
      { level: 2, skill: 'Phantom Strike' },
      { level: 3, skill: 'Stifling Dagger' },
      { level: 4, skill: 'Blur' },
      { level: 5, skill: 'Stifling Dagger' },
      { level: 6, skill: 'Coup de Grace' },
      { level: 7, skill: 'Stifling Dagger' },
    ],
    why: 'Battlefury дает фарм и cleave, BKB защищает от контроля, Daedalus максимизирует крит. Butterfly — evasion против physical carry.',
    tips: [
      'Rush Battlefury, игнорируя ранние драки — твой breakeven по фарму на 14 минуте',
      'BKB обязателен против команды с CC — в твоих матчах 71% смертей без него от цепных контролей',
      'MKB против Butterfly heroes — не игнорируй его как ситуативный',
    ],
    analysis: {
      whyThisBuild: 'В 60.2% твоих матчей на PA ты покупаешь Battlefury как первый item — это правильно. Но ты задерживаешь BKB до 26+ минут, тогда как оппоненты с CC убивают тебя именно в окно без BKB (20-26 мин).',
      playerErrors: [
        'BKB на 26-30 минутах вместо оптимальных 22-24 — это ключевая причина 40% поражений',
        'Phantom Strike не используется для инициации farming camps — теряешь 15-20% efficiency',
        'Blur не активируется для escaping — ты умираешь от ganks без использования пассивного уклонения',
        'Stifling Dagger на поддержках в teamfight: только 1.4 каста в среднем против оптимальных 3+',
      ],
      strengths: [
        'Battlefury farming efficiency в топ-15% — твой тайминг 14:30 в среднем',
        'Coup de Grace crit damage per game выше среднего на 23%',
        'Инициация в teamfight через Phantom Strike — ты правильно выбираешь приоритетные цели в 68% случаев',
      ],
      improvements: [
        'Rush BKB сразу после Daedalus, не Butterfly — это сохранит тебе жизнь в критическое окно 20-26 мин',
        'Активнее используй Stifling Dagger для слоу на поддержках — это freekill во многих ситуациях',
        'Купи MKB против Butterfly/эвейжн героев раньше — ты теряешь 30% DPS без него',
      ],
      timingErrors: [
        'Battlefury — текущий тайминг 14:30 мин ✓ (оптимально)',
        'Daedalus — текущий тайминг 23 мин, цель 21 мин',
        'BKB — текущий тайминг 27 мин, цель 23 мин',
      ],
    },
    aspects: [
      { name: 'Coup de Grace Focus', description: 'Увеличивает базовый шанс крита, снижает манакост', recommended: true, effect: '+8% базовый крит шанс' },
      { name: 'Phantom\'s Veil', description: 'Blur дает evasion в teamfight при активации', recommended: false, effect: '+15% evasion во время Blur' },
    ],
  },
  {
    id: 'b3', hero: HEROES.axe, role: 'Offlaner', lane: 'Off', winrate: 52.4, popularity: 76, patch: '7.38',
    startingItems: [ITEMS.phase, ITEMS.tp],
    coreItems:     [ITEMS.blink, ITEMS.aghs, ITEMS.bkb],
    situationalItems: [ITEMS.satanic, ITEMS.travels, ITEMS.linkens],
    lategameItems: [ITEMS.satanic, ITEMS.travels, ITEMS.bkb],
    talents: [
      'Ур. 10: +25 HP Regen vs Challenged',
      'Ур. 15: +400 Battle Hunger DPS',
      'Ур. 20: Berserker\'s Call AoE +75',
      'Ур. 25: Culling Blade сбрасывает стаки',
    ],
    skillBuild: [
      { level: 1, skill: 'Battle Hunger' },
      { level: 2, skill: 'Berserker\'s Call' },
      { level: 3, skill: 'Counter Helix' },
      { level: 4, skill: 'Counter Helix' },
      { level: 5, skill: 'Counter Helix' },
      { level: 6, skill: 'Culling Blade' },
      { level: 7, skill: 'Counter Helix' },
    ],
    why: 'Blink Dagger для инициации, Aghanim\'s усиливает Culling Blade, BKB для teamfight. Satanic — sustain.',
    tips: [
      'Инициируй только когда BKB активна — в 55% поражений ты инициируешь без нее',
      'Battle Hunger на несколько целей для split push давления',
      'Culling Blade — убедись что цель ниже threshold перед применением',
    ],
    analysis: {
      whyThisBuild: 'Твой offlane Axe имеет 50% WR — это пространство для роста. Анализ показывает, что ты инициируешь слишком рано без BKB и слишком поздно забираешь Blink Dagger (после 16 мин).',
      playerErrors: [
        'Blink Dagger покупается после 16 минут в 63% матчей — теряешь window для ранних ganks',
        'Берсеркерский призыв без позиционирования — ты хватаешь 1-2 врага вместо 3-4 в 48% инициаций',
        'Culling Blade применяется до 40% HP threshold в 35% случаев — расходуешь CD впустую',
        'Battle Hunger в лейне не применяется на нескольких целях для харасса — 1.8 каста за лайн',
      ],
      strengths: [
        'Counter Helix damage per game стабильно выше среднего для Axe на уровне MMR',
        'Blink инициации в teamfight — ты правильно заходишь сзади в 72% случаев',
        'HP pool и sustain через Berserker\'s Call позволяют тебе выживать в fights дольше среднего',
      ],
      improvements: [
        'Rush Blink Dagger до 13-14 минуты — это твой главный spike для ganks',
        'Улучши позиционирование перед Call — заходи в smoke для 4-5 targets вместо 1-2',
        'Culling Blade только ниже порога (threshold varies by level) — не спамь вслепую',
      ],
      timingErrors: [
        'Blink Dagger — текущий тайминг 16:30 мин, цель 13-14 мин',
        'BKB — текущий тайминг 24 мин, цель 20-21 мин',
        'Aghanim\'s — текущий тайминг 28 мин, цель 24 мин',
      ],
    },
    aspects: [
      { name: 'Whirling Death', description: 'Counter Helix дополнительно дает стаки при триггере', recommended: true, effect: '+1 Counter Helix стак per proc' },
      { name: 'Culling Force', description: 'Culling Blade reset cooldown при убийстве', recommended: false, effect: 'CD сбрасывается на kill' },
    ],
  },
  {
    id: 'b4', hero: HEROES.qop, role: 'Midlaner', lane: 'Mid', winrate: 60.1, popularity: 81, patch: '7.38',
    startingItems: [ITEMS.clarity, ITEMS.tp],
    coreItems:     [ITEMS.blink, ITEMS.aghs, ITEMS.bkb],
    situationalItems: [ITEMS.daedalus, ITEMS.linkens, ITEMS.satanic],
    lategameItems: [ITEMS.daedalus, ITEMS.travels, ITEMS.aghs],
    talents: [
      'Ур. 10: +25 скорости от Scream of Pain',
      'Ур. 15: −1с Shadow Strike',
      'Ур. 20: +50% урона Scream of Pain',
      'Ур. 25: Blink снимает дебаффы',
    ],
    skillBuild: [
      { level: 1, skill: 'Shadow Strike' },
      { level: 2, skill: 'Blink' },
      { level: 3, skill: 'Shadow Strike' },
      { level: 4, skill: 'Scream of Pain' },
      { level: 5, skill: 'Shadow Strike' },
      { level: 6, skill: 'Sonic Wave (Ult)' },
      { level: 7, skill: 'Shadow Strike' },
    ],
    why: 'QoP — отличный teamfight герой. Blink для мобильности, Aghanim\'s усиливает AoE, BKB для защиты в fights.',
    tips: [
      'Shadow Strike на лайне каждый CD — в твоих матчах ты используешь его в 2.1 раза реже оптимума',
      'Blink → Ult → Blink out = стандартный паттерн, но ты часто остаешься в fight после ult',
      'Aghanim\'s priority — твой главный spike, не откладывай ради Daedalus',
    ],
    analysis: {
      whyThisBuild: 'На QoP у тебя 59.4% WR с хорошим потенциалом роста. Главная проблема — ты слишком агрессивно остаешься в teamfight после ульта, получая излишний урон. Blink level 25 talent исправит это.',
      playerErrors: [
        'Ты остаешься в teamfight после Sonic Wave в 55% боев — бери Blink talent на 25 для безопасного escape',
        'Shadow Strike используется как burst, а не как постоянный харасс — теряешь 40% потенциального урона на лайне',
        'Aghanim\'s задерживается ради Daedalus в 38% матчей — это ошибка, Aghs дает больше в teamfight',
        'Позиционирование в teamfight слишком близко к frontline — 3.1 смерти/матч выше нормы (2.2)',
      ],
      strengths: [
        'Burst combo (Shadow Strike → Sonic Wave → Scream) — точность активаций выше среднего на 15%',
        'Timing ganks с мид лайна — ты правильно ротируешься в 65% случаев',
        'GPM эффективность — 654 среднее, что хорошо для Midlaner с ее kit',
      ],
      improvements: [
        'Используй Shadow Strike как постоянный харасс на лайне — каждый KD, каждые 5с',
        'Приоритизируй Aghanim\'s перед Daedalus — это разница в teamfight 30%',
        'Blink + Sonic Wave + Blink out — не задерживайся в teamfight, используй мобильность',
      ],
      timingErrors: [
        'Blink Dagger — текущий тайминг 11:30 мин, цель 10 мин',
        'Aghanim\'s — текущий тайминг 22 мин, цель 19 мин',
        'BKB — текущий тайминг 27 мин, цель 23 мин',
      ],
    },
    aspects: [
      { name: 'Sonic Amplifier', description: 'Sonic Wave дает silence после контакта', recommended: true, effect: '+1.5с silence in AoE' },
      { name: 'Shadow Weaver', description: 'Shadow Strike накладывает vulnerability', recommended: false, effect: '+8% taken dmg per stack' },
    ],
  },
  {
    id: 'b5', hero: HEROES.rubick, role: 'Pos 4', lane: 'Safe', winrate: 55.8, popularity: 73, patch: '7.38',
    startingItems: [ITEMS.ward, ITEMS.smoke],
    coreItems:     [ITEMS.blink, ITEMS.aghs, ITEMS.force],
    situationalItems: [ITEMS.linkens, ITEMS.glimmer, ITEMS.lotus],
    lategameItems: [ITEMS.bkb, ITEMS.satanic, ITEMS.aghs],
    talents: [
      'Ур. 10: +125 Cast Range',
      'Ур. 15: +200 Telekinesis Range',
      'Ур. 20: Spell Steal копирует 2 заклинания',
      'Ур. 25: Spell Steal без Fade Time',
    ],
    skillBuild: [
      { level: 1, skill: 'Telekinesis' },
      { level: 2, skill: 'Fade Bolt' },
      { level: 3, skill: 'Fade Bolt' },
      { level: 4, skill: 'Arcane Supremacy' },
      { level: 5, skill: 'Fade Bolt' },
      { level: 6, skill: 'Spell Steal' },
      { level: 7, skill: 'Fade Bolt' },
    ],
    why: 'Aghanim\'s позволяет Rubick полностью копировать способность. Blink для позиционирования в teamfights, cast range talents обязательны.',
    tips: [
      'В 55.3% матчей на Rubick твои steal цели — AoE ульты. Это правильно. Следи за Telekinesis combo',
      'Aghs rush — твой главный приоритет. Без него Spell Steal на 30-40% слабее',
      'Cast range > все остальное на Rubick. +125 на 10 уровне обязательно',
    ],
    analysis: {
      whyThisBuild: 'Rubick — твой лучший pos4 герой с 55.3% WR. Основная проблема: в 42% матчей ты покупаешь Shadow Blade вместо Force Staff, теряя utility позиционирования. Force Staff сохраняет союзников и дает более гибкое позиционирование.',
      playerErrors: [
        'Shadow Blade вместо Force Staff в 42% матчей — ты теряешь utility для сейва и positioning',
        'Telekinesis используется для убегания вместо combo в 38% применений — теряешь контроль',
        'Spell Steal активируется до начала fight в 28% случаев — украденное spell не то, что нужно',
        'Fade Bolt не применяется на frontline перед teamfight для снижения урона — 1.4 раза за fight',
      ],
      strengths: [
        'Spell Steal target selection — ты воруешь правильные ульты в 71% teamfights',
        'Telekinesis combo с союзниками — хороший timing в 65% случаев',
        'Ward coverage на картах — выше среднего для твоего MMR bracket',
      ],
      improvements: [
        'Замени Shadow Blade на Force Staff — это opens saves, escapes, и positioning',
        'Glimmer Cape для сейвов — часто игнорируется, но это 1-2 спасенных союзника за game',
        'Fade Bolt на frontline в начале teamfight — снижает их damage output на 20-25%',
      ],
      timingErrors: [
        'Aghanim\'s — текущий тайминг 20 мин, цель 17 мин',
        'Blink Dagger — текущий тайминг 14 мин, цель 12 мин',
        'Force Staff — не в текущем item path, рекомендуем заменить Shadow Blade',
      ],
    },
    aspects: [
      { name: 'Grand Magus', description: 'Spell Steal дает бонусный урон украденному заклинанию', recommended: true, effect: '+25% dmg to stolen spells' },
      { name: 'Arcane Thief', description: 'Telekinesis накладывает дополнительный slow', recommended: false, effect: '-30% movement slow 2с' },
    ],
  },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────

export const WINRATE_DAILY = [
  { day: 'Mar 1', winrate: 52.1, wins: 7, losses: 6 },
  { day: 'Mar 2', winrate: 57.1, wins: 8, losses: 6 },
  { day: 'Mar 3', winrate: 66.7, wins: 6, losses: 3 },
  { day: 'Mar 4', winrate: 44.4, wins: 4, losses: 5 },
  { day: 'Mar 5', winrate: 60.0, wins: 6, losses: 4 },
  { day: 'Mar 6', winrate: 50.0, wins: 5, losses: 5 },
  { day: 'Mar 7', winrate: 62.5, wins: 5, losses: 3 },
  { day: 'Mar 8', winrate: 66.7, wins: 4, losses: 2 },
  { day: 'Mar 9', winrate: 75.0, wins: 6, losses: 2 },
  { day: 'Mar 10', winrate: 58.3, wins: 7, losses: 5 },
];

export const WINRATE_WEEKLY = [
  { week: 'Feb W1', winrate: 51.2, matches: 42 },
  { week: 'Feb W2', winrate: 53.8, matches: 38 },
  { week: 'Feb W3', winrate: 56.2, matches: 45 },
  { week: 'Feb W4', winrate: 54.1, matches: 41 },
  { week: 'Mar W1', winrate: 58.6, matches: 58 },
  { week: 'Mar W2', winrate: 62.4, matches: 34 },
];

export const GPM_TREND = [
  { game: 1, gpm: 586 }, { game: 2, gpm: 624 }, { game: 3, gpm: 498 },
  { game: 4, gpm: 698 }, { game: 5, gpm: 641 }, { game: 6, gpm: 412 },
  { game: 7, gpm: 724 }, { game: 8, gpm: 488 }, { game: 9, gpm: 862 },
  { game: 10, gpm: 688 },
];

export const KDA_TREND = [
  { game: 1, kda: 10.0 }, { game: 2, kda: 7.33 }, { game: 3, kda: 2.13 },
  { game: 4, kda: 5.0  }, { game: 5, kda: 2.83 }, { game: 6, kda: 5.0  },
  { game: 7, kda: 9.0  }, { game: 8, kda: 2.22 }, { game: 9, kda: 8.5  },
  { game: 10, kda: 7.0 },
];

export const HERO_WINRATE_CHART = HERO_STATS.slice(0, 8).map(h => ({
  name: h.hero.short,
  winrate: h.winrate,
  matches: h.matches,
  color: h.hero.color,
}));

export const ROLE_STATS = [
  { role: 'Midlaner', matches: 2142, winrate: 59.8, color: '#F59E0B' },
  { role: 'Carry',    matches: 1658, winrate: 57.2, color: '#22C55E' },
  { role: 'Pos 4',    matches: 512,  winrate: 54.2, color: '#60A5FA' },
  { role: 'Pos 5',    matches: 380,  winrate: 48.8, color: '#A78BFA' },
  { role: 'Offlaner', matches: 496,  winrate: 48.4, color: '#EF4444' },
];

export const SIDE_STATS = [
  { name: 'Radiant', value: 55.2, color: '#22C55E' },
  { name: 'Dire',    value: 54.6, color: '#EF4444' },
];

export const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 8),
  }))
).flat();

// ─── Goals ────────────────────────────────────────────────────────────────────

export const GOALS: Goal[] = [
  {
    id: 'g1', title: 'Поднять винрейт', description: 'Достичь винрейта 58%', target: 58, current: 54.9,
    unit: '%', type: 'winrate', deadline: '2026-04-01', completed: false, streak: 5,
  },
  {
    id: 'g2', title: 'Улучшить KDA', description: 'Средний KDA выше 4.0', target: 4.0, current: 3.42,
    unit: '', type: 'kda', deadline: '2026-03-31', completed: false, streak: 3,
  },
  {
    id: 'g3', title: '30 матчей за неделю', description: 'Отыграть 30 матчей за неделю', target: 30, current: 22,
    unit: 'матчей', type: 'matches', deadline: '2026-03-16', completed: false, streak: 7,
  },
  {
    id: 'g4', title: 'Снизить смерти', description: 'Менее 4 смертей в среднем', target: 4, current: 5.1,
    unit: 'смертей', type: 'deaths', deadline: '2026-04-01', completed: false, streak: 2,
  },
  {
    id: 'g5', title: '100 матчей на Invoker', description: 'Сыграть 100 матчей на Invoker', target: 100, current: 100,
    unit: 'матчей', type: 'matches', completed: true, streak: 0,
  },
  {
    id: 'g6', title: 'Immortal ранг', description: 'Достигнуть Immortal', target: 1, current: 1,
    unit: 'ранг', type: 'winrate', completed: true, streak: 0,
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1',  type: 'match',   title: 'Новый матч синхронизирован',  message: 'Invoker · Win · 12/2/8 · KDA 10.0 · 42 мин',                                             time: '2026-03-09T22:20:00', read: false },
  { id: 'n2',  type: 'stat',    title: 'Винрейт вырос',                message: 'Ваш винрейт поднялся до 54.9%. +1.2% за последние 7 дней',                                time: '2026-03-09T22:15:00', read: false },
  { id: 'n3',  type: 'build',   title: 'Новая рекомендация сборки',    message: 'Рекомендуем обновлённую сборку для Invoker под патч 7.38',                                 time: '2026-03-09T18:00:00', read: false },
  { id: 'n4',  type: 'sync',    title: 'Синхронизация завершена',      message: 'Загружено 14 новых матчей. Данные обновлены',                                              time: '2026-03-09T08:31:00', read: true  },
  { id: 'n5',  type: 'warning', title: 'Снижение винрейта',            message: 'Ваш винрейт снизился на 3.2% за последние 24 часа. Рекомендуем сделать перерыв',          time: '2026-03-08T23:00:00', read: true  },
  { id: 'n6',  type: 'build',   title: 'Анализ сборки Axe',            message: 'Обнаружены ошибки в закупе: рекомендуем брать BKB раньше на 8 минуте',                   time: '2026-03-08T20:00:00', read: true  },
  { id: 'n7',  type: 'system',  title: 'Обновление приложения',        message: 'Dota Scope v2.4.1 — улучшена аналитика, исправлены баги синхронизации',                   time: '2026-03-08T12:00:00', read: true  },
  { id: 'n8',  type: 'stat',    title: 'Цель достигнута!',             message: 'Поздравляем! Вы достигли Immortal ранга. Цель выполнена 🎯',                               time: '2026-03-07T18:30:00', read: true  },
  { id: 'n9',  type: 'match',   title: 'Серия побед',                  message: 'Вы выиграли 5 матчей подряд! Текущая серия: 5 wins',                                      time: '2026-03-07T16:00:00', read: true  },
  { id: 'n10', type: 'sync',    title: 'Ошибка синхронизации',         message: 'Не удалось загрузить данные. OpenDota API временно недоступен. Повтор через 10 мин',       time: '2026-03-06T14:00:00', read: true  },
];

// ─── Comparison Player ────────────────────────────────────────────────────────

export const COMPARISON_PLAYER: Player = {
  id: '76561198087654321',
  name: 'StormRider',
  steamId: 'stormrider99',
  steamUrl: 'https://steamcommunity.com/id/stormrider99/',
  rank: 'Divine',
  rankTier: 75,
  mmr: 6820,
  wins: 2214,
  losses: 1986,
  totalMatches: 4200,
  winrate: 52.7,
  avgKDA: 3.18,
  avgGPM: 578,
  avgXPM: 554,
  avgDuration: 40,
  lastSync: '2026-03-10T06:00:00',
  registeredAt: '2024-03-20',
  country: 'UA',
  lastMatch: '2026-03-09T20:00:00',
};

// ─── Sync History ─────────────────────────────────────────────────────────────

export const SYNC_HISTORY = [
  { id: 's1', date: '2026-03-10T08:30:00', status: 'success', matches: 14, duration: '42s' },
  { id: 's2', date: '2026-03-09T08:30:00', status: 'success', matches: 8,  duration: '38s' },
  { id: 's3', date: '2026-03-08T08:30:00', status: 'error',   matches: 0,  duration: '5s',  error: 'API timeout' },
  { id: 's4', date: '2026-03-07T08:30:00', status: 'success', matches: 12, duration: '45s' },
  { id: 's5', date: '2026-03-06T08:30:00', status: 'success', matches: 10, duration: '40s' },
  { id: 's6', date: '2026-03-05T08:30:00', status: 'partial', matches: 6,  duration: '52s', error: 'Rate limit' },
  { id: 's7', date: '2026-03-04T08:30:00', status: 'success', matches: 9,  duration: '36s' },
];

// ─── Devices ──────────────────────────────────────────────────────────────────

export const DEVICES = [
  { id: 'd1', name: 'Pixel 8 Pro',         os: 'Android 15',  lastSeen: '2026-03-10T08:30:00', current: true,  location: 'Москва, RU' },
  { id: 'd2', name: 'Samsung Galaxy S24',  os: 'Android 14',  lastSeen: '2026-02-28T14:20:00', current: false, location: 'Москва, RU' },
  { id: 'd3', name: 'Chrome Desktop',      os: 'Windows 11',  lastSeen: '2026-03-08T20:00:00', current: false, location: 'Москва, RU' },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  { id: 'a1', title: 'Immortal',       icon: '👑', description: 'Достигнуть Immortal ранга',          completed: true,  date: '2026-02-14' },
  { id: 'a2', title: '5000 матчей',    icon: '🎮', description: 'Отыграть 5000 матчей',               completed: true,  date: '2026-01-28' },
  { id: 'a3', title: 'Серия 10 побед', icon: '🔥', description: '10 побед подряд',                    completed: true,  date: '2026-03-07' },
  { id: 'a4', title: 'Invoker Main',   icon: '🧙', description: '200 матчей на одном герое',          completed: true,  date: '2026-02-01' },
  { id: 'a5', title: 'KDA 10+',        icon: '⚔️', description: 'KDA выше 10.0 в ranked матче',       completed: true,  date: '2026-03-09' },
  { id: 'a6', title: 'Farming God',    icon: '💰', description: 'GPM выше 900 в ranked матче',        completed: false, date: undefined   },
  { id: 'a7', title: 'Flawless',       icon: '🏆', description: '0 смертей в ranked матче',           completed: false, date: undefined   },
  { id: 'a8', title: 'Map Control',    icon: '🗺️',  description: '50 ward placements за месяц',       completed: false, date: undefined   },
  { id: 'a9', title: 'Roshan!',        icon: '🐉', description: 'Победить в матче где взяли 3 Rosh', completed: false, date: undefined   },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3_600_000);
  if (diffH < 1)   return 'только что';
  if (diffH < 24)  return `${diffH}С‡ назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)   return `${diffD}Рґ назад`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    'Carry':    '#22C55E',
    'Midlaner': '#F59E0B',
    'Offlaner': '#EF4444',
    'Pos 4':    '#60A5FA',
    'Pos 5':    '#A78BFA',
  };
  return map[role] ?? '#94A3B8';
}

export function getRoleIcon(role: string): string {
  const map: Record<string, string> = {
    'Carry':    '⚔️',
    'Midlaner': '🌟',
    'Offlaner': '🛡️',
    'Pos 4':    '🏹',
    'Pos 5':    '🧿',
  };
  return map[role] ?? '🎮';
}



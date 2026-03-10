const DOTA_ASSET_BASE = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react';

export const dotaAssets = {
  getHeroIcon(cdnName: string) {
    return `${DOTA_ASSET_BASE}/heroes/${cdnName}_horz.jpg`;
  },
  getItemIcon(cdnName: string) {
    return `${DOTA_ASSET_BASE}/items/${cdnName}.png`;
  },
  getAbilityIcon(cdnName: string) {
    return `${DOTA_ASSET_BASE}/abilities/${cdnName}.png`;
  },
  getFacetIcon(facetSlug: string) {
    return `${DOTA_ASSET_BASE}/facets/${facetSlug}.png`;
  },
  getRankIcon(rankTier: number) {
    const rank = Math.max(0, Math.floor(rankTier / 10));
    return `${DOTA_ASSET_BASE}/rank_icons/rank_icon_${rank}.png`;
  },
  getLaneIcon(lane: string) {
    return `/assets/dota/lanes/${lane.toLowerCase().replace(/\s+/g, '-')}.png`;
  },
  getRoleIcon(role: string) {
    return `/assets/dota/roles/${role.toLowerCase().replace(/\s+/g, '-')}.png`;
  },
  getModeIcon(modeId: number | string) {
    return `/assets/dota/modes/${String(modeId)}.png`;
  },
  getPatchBadge(patch: string) {
    return `/assets/dota/patches/${patch.replace(/\./g, '-')}.png`;
  },
};


import { DotaStatics } from '../domain/types';
import { storage } from './storage';
import { openDotaClient } from './opendotaClient';
import { dotaAssets } from './assets';

const STATICS_KEY = 'dota_scope_statics_v1';

const toEntityMap = (input: Record<string, any>, iconMapper?: (v: any) => string): Record<number, any> => {
  const result: Record<number, any> = {};
  Object.values(input).forEach((item: any) => {
    if (typeof item?.id !== 'number') return;
    result[item.id] = {
      id: item.id,
      name: item.localized_name || item.dname || item.name || String(item.id),
      shortName: item.name,
      localizedName: item.localized_name || item.dname,
      slug: item.name,
      icon: iconMapper ? iconMapper(item) : undefined,
    };
  });
  return result;
};

export const staticsService = {
  async load(): Promise<DotaStatics> {
    const cached = storage.get<DotaStatics | null>(STATICS_KEY, null);
    if (cached) return cached;

    try {
      const [heroes, items, abilities, regions, gameModes, patch] = await Promise.all([
        openDotaClient.getConstants('heroes'),
        openDotaClient.getConstants('items'),
        openDotaClient.getConstants('abilities'),
        openDotaClient.getConstants('region'),
        openDotaClient.getConstants('game_mode'),
        openDotaClient.getConstants('patch'),
      ]);

      const statics: DotaStatics = {
        heroesById: toEntityMap(heroes, (h) => dotaAssets.getHeroIcon(h.name.replace('npc_dota_hero_', ''))),
        itemsById: toEntityMap(items, (i) => dotaAssets.getItemIcon(i.name)),
        abilitiesById: toEntityMap(abilities, (a) => dotaAssets.getAbilityIcon(a.name)),
        regionsById: toEntityMap(regions),
        gameModesById: toEntityMap(gameModes),
        patches: Object.values(patch).map((p: any) => ({
          id: p.id || p.name,
          name: p.name || String(p.id),
        })),
      };

      storage.set(STATICS_KEY, statics);
      return statics;
    } catch {
      const empty: DotaStatics = {
        heroesById: {},
        itemsById: {},
        abilitiesById: {},
        regionsById: {},
        gameModesById: {},
        patches: [],
      };
      return empty;
    }
  },
};


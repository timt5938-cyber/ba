import { writeFile } from 'node:fs/promises';

const BASE = 'https://api.opendota.com/api/constants';
const ASSET = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react';

const fetchJson = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

const [heroes, items, abilities] = await Promise.all([
  fetchJson(`${BASE}/heroes`),
  fetchJson(`${BASE}/items`),
  fetchJson(`${BASE}/abilities`),
]);

const catalog = {
  generatedAt: new Date().toISOString(),
  heroes: Object.values(heroes).map((h) => ({
    id: h.id,
    key: h.name,
    slug: String(h.name || '').replace('npc_dota_hero_', ''),
    name: h.localized_name || h.name,
    icon: `${ASSET}/heroes/${String(h.name || '').replace('npc_dota_hero_', '')}_horz.jpg`,
  })),
  items: Object.values(items).map((i) => ({
    id: i.id,
    key: i.name,
    name: i.dname || i.name,
    icon: `${ASSET}/items/${i.name}.png`,
  })),
  abilities: Object.values(abilities).map((a) => ({
    id: a.id,
    key: a.name,
    name: a.dname || a.name,
    icon: `${ASSET}/abilities/${a.name}.png`,
  })),
};

await writeFile('C:/dota/src/app/data/opendotaIconCatalog.json', JSON.stringify(catalog, null, 2), 'utf8');
console.log(`icons: heroes=${catalog.heroes.length}, items=${catalog.items.length}, abilities=${catalog.abilities.length}`);

import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.resolve('frontend/src/assets/items');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const items = [
  // 1. Phổ biến (Common) - 24
  { id: 'wooden_sword', name: 'Wooden Sword', game: 'Minecraft', keepExisting: true },
  { id: 'stone_sword', name: 'Stone Sword', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/stone_sword.png' },
  { id: 'iron_sword', name: 'Iron Sword', game: 'Minecraft', keepExisting: true },
  { id: 'wooden_pickaxe', name: 'Wooden Pickaxe', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/wooden_pickaxe.png' },
  { id: 'stone_pickaxe', name: 'Stone Pickaxe', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/stone_pickaxe.png' },
  { id: 'iron_pickaxe', name: 'Iron Pickaxe', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/iron_pickaxe.png' },
  { id: 'wooden_bow', name: 'Wooden Bow', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/bow.png' },
  { id: 'copper_shortsword', name: 'Copper Shortsword', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Copper_Shortsword.png' },
  { id: 'wooden_boomerang', name: 'Wooden Boomerang', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Wooden_Boomerang.png' },
  { id: 'shuriken', name: 'Shuriken', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Shuriken.png' },
  { id: 'throwing_knife', name: 'Throwing Knife', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Throwing_Knife.png' },
  { id: 'healing_potion', name: 'Healing Potion', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Healing_Potion.png' },
  { id: 'mana_potion', name: 'Mana Potion', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Mana_Potion.png' },
  { id: 'poke_ball', name: 'Poké Ball', game: 'Pokémon', type: 'direct', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' },
  { id: 'potion', name: 'Potion', game: 'Pokémon', type: 'direct', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png' },
  { id: 'super_mushroom', name: 'Super Mushroom', game: 'Super Mario', type: 'fandom', sub: 'mario', file: 'File:HM Super Mushroom.png' },
  { id: 'fire_flower', name: 'Fire Flower', game: 'Super Mario', type: 'fandom', sub: 'mario', file: 'File:Fire flower.png' },
  { id: 'green_shell', name: 'Green Shell', game: 'Mario Kart', type: 'fandom', sub: 'mario', file: 'File:Green Shell (Mario Kart 8).png' },
  { id: 'health_potion_diablo', name: 'Health Potion', game: 'Diablo', type: 'fandom', sub: 'diablo', file: 'File:Health Potion.png' },
  { id: 'dorans_blade', name: "Doran's Blade", game: 'League of Legends', type: 'direct', url: 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/1055.png' },
  { id: 'health_potion_lol', name: 'Health Potion', game: 'League of Legends', type: 'direct', url: 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/2003.png' },
  { id: 'medkit', name: 'Medkit', game: 'Fortnite', type: 'fandom', sub: 'fortnite', file: 'File:Medkit - Item - Fortnite.png' },
  { id: 'shield_potion', name: 'Shield Potion', game: 'Fortnite', type: 'fandom', sub: 'fortnite', file: 'File:Shield Potion - Item - Fortnite.png' },
  { id: 'crowbar', name: 'Crowbar', game: 'Half-Life', type: 'fandom', sub: 'half-life', file: 'File:Home Weapon Crowbar.png' },

  // 2. Đặc biệt (Special) - 15
  { id: 'diamond_sword', name: 'Diamond Sword', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/diamond_sword.png' },
  { id: 'trident', name: 'Trident', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/trident.png' },
  { id: 'crossbow', name: 'Crossbow', game: 'Minecraft', type: 'direct', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/crossbow_standby.png' },
  { id: 'portal_gun', name: 'Portal Gun', game: 'Portal', type: 'direct', url: 'https://upload.wikimedia.org/wikipedia/ru/2/22/ASHPD_Portal_Gun.png', referer: 'https://wikipedia.org' },
  { id: 'gravity_gun', name: 'Gravity Gun', game: 'Half-Life 2', type: 'fandom', sub: 'half-life', file: 'File:Home Weapon Gravity Gun.png' },
  { id: 'energy_sword', name: 'Energy Sword', game: 'Halo', type: 'fandom', sub: 'halo', file: 'File:H5GMB Energy Sword.png' },
  { id: 'hidden_blade', name: 'Hidden Blade', game: 'Assassin\'s Creed', type: 'fandom', sub: 'assassinscreed', file: 'File:ACU Hidden Blade.png' },
  { id: 'hylian_shield', name: 'Hylian Shield', game: 'The Legend of Zelda', type: 'fandom', sub: 'zelda', file: 'File:BotW Hyrule Compendium Hylian Shield.png' },
  { id: 'master_ball', name: 'Master Ball', game: 'Pokémon', type: 'direct', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png' },
  { id: 'super_shotgun', name: 'Super Shotgun', game: 'DOOM', type: 'fandom', sub: 'doom', file: 'File:Super shotgun.png' },
  { id: 'peacekeeper', name: 'Peacekeeper', game: 'Apex Legends', type: 'fandom', sub: 'apexlegends', file: 'File:Peacekeeper.png' },
  { id: 'r301_carbine', name: 'R-301 Carbine', game: 'Apex Legends', type: 'fandom', sub: 'apexlegends', file: 'File:R-301 Carbine.png' },
  { id: 'omniwrench', name: 'OmniWrench', game: 'Ratchet & Clank', type: 'fandom', sub: 'ratchetandclank', file: 'File:OmniWrench 10000 render.png' },
  { id: 'lightsaber', name: 'Lightsaber', game: 'Star Wars Jedi', type: 'fandom', sub: 'starwars', file: 'File:CalsFirstSaberJFOArt.png' },
  { id: 'boomstick', name: 'Boomstick', game: 'DOOM', type: 'fandom', sub: 'doom', file: 'File:Shotgun.png' },

  // 3. Hiếm (Rare) - 11
  { id: 'moonveil', name: 'Moonveil', game: 'Elden Ring', type: 'fandom', sub: 'eldenring', file: 'File:ER Icon weapon Moonveil.png' },
  { id: 'leviathan_axe', name: 'Leviathan Axe', game: 'God of War', type: 'fandom', sub: 'godofwar', file: 'File:Leviathan Axe.png' },
  { id: 'master_sword', name: 'Master Sword', game: 'The Legend of Zelda', type: 'fandom', sub: 'zelda', file: 'File:BotW Master Sword.png' },
  { id: 'mantis_blades', name: 'Mantis Blades', game: 'Cyberpunk 2077', type: 'fandom', sub: 'cyberpunk', file: 'File:Militech Mantis Blades Black CP2077.png' },
  { id: 'nights_edge', name: "Night's Edge", game: 'Terraria', type: 'fandom', sub: 'terraria', file: "File:Night's_Edge.png" },
  { id: 'ray_gun', name: 'Ray Gun', game: 'Call of Duty Zombies', type: 'fandom', sub: 'callofduty', file: 'File:RAYGUN.png' },
  { id: 'awp_dragon_lore', name: 'AWP Dragon Lore', game: 'Counter-Strike', type: 'fandom', sub: 'counterstrike', file: 'File:AWp-dragon-lore-market.png' },
  { id: 'thunderfury', name: 'Thunderfury', game: 'World of Warcraft', type: 'fandom', sub: 'wowpedia', file: 'File:Inv_sword_39.png' },
  { id: 'ryno', name: 'RYNO', game: 'Ratchet & Clank', type: 'fandom', sub: 'ratchetandclank', file: 'File:RYNO from SM render.png' },
  { id: 'monado', name: 'Monado', game: 'Xenoblade Chronicles', type: 'fandom', sub: 'xenoblade', file: 'File:Monado.png' },
  { id: 'red_queen', name: 'Red Queen', game: 'Devil May Cry 4/5', type: 'fandom', sub: 'devilmaycry', file: 'File:DMC5 Red Queen.png' },

  // 4. Sử thi (Epic) - 7
  { id: 'frostmourne', name: 'Frostmourne', game: 'Warcraft / World of Warcraft', type: 'fandom', sub: 'deathbattle', file: 'File:Frostmourne.png' },
  { id: 'buster_sword', name: 'Buster Sword', game: 'Final Fantasy VII', type: 'direct', url: 'https://upload.wikimedia.org/wikipedia/ru/6/66/Buster_sword_Generation.png', referer: 'https://wikipedia.org' },
  { id: 'blades_of_chaos', name: 'Blades of Chaos', game: 'God of War', type: 'fandom', sub: 'godofwar', file: 'File:Blades of Chaos.png' },
  { id: 'terra_blade', name: 'Terra Blade', game: 'Terraria', type: 'fandom', sub: 'terraria', file: 'File:Terra_Blade.png' },
  { id: 'blasphemous_blade', name: 'Blasphemous Blade', game: 'Elden Ring', type: 'fandom', sub: 'eldenring', file: 'File:ER Icon weapon Blasphemous Blade.png' },
  { id: 'malorian_arms_3516', name: 'Malorian Arms 3516', game: 'Cyberpunk 2077', type: 'fandom', sub: 'cyberpunk', file: 'File:Silverhand 3516.png' },
  { id: 'fume_ultra_greatsword', name: 'Fume Ultra Greatsword', game: 'Dark Souls III', type: 'fandom', sub: 'darksouls', file: 'File:Fume Ultra Greatsword.png' },

  // 5. Thần thoại (Mythical) - 3
  { id: 'doom_slayers_crucible', name: "Doom Slayer's Crucible", game: 'DOOM Eternal', type: 'fandom', sub: 'doom', file: 'File:Doom Eternal Crucible.png' },
  { id: 'yamato', name: 'Yamato', game: 'Devil May Cry', type: 'fandom', sub: 'devilmaycry', file: 'File:Yamato.png' },
  { id: 'ea', name: 'Ea', game: 'Fate Series', keepExisting: true }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBuffer(url, headers = {}) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0'
  };
  const res = await fetch(url, { headers: { ...defaultHeaders, ...headers } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function resolveFandomUrl(subdomain, fileTitle) {
  const apiUrl = `https://${subdomain}.fandom.com/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  if (!res.ok) throw new Error(`Fandom API failed: ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error(`No pages found in Fandom query`);
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1' || !pages[pageId].imageinfo) {
    throw new Error(`File ${fileTitle} not found on ${subdomain}.fandom.com`);
  }
  const rawUrl = pages[pageId].imageinfo[0].url;
  return rawUrl.includes('?') ? `${rawUrl}&format=original` : `${rawUrl}?format=original`;
}

async function main() {
  console.log(`Starting download for ${items.length} items into: ${TARGET_DIR}`);
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filename = `${item.id}.png`;
    const destPath = path.join(TARGET_DIR, filename);

    if (fs.existsSync(destPath)) {
      const buf = fs.readFileSync(destPath);
      const isPng = buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
      if (isPng && buf.length > 50) {
        console.log(`[${i + 1}/${items.length}] ALREADY EXISTS: ${filename} (${buf.length} bytes, valid PNG)`);
        results.push({ item, status: 'EXISTS', size: buf.length, validPng: true });
        continue;
      }
    }

    try {
      let downloadUrl = item.url;
      let headers = {};

      if (item.type === 'fandom') {
        downloadUrl = await resolveFandomUrl(item.sub, item.file);
        headers['Referer'] = `https://${item.sub}.fandom.com/`;
      }
      if (item.referer) {
        headers['Referer'] = item.referer;
      }

      const buf = await fetchBuffer(downloadUrl, headers);
      const magic = buf.slice(0, 8).toString('hex');
      const isPng = magic === '89504e470d0a1a0a';

      fs.writeFileSync(destPath, buf);
      console.log(`[${i + 1}/${items.length}] SUCCESS: ${filename} (${buf.length} bytes, magic: ${magic.slice(0, 8)}, PNG: ${isPng})`);
      results.push({ item, status: 'DOWNLOADED', size: buf.length, validPng: isPng });
    } catch (err) {
      console.error(`[${i + 1}/${items.length}] ERROR downloading ${filename}: ${err.message}`);
      results.push({ item, status: 'ERROR', error: err.message });
    }

    await sleep(200);
  }

  console.log('\n--- FINAL SUMMARY ---');
  const successCount = results.filter(r => r.status === 'SUCCESS' || r.status === 'EXISTS' || r.status === 'DOWNLOADED').length;
  const validPngCount = results.filter(r => r.validPng).length;
  console.log(`Total items: ${items.length}`);
  console.log(`Saved / present: ${successCount}`);
  console.log(`Valid PNGs: ${validPngCount}`);

  const errors = results.filter(r => r.status === 'ERROR');
  if (errors.length > 0) {
    console.log(`Errors (${errors.length}):`, errors.map(e => `${e.item.id}: ${e.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error in script:', err);
  process.exit(1);
});

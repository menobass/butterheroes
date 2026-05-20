/* WORLD DATA — Aetheria: The Sundered Realms
   Hand-crafted 24x16 hex map + entity definitions.
   Exported to window for cross-file access. */

// ------------------------------------------------------------------
// TERRAIN MAP — 24 cols x 16 rows
// Chars: . grass | f forest | m mountain | w water | d desert
//        s snow  | r road   | p swamp    | l lava
// Odd rows are offset right by half a tile (odd-r offset coords)
// ------------------------------------------------------------------
const TERRAIN_LEGEND = {
  '.': 'grass', 'f': 'forest', 'm': 'mountain', 'w': 'water',
  'd': 'desert', 's': 'snow', 'r': 'road', 'p': 'swamp', 'l': 'lava'
};

const TERRAIN_NAMES = {
  grass: 'Greenfield',
  forest: 'Old Woods',
  mountain: 'Crag',
  water: 'River',
  desert: 'Dunes',
  snow: 'Frostlands',
  road: 'Old Road',
  swamp: 'Mire',
  lava: 'Cinderwastes'
};

// 24 wide, 16 tall
const MAP_RAW = [
//  0123456789012345678901234
   "smmmmsss....fff..mmmsssss", // 0
   "ssmmms.....ffff..mmssssss", // 1
   "ssmms.....fffff..mmmsssss", // 2
   "..mm.....ffff....mmmsss..", // 3
   "..f......ffr.....mmss....", // 4
   "..ff....fffr......mm.....", // 5
   "...ff..ffr.r....r.m......", // 6
   "....fffff.rrrr.r.........", // 7
   ".....fff..wwwrrrrr.......", // 8
   "......f..www....rrr.dd...", // 9
   ".........ww.......rrrdd..", // 10
   "..p.....www......rr.rddd.", // 11
   "..pp....pp.......r..rdddd", // 12
   "...pp..ppp..ddddd..rdddddl",// 13  (note: 26 chars, truncate)
   "....pppp...dddddddddddlll", // 14
   ".....pp....ddddddddddllll"  // 15
];

// normalize each row to 24 chars
const MAP = MAP_RAW.map(r => (r + "........................").slice(0, 24));

const ROWS = MAP.length;     // 16
const COLS = MAP[0].length;  // 24

// ------------------------------------------------------------------
// FEATURES — keyed by "r,c", placed on top of terrain.
// kind: castle/town/monster/resource/treasure
// ------------------------------------------------------------------
const FEATURES = {
  // ---- Castles & towns ----
  "8,11": { kind: "castle", subkind: "player",
    name: "Highmoor Keep",
    desc: "Your seat of power. Garrison: 12 units. Income: +1000 gold/day.",
    faction: "Order of the Dawn" },
  "2,4":  { kind: "castle", subkind: "enemy",
    name: "Citadel of Ash",
    desc: "Held by the Nightveil. Garrison: heavy. Bone wards encircle the walls.",
    faction: "Nightveil" },
  "11,18": { kind: "castle", subkind: "neutral",
    name: "Port Saltcliff",
    desc: "Free city. Will trade with any sworn lord. Open market every 7th day.",
    faction: "Free Towns" },
  "5,15": { kind: "castle", subkind: "ally",
    name: "Thornwatch",
    desc: "Sylvan outpost. Garrison: archers. Allied with @sylvienne.h.",
    faction: "Wildkin" },

  // ---- Resources ----
  "3,7":  { kind: "resource", subkind: "gold",   name: "Old Gold Mine",  yield: "+250 gold/day" },
  "9,4":  { kind: "resource", subkind: "gold",   name: "Whisperhill Mine", yield: "+250 gold/day" },
  "12,21":{ kind: "resource", subkind: "gold",   name: "Dune Vault",     yield: "+400 gold/day" },
  "1,12": { kind: "resource", subkind: "mana",   name: "Crystal Spire",  yield: "+5 mana/day" },
  "7,2":  { kind: "resource", subkind: "mana",   name: "Heartwood Node", yield: "+5 mana/day" },
  "5,7":  { kind: "resource", subkind: "wood",   name: "Pine Sawmill",   yield: "+150 wood/day" },
  "6,3":  { kind: "resource", subkind: "wood",   name: "Old Sawmill",    yield: "+150 wood/day" },

  // ---- Monsters (NPC) ----
  "4,8":  { kind: "monster", subkind: "dragon",   name: "Pyrrith the Ashwyrm", count: 1,  power: 84,
    desc: "An elder red dragon. The mountain trembles when she stirs." },
  "10,3": { kind: "monster", subkind: "skeleton", name: "Bone Marchers",      count: 28, power: 32 },
  "13,11":{ kind: "monster", subkind: "skeleton", name: "Mire Wraiths",       count: 14, power: 38 },
  "9,8":  { kind: "monster", subkind: "orc",      name: "Greenspear Warband", count: 18, power: 26 },
  "6,12": { kind: "monster", subkind: "orc",      name: "Bandit Riders",      count: 12, power: 22 },

  // ---- Treasure ----
  "3,10": { kind: "treasure", name: "Buried Cache", desc: "An unmarked chest. Old smuggler's stash?" },
  "11,9": { kind: "treasure", name: "Sunken Hoard", desc: "Half-submerged near the river bend." },
  "14,16":{ kind: "treasure", name: "Sand-buried Crate", desc: "A merchant caravan, long lost." },
};

// ------------------------------------------------------------------
// HEROES on the map — your hero + 3 other Hive players visible nearby
// pos = [row, col]
// ------------------------------------------------------------------
const HEROES = [
  {
    id: "self",
    handle: "@aldwin.h",
    name: "Sir Aldwin",
    title: "Dawnsworn Paladin",
    kind: "self",
    faction: "Order of the Dawn",
    pos: [8, 12],
    attack: 14, defense: 12, power: 9, knowledge: 7,
    morale: 4, luck: 2,
    mana: 24, manaMax: 30,
    movement: 18, movementMax: 24,
    army: [
      { unit: "Footmen",      glyph: "footmen",  count: 64 },
      { unit: "Crossbowmen",  glyph: "archers",  count: 28 },
      { unit: "Cavalry",      glyph: "cavalry",  count: 12 },
      { unit: "Griffons",     glyph: "griffon",  count: 6 },
      { unit: "Battle Mages", glyph: "mage",     count: 4 },
    ],
  },
  {
    id: "p2",
    handle: "@thorgar.h",
    name: "Thorgar Stoneflame",
    title: "Warlord of the Iron Reach",
    kind: "ally",
    faction: "Stonewardens",
    pos: [6, 9],
    power: 71,
    army: "Heavy infantry, dwarven cannons.",
  },
  {
    id: "p3",
    handle: "@nyxara.h",
    name: "Nyxara Veil",
    title: "Necromancer of the Ash Court",
    kind: "enemy",
    faction: "Nightveil",
    pos: [4, 6],
    power: 92,
    army: "Skeletal legion, two liches.",
  },
  {
    id: "p4",
    handle: "@sylvienne.h",
    name: "Sylvienne Thornroot",
    title: "Warden of the Old Woods",
    kind: "ally",
    faction: "Wildkin",
    pos: [5, 14],
    power: 58,
    army: "Sylvan archers, treants.",
  },
];

const SELF_HERO = HEROES[0];

// ------------------------------------------------------------------
// SPELLS — castable on the overworld
// ------------------------------------------------------------------
const SPELLS = [
  { id: "scry",   name: "Scry",       icon: "tele",   cost: 4,  range: 8,
    desc: "Reveal a distant hex and any forces within it." },
  { id: "haste",  name: "Haste",      icon: "bolt",   cost: 6,  range: 0,
    desc: "Restore 6 movement points to your hero this turn." },
  { id: "summon", name: "Summon Wisp",icon: "summon", cost: 8,  range: 3,
    desc: "Conjure a scouting wisp on a nearby hex for 3 days." },
  { id: "burn",   name: "Cinder Ward",icon: "fire",   cost: 10, range: 2,
    desc: "Burn the tile, denying passage to enemies for 2 days." },
  { id: "frost",  name: "Frost Veil", icon: "frost",  cost: 8,  range: 1,
    desc: "Sheath your hero in ice. -50% damage taken in next encounter." },
  { id: "heal",   name: "Mend",       icon: "heal",   cost: 6,  range: 0,
    desc: "Restore 25% of casualties to a single unit stack." },
  { id: "tele",   name: "Translocate",icon: "tele",   cost: 16, range: 6,
    desc: "Teleport your hero to any explored road or town." },
  { id: "lightning",name:"Skyfire",   icon: "bolt",   cost: 14, range: 5,
    desc: "Strike a hex for 80 damage. Bypasses terrain." },
  { id: "raise",  name: "Raise Dead", icon: "summon", cost: 18, range: 0,
    desc: "Forbidden. Required: heretical attunement.", locked: true },
];

// ------------------------------------------------------------------
// WORLD LOG — fake live MMO ticker
// ------------------------------------------------------------------
const WORLD_LOG = [
  { who: "@thorgar.h",      verb: "claimed",      target: "Whisperhill Mine"   },
  { who: "@valka.h",        verb: "lost a hero at", target: "the Black Gate"   },
  { who: "@dragonlord.h",   verb: "founded guild", target: "Iron Crown Pact"   },
  { who: "@nyxara.h",       verb: "cast",         target: "Plague Wind over the Mire" },
  { who: "@sylvienne.h",    verb: "allied with",  target: "@aldwin.h"          },
  { who: "@orin.h",         verb: "discovered",   target: "the Shrine of Vael" },
  { who: "@bramble.h",      verb: "trades 240 wood for", target: "8 mana crystals" },
  { who: "@grimhelm.h",     verb: "razed",        target: "Last Hope outpost"  },
  { who: "@aldwin.h",       verb: "marches toward", target: "Pyrrith the Ashwyrm" },
  { who: "@iskandra.h",     verb: "reached level", target: "27 — Magister"     },
  { who: "@ren.h",          verb: "deposited",    target: "120 HIVE into the Guild Vault" },
  { who: "@kasimir.h",      verb: "challenged",   target: "@thorgar.h to single combat" },
];

// ------------------------------------------------------------------
// HEX MATH — pointy-top, odd-r offset coords
// ------------------------------------------------------------------
const HEX_SIZE = 36;                          // "radius"
const HEX_W = Math.sqrt(3) * HEX_SIZE;        // 62.35
const HEX_H = 2 * HEX_SIZE;                   // 72
const STRIDE_X = HEX_W;                       // horizontal stride
const STRIDE_Y = HEX_H * 3/4;                 // vertical stride = 54

function offsetToPixel(col, row) {
  const x = STRIDE_X * (col + (row & 1) * 0.5);
  const y = STRIDE_Y * row;
  return [x, y];
}

// Neighbors for odd-r offset coords.
// row offset: even-row vs odd-row neighbor deltas differ.
function neighbors(row, col) {
  const odd = row & 1;
  // E, W are same; the diagonals shift by ±1 col depending on row parity
  const dxOdd  = [+1,  0, -1, +1,  0, -1]; // odd row
  const dxEven = [ 0, -1, -1,  0, -1, -1]; // even row  (different)
  // Actually correct odd-r:
  //   even row neighbors (dr, dc): (-1,-1)(-1,0)(0,-1)(0,+1)(+1,-1)(+1,0)
  //   odd  row neighbors (dr, dc): (-1,0)(-1,+1)(0,-1)(0,+1)(+1,0)(+1,+1)
  const deltas = odd
    ? [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]
    : [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];
  return deltas.map(([dr,dc]) => [row+dr, col+dc])
               .filter(([r,c]) => r>=0 && r<ROWS && c>=0 && c<COLS);
}

// Distance in hexes between two offset coords (odd-r)
function hexDistance(r1, c1, r2, c2) {
  // convert to axial (q, r)
  const ax1 = c1 - (r1 - (r1&1))/2;
  const ar1 = r1;
  const ax2 = c2 - (r2 - (r2&1))/2;
  const ar2 = r2;
  const dq = ax2 - ax1;
  const dr = ar2 - ar1;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq+dr)) / 2;
}

// Cost of moving onto a terrain
const MOVE_COST = {
  grass: 1, road: 0.5, desert: 1.5, snow: 2,
  forest: 2, mountain: 99, water: 99, swamp: 2, lava: 99
};
function isPassable(terrain) { return MOVE_COST[terrain] < 99; }

// ------------------------------------------------------------------
// Simple BFS pathfinder (offset coords, terrain costs)
// Returns array of [row, col] from start (excl) to end (incl), or null.
// ------------------------------------------------------------------
function findPath(start, end, mapChars, blockedFn) {
  const [sr, sc] = start, [er, ec] = end;
  if (sr === er && sc === ec) return [];
  const key = (r,c) => r*100 + c;
  const visited = new Map();
  visited.set(key(sr,sc), null);
  const frontier = [[sr,sc, 0]];
  // Best-first by accumulated cost (Dijkstra-lite)
  while (frontier.length) {
    frontier.sort((a,b)=>a[2]-b[2]);
    const [r,c,cost] = frontier.shift();
    if (r===er && c===ec) break;
    for (const [nr,nc] of neighbors(r,c)) {
      const t = TERRAIN_LEGEND[mapChars[nr][nc]];
      if (!isPassable(t)) continue;
      if (blockedFn && blockedFn(nr,nc) && !(nr===er && nc===ec)) continue;
      const k = key(nr,nc);
      const nextCost = cost + MOVE_COST[t];
      if (!visited.has(k) || visited.get(k).cost > nextCost) {
        visited.set(k, { from: [r,c], cost: nextCost });
        frontier.push([nr,nc,nextCost]);
      }
    }
  }
  if (!visited.has(key(er,ec))) return null;
  const path = [];
  let cur = [er, ec];
  while (cur && !(cur[0]===sr && cur[1]===sc)) {
    path.unshift(cur);
    const info = visited.get(key(cur[0], cur[1]));
    cur = info ? info.from : null;
  }
  return path;
}

// expose
Object.assign(window, {
  MAP, ROWS, COLS, TERRAIN_LEGEND, TERRAIN_NAMES,
  FEATURES, HEROES, SELF_HERO, SPELLS, WORLD_LOG,
  HEX_SIZE, HEX_W, HEX_H, STRIDE_X, STRIDE_Y,
  offsetToPixel, neighbors, hexDistance, findPath,
  MOVE_COST, isPassable
});

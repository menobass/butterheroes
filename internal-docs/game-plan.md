# Aetheria: The Sundered Realms — Game Plan
### Lead Design Engineering Document · v0.1 · May 2026

---

## Where We Are

The prototype is a fully rendered, interactive hex-map strategy game running in the browser with zero build tooling — React 18 + Babel via CDN. It already has:

- Hex grid with Dijkstra pathfinding and terrain costs
- Animated hero movement, step by step
- Encounter modal (fight / parley / flee)
- Spellbook UI with range targeting
- Resource bar, army roster, minimap, world log ticker
- Hive identity panel (UI shell only)
- Dev tweaks panel

**Nothing persists. Nothing talks to Hive yet. Combat resolves instantly.** That is what this plan addresses.

---

## Vision

> A fully on-chain, browser-playable, async-turn strategy game where every hero is a Hive account, every battle is a blockchain transaction, and the world map evolves in real time as players move and fight.

Players log in with Hive Keychain. Their identity, army, and keep are stored as custom_json on-chain. Other players appear on your map as real Hive accounts. Combat outcomes, resource claims, and guild trades are all verifiable on-chain.

---

## Architecture Decision: Keep the No-Build Stack (for now)

The current CDN + Babel approach is a strength for iteration speed. We will **not** migrate to Vite/webpack in Phase 1 or 2. We add `dhive` via CDN and Hive Keychain via the browser extension API.

When we hit a wall (bundle size, import complexity, code splitting), we migrate to Vite then — not before.

---

## Phase Roadmap

---

### Phase 1 — Hive Auth + Persistent Identity
**Goal:** A real player can log in with their Hive account and the game remembers who they are.

**Deliverables:**
1. **Keychain login flow** — detect `window.hive_keychain`, prompt login, request a signed challenge with `requestSignBuffer`. Store the verified handle in `localStorage`.
2. **Session persistence** — on page load, check `localStorage` for `aetheria_session`. If valid (< 24h), skip login. Show the handle in the top bar instead of the hardcoded `@aldwin.h`.
3. **Player profile fetch** — use `dhive` (`Client.database.getAccounts([handle])`) to pull the player's Hive account metadata (reputation, HP, profile image). Display reputation as "Prestige" in the hero card.
4. **Remove the Tweaks panel identity field** — `hiveUser` comes from the real session now.

**Hive calls used:**
- `hive_keychain.requestSignBuffer` — login
- `dhive` `database.getAccounts` — profile fetch

**Files touched:** `ui-shell.jsx` (HiveModal, TopBar), `app.jsx` (session init), new `auth.jsx`

---

### Phase 2 — On-Chain Game State (Single Player)
**Goal:** End Turn writes to Hive. On reload, the game picks up where it left off.

**The state model:**
Game state is stored as a Hive `custom_json` broadcast under the operation id `aetheria_state`. The payload is the player's current state snapshot:

```json
{
  "schema": 1,
  "hero": { "pos": [8,12], "movement": 18, "mana": 24, "army": [...] },
  "resources": { "gold": 14250, "wood": 28, "ore": 12, "mana": 24, "gems": 6 },
  "day": 47,
  "season": "Spring",
  "claims": ["3,7", "9,4"],
  "defeated": ["10,3"]
}
```

**Deliverables:**
1. **Write on End Turn** — call `hive_keychain.requestBroadcast` with `custom_json` op using posting key. Show a "saving..." spinner. On confirmation, update local state.
2. **Read on load** — query `dhive` account history for `custom_json` with id `aetheria_state` from the player's account. Hydrate game state from the most recent entry.
3. **Claimed resources** — when the hero moves adjacent to a resource node, it's "claimed" and added to the `claims` array on next End Turn save. Claimed nodes show a player-colored flag.
4. **Defeated monsters** — removed from the map on reload. Stored in `defeated` array.

**Hive calls used:**
- `hive_keychain.requestBroadcast` — End Turn save
- `dhive` `database.getAccountHistory` — load game state on startup

**Files touched:** `app.jsx` (End Turn, load), new `hive-state.jsx`

---

### Phase 3 — Real Combat System
**Goal:** Encounters are no longer instant. A proper turn-based battle screen resolves combat unit by unit.

**Combat model (HOMM-inspired, simplified):**
- Each side has up to 7 unit stacks.
- Stacks take turns attacking in order of speed stat.
- Damage formula: `base_dmg * ATK_modifier / DEF_modifier * rng(0.85–1.15)` — deterministic using a seed from the tx hash so outcomes are verifiable on-chain.
- Battle ends when one side has no units remaining.
- No separate battle screen yet — resolve in the encounter modal with an animated log of rounds.

**Deliverables:**
1. **`combat.jsx`** — pure function `resolveCombat(attacker, defender, seed)` → `{ winner, attackerLosses, defenderLosses, log[] }`. No side effects. Fully testable.
2. **Battle log panel** — replace the three-button encounter modal body with a scrolling round-by-round log ("Footmen strike Bone Marchers for 47 damage — 3 killed") then a result screen.
3. **Persist casualties** — army counts update after combat. Written to chain on next End Turn.
4. **Monster respawn** — defeated monsters come back after 14 in-game days (stored in `defeated` with a day timestamp).

**Files touched:** new `combat.jsx`, `ui-shell.jsx` (EncounterModal), `app.jsx` (onEncounterResolve)

---

### Phase 4 — Castle & Recruitment
**Goal:** Your keep is a real building. You can enter it, build structures, and recruit units.

**Castle state model** (stored inside the `aetheria_state` custom_json):
```json
"castle": {
  "buildings": ["barracks", "archery_range", "stables"],
  "garrison": [{ "unit": "Footmen", "count": 12 }],
  "recruit_available": { "Footmen": 20, "Crossbowmen": 8 }
}
```

**Deliverables:**
1. **Castle screen** — clicking "ENTER KEEP" opens a full-screen modal with a pixelart layout: 7 building slots, a garrison view, and a recruitment panel.
2. **Buildings** — 8 building types, each unlocking a unit type or passive bonus. Gold + resource cost to build, takes 1 in-game day. Can only build one per turn.
3. **Recruitment** — buy units from available pool. Costs gold. Units added directly to the hero's army (up to 7 stacks).
4. **Garrison** — leave units behind at the keep to defend it when you're away.

**Files touched:** new `castle.jsx`, `ui-shell.jsx`, `app.jsx`

---

### Phase 5 — Live Multiplayer (Real Hive Players on the Map)
**Goal:** Other Hive players appear on your map based on their real on-chain state. You can engage them.

**How it works:**
- Poll `dhive` for recent `custom_json` ops with id `aetheria_state` every 30 seconds (Hive block time is 3s, polling is fine).
- Render all players found within ±10 rows/cols of your hero position.
- PvP encounter — when you click "ATTACK" on a real player: broadcast a `custom_json` with id `aetheria_challenge` targeting their handle. They see an incoming challenge notification next time they load.

**Challenge/response flow:**
1. Challenger broadcasts `aetheria_challenge` with attacker state snapshot + seed.
2. Defender loads the game, sees a "You have been challenged" banner.
3. Defender clicks Accept → broadcasts `aetheria_challenge_accept`.
4. Both clients run `resolveCombat(attacker, defender, seed)` locally → identical result (deterministic).
5. Both write their updated state on next End Turn.

**Parley via Hive memo:**
- "PROPOSE TRUCE" button sends a real encrypted Hive memo to the target handle via `hive_keychain.requestEncodeMessage`.

**Hive calls used:**
- `dhive` `database.getDiscussionsByCreated` / custom query for `custom_json` ops
- `hive_keychain.requestBroadcast` — challenge ops
- `hive_keychain.requestEncodeMessage` — parley memos

**Files touched:** new `multiplayer.jsx`, `app.jsx` (polling loop), `ui-shell.jsx`

---

### Phase 6 — Guild System
**Goal:** The "GUILD" button works. Guilds are Hive communities.

**Model:** A guild maps 1:1 to a Hive community (`hive_communities` op or a designated account). Guild membership is stored on-chain.

**Deliverables:**
1. **Guild modal** — list members, their hero positions on the map, combined guild power, shared vault balance.
2. **Guild vault** — a dedicated Hive account that members can transfer HIVE/HBD to. Disbursals require a multi-sig-style vote (threshold of members broadcasting `aetheria_guild_vote` with the same proposal hash).
3. **Guild wars** — declare war on another guild. PvP encounter between guild members resolves as a "campaign" with a score tracked over 7 days.
4. **World log** — replace the fake `WORLD_LOG` static array with real on-chain data: stream recent `aetheria_state` and `aetheria_challenge` custom_json ops from `dhive` and format them into the ticker.

**Hive calls used:**
- `dhive` `broadcast.comment` — guild announcements
- HIVE transfers — vault deposits
- `aetheria_guild_vote` custom_json — governance

---

### Phase 7 — NFT Heroes & Relics (Hive Engine)
**Goal:** Heroes and relics are real NFTs on Hive Engine. Owning one unlocks it in-game.

**Model:**
- Each hero class (Paladin, Necromancer, Warlord, etc.) is an NFT series on Hive Engine under the `AETHERIA` token.
- Relics are NFT items with stat modifiers.
- The game reads the player's `@account` Hive Engine wallet on login and unlocks the corresponding heroes/relics.

**Deliverables:**
1. **NFT hero select screen** — shown before entering the map. Lists owned heroes. Each has unique base stats, faction, and starting spell.
2. **Relic slots** — 3 relic slots in the hero card. Equipping a relic modifies stats displayed.
3. **NFT minting** — winning a campaign against a guild allows minting a "Victory Relic" NFT as a reward.

**Hive Engine calls used:**
- `https://api.hive-engine.com/rpc/contracts` — `nft.findOne`, `tokens.findOne`
- `hive_keychain.requestCustomJson` — Hive Engine NFT transfers

---

### Phase 8 — Build System Migration (When Needed)
**Goal:** Move from CDN + Babel to Vite when bundle complexity demands it.

**Trigger conditions:** hitting any of these means it's time —
- We need tree-shaking (dhive alone is ~500kb)
- We want TypeScript
- We need code splitting for the castle/battle screens
- We want hot module reload for development speed

**Migration plan:**
1. `npm create vite@latest` with React preset
2. Move `.jsx` files to `src/`
3. Replace `window.` globals with proper ES module exports
4. Replace CDN scripts with `npm install react react-dom dhive`
5. Keep `Aetheria.html` as the deploy artifact (Vite builds to it)

---

## Data Flow Summary

```
Player Action
     │
     ▼
Local React State (instant feedback)
     │
     ├── End Turn ──────────────► hive_keychain.requestBroadcast
     │                                    │
     │                                    ▼
     │                            custom_json: aetheria_state
     │                            (on Hive blockchain)
     │
     ├── PvP Attack ────────────► hive_keychain.requestBroadcast
     │                                    │
     │                                    ▼
     │                            custom_json: aetheria_challenge
     │
     └── On Load ───────────────► dhive.getAccountHistory
                                          │
                                          ▼
                                  hydrate React state
```

---

## What NOT to Change

- The hex math (`offsetToPixel`, `hexDistance`, `findPath`) — it's correct and clean. Don't touch it.
- The CSS pixel-art visual language — it's the identity of the game.
- The tweaks panel — keep it for dev/testing throughout all phases.
- The single-file-per-component structure — stay flat until Phase 8 demands otherwise.

---

## Phase Priority (Recommended Order)

| Priority | Phase | Why |
|----------|-------|-----|
| 1 | Phase 1 — Auth | Everything else depends on a real identity |
| 2 | Phase 2 — State Persistence | Makes the game actually playable |
| 3 | Phase 3 — Real Combat | Biggest gameplay gap right now |
| 4 | Phase 4 — Castle | Gives players a home base to care about |
| 5 | Phase 5 — Multiplayer | The core social loop |
| 6 | Phase 6 — Guilds | Social glue |
| 7 | Phase 7 — NFTs | Monetization / ownership layer |
| 8 | Phase 8 — Build System | When complexity demands it |

---

## Open Questions (Decide Before Phase 2)

1. **Turn frequency** — is this real-time (players move any time, state saved on End Turn) or strictly async (each player gets a 24h window to move)? Async is easier on Hive; real-time needs a relay server.
2. **Map size** — the current 24×16 fits one screen. A multiplayer world needs a much larger map (~100×100) with fog of war. Decide before persisting map state on-chain.
3. **Canonical map state** — who owns the ground truth of the map? If two players claim the same resource node in the same block, how is the conflict resolved? Options: first-write-wins (chain order), or a dedicated "world contract" account.
4. **Costs** — Hive `custom_json` is free up to resource credits. Heavy players will need staked HP. Do we require players to hold HIVE stake, or do we operate a resource-credit-delegation account for new players?
5. **Mobile** — the current layout requires a 1440px-wide viewport. Is mobile in scope?

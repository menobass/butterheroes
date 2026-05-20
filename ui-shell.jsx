/* UI SHELL — TopBar, Sidebar, WorldLog, Modals, Hive badge */

const { useState: useStateUI, useEffect: useEffectUI, useMemo: useMemoUI } = React;

// ============================================================
// TOP BAR
// ============================================================
function TopBar({ resources, day, season, onHiveClick, hiveUser }) {
  return (
    <div className="topbar">
      <div className="tb-game-title">
        AETHERIA
        <small>THE SUNDERED REALMS · BETA · CHAIN-LINKED</small>
      </div>

      <div className="tb-spacer"></div>

      <div className="tb-block gold">
        <ResIcon kind="gold" />
        <div>
          <div className="res-amt">{resources.gold.toLocaleString()}</div>
          <div className="res-label">GOLD</div>
        </div>
      </div>
      <div className="tb-block">
        <ResIcon kind="wood" />
        <div>
          <div className="res-amt">{resources.wood}</div>
          <div className="res-label">WOOD</div>
        </div>
      </div>
      <div className="tb-block">
        <ResIcon kind="ore" />
        <div>
          <div className="res-amt">{resources.ore}</div>
          <div className="res-label">ORE</div>
        </div>
      </div>
      <div className="tb-block">
        <ResIcon kind="mana" />
        <div>
          <div className="res-amt" style={{ color: "var(--mystic-bright)" }}>{resources.mana}</div>
          <div className="res-label">MANA</div>
        </div>
      </div>
      <div className="tb-block">
        <ResIcon kind="gems" />
        <div>
          <div className="res-amt" style={{ color: "var(--mana-bright)" }}>{resources.gems}</div>
          <div className="res-label">GEMS</div>
        </div>
      </div>

      <div className="tb-spacer"></div>

      <div className="tb-block">
        <div>
          <div className="res-amt" style={{ color: "var(--parch)" }}>DAY {day}</div>
          <div className="res-label">{season.toUpperCase()} CYCLE</div>
        </div>
      </div>

      <div className="hive-badge" onClick={onHiveClick} title="Signed via Hive Keychain">
        <div className="hive-portrait">
          <div style={{
            width: 22, height: 22,
            background: "linear-gradient(135deg, #e23a3a 0%, #802020 100%)",
            position: "relative",
            boxShadow: "inset 0 0 0 1px #000"
          }}>
            <div style={{
              position: "absolute", inset: 4,
              background: "transparent",
              border: "2px solid #fff",
              clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)"
            }}></div>
          </div>
        </div>
        <div>
          <div className="hive-name">{hiveUser}</div>
          <div className="hive-rank">Liege · Rank XII</div>
        </div>
        <div className="hive-dot" title="Keychain online"></div>
      </div>
    </div>
  );
}

function ResIcon({ kind }) {
  const styles = {
    gold:  { background: "var(--gold-bright)", clipPath: "circle(45% at 50% 50%)", boxShadow: "inset 0 -2px 0 var(--gold-dark), 0 0 0 1px #000" },
    wood:  { background: "#8a6038", clipPath: "polygon(0% 30%, 100% 30%, 100% 70%, 0% 70%)", boxShadow: "0 0 0 1px #000" },
    ore:   { background: "var(--stone-3)", clipPath: "polygon(20% 100%, 0% 50%, 20% 0%, 80% 0%, 100% 50%, 80% 100%)", boxShadow: "0 0 0 1px #000" },
    mana:  { background: "var(--mystic-bright)", clipPath: "polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)", boxShadow: "0 0 6px var(--mystic), 0 0 0 1px #000" },
    gems:  { background: "var(--mana-bright)", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", boxShadow: "0 0 6px var(--mana), 0 0 0 1px #000" },
  };
  return <div className="res-icon" style={styles[kind]}></div>;
}

// ============================================================
// SIDEBAR — Hero card, Army, Spellbook, Minimap
// ============================================================
function Sidebar({ hero, activeSpell, onSpellClick, mapState, panOffset, onMinimapClick }) {
  return (
    <div className="sidebar">
      <HeroCard hero={hero} />
      <ArmyRoster hero={hero} />
      <SpellBook activeSpell={activeSpell} onSpellClick={onSpellClick} mana={hero.mana} />
      <MiniMap panOffset={panOffset} onMinimapClick={onMinimapClick} heroPos={hero.pos} />
    </div>
  );
}

function HeroCard({ hero }) {
  const movePct = (hero.movement / hero.movementMax) * 100;
  const pips = 12;
  const filled = Math.round((hero.movement / hero.movementMax) * pips);
  return (
    <div className="panel">
      <div className="panel-title">
        <span>HERO</span>
        <span style={{ color: "var(--parch-2)", fontSize: 9 }}>SELECTED</span>
      </div>
      <div className="hero-card">
        <div className="hero-portrait">
          <div className="plume"></div>
          <div className="helm"></div>
          <div className="visor"></div>
          <div className="neck"></div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hero-name">{hero.name}</div>
          <div className="hero-class">{hero.title}</div>
          <div className="hero-stats">
            <div className="lbl">ATK</div><div className="val">{hero.attack}</div>
            <div className="lbl">DEF</div><div className="val">{hero.defense}</div>
            <div className="lbl">PWR</div><div className="val">{hero.power}</div>
            <div className="lbl">KNW</div><div className="val">{hero.knowledge}</div>
            <div className="lbl">MANA</div><div className="val" style={{ color: "var(--mystic-bright)" }}>{hero.mana}/{hero.manaMax}</div>
            <div className="lbl">MORALE</div><div className="val">+{hero.morale}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 10px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--f-ui)" }}>
          <span style={{ color: "var(--parch-2)" }}>MOVEMENT</span>
          <span style={{ color: "var(--gold-bright)" }}>{hero.movement} / {hero.movementMax}</span>
        </div>
        <div className="move-bar">
          {Array.from({ length: pips }, (_, i) => (
            <div key={i} className={`move-pip ${i >= filled ? "spent" : ""}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArmyRoster({ hero }) {
  return (
    <div className="panel">
      <div className="panel-title"><span>ARMY</span><span style={{ color: "var(--parch-2)", fontSize: 9 }}>{hero.army.reduce((s,u)=>s+u.count,0)} TROOPS</span></div>
      <div className="army">
        {hero.army.map((u, i) => (
          <div className="unit-slot" key={i} title={`${u.unit} × ${u.count}`}>
            <UnitGlyph kind={u.glyph} />
            <div className="unit-count">{u.count}</div>
          </div>
        ))}
        {Array.from({ length: 7 - hero.army.length }, (_, i) => (
          <div className="unit-slot empty" key={`e${i}`}></div>
        ))}
      </div>
    </div>
  );
}

function UnitGlyph({ kind }) {
  // small monochrome pixel-ish unit silhouettes
  if (kind === "footmen") return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", width: 8, height: 8, background: "#d0d0e0", top: 2, left: 8, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 12, height: 10, background: "#d8c89e", top: 10, left: 6, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 2, height: 16, background: "#c0c0d0", top: 4, right: 4, boxShadow: "0 0 0 1px #000" }}></div>
    </div>
  );
  if (kind === "archers") return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", width: 8, height: 8, background: "#6a8038", top: 2, left: 8, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 12, height: 10, background: "#4a6028", top: 10, left: 6, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 12, height: 2, background: "#8a6038", top: 8, left: 6, boxShadow: "0 0 0 1px #000" }}></div>
    </div>
  );
  if (kind === "cavalry") return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", width: 16, height: 6, background: "#8a6038", bottom: 4, left: 4, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 8, height: 8, background: "#d0d0e0", top: 4, left: 4, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 2, height: 12, background: "#c0c0d0", top: 0, right: 6, boxShadow: "0 0 0 1px #000" }}></div>
    </div>
  );
  if (kind === "griffon") return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", width: 14, height: 8, background: "#c8a868", top: 8, left: 5, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 6, height: 6, background: "#e8d090", top: 6, left: 12, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 8, height: 4, background: "#806838", top: 4, left: 8, clipPath: "polygon(0% 100%, 100% 0%, 100% 100%)" }}></div>
    </div>
  );
  if (kind === "mage") return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", width: 10, height: 14, background: "var(--mystic)", bottom: 0, left: 7, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 6, height: 6, background: "#d8c89e", top: 4, left: 9, boxShadow: "0 0 0 1px #000" }}></div>
      <div style={{ position: "absolute", width: 4, height: 4, background: "var(--mystic-bright)", top: 8, left: 4, boxShadow: "0 0 6px var(--mystic)" }}></div>
    </div>
  );
  return null;
}

function SpellBook({ activeSpell, onSpellClick, mana }) {
  return (
    <div className="panel" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div className="panel-title">
        <span>SPELLBOOK</span>
        <span style={{ color: "var(--mystic-bright)", fontSize: 9 }}>{mana} MANA</span>
      </div>
      <div className="spellbook" style={{ overflow: "auto", flex: 1 }}>
        {SPELLS.map(s => {
          const canCast = !s.locked && mana >= s.cost;
          return (
            <div
              key={s.id}
              className={`spell ${activeSpell === s.id ? "active" : ""} ${s.locked || !canCast ? "locked" : ""}`}
              onClick={() => canCast && onSpellClick(s.id)}
              title={s.desc}
            >
              <div className={`spell-icon ${s.icon}`}></div>
              <div className="spell-name">{s.name}</div>
              <div className="spell-cost">{s.cost} ✦</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniMap({ panOffset, onMinimapClick, heroPos }) {
  return (
    <div className="panel">
      <div className="panel-title"><span>REALM MAP</span><span style={{ color: "var(--parch-2)", fontSize: 9 }}>{ROWS}×{COLS}</span></div>
      <div className="minimap">
        <div className="minimap-canvas" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          onMinimapClick(px, py);
        }}>
          {MAP.map((row, r) =>
            [...row].map((char, c) => {
              const terrain = TERRAIN_LEGEND[char];
              return (
                <div key={`${r},${c}`} className={`mm-tile t-${terrain}`}
                  style={{
                    left: `${(c + (r&1)*0.5) * (100 / (COLS + 0.5))}%`,
                    top: `${r * (100 / ROWS)}%`,
                    width: `${100 / (COLS + 0.5) + 0.5}%`,
                    height: `${100 / ROWS + 0.5}%`,
                  }}
                />
              );
            })
          )}
          {/* Features as dots */}
          {Object.entries(FEATURES).map(([k, f]) => {
            const [r, c] = k.split(',').map(Number);
            const color = f.kind === "castle" ?
              (f.subkind === "player" ? "var(--mana-bright)" :
               f.subkind === "enemy" ? "var(--blood)" :
               f.subkind === "ally" ? "var(--emerald)" :
               "var(--parch-2)") :
              f.kind === "monster" ? "var(--blood)" :
              f.kind === "resource" ? "var(--gold)" : "var(--parch)";
            return (
              <div key={k} className="mm-dot"
                style={{
                  left: `${(c + (r&1)*0.5) * (100 / (COLS + 0.5)) + 1}%`,
                  top: `${r * (100 / ROWS) + 1}%`,
                  background: color
                }}
              />
            );
          })}
          {/* Other heroes */}
          {HEROES.filter(h => h.id !== "self").map(h => (
            <div key={h.id} className="mm-dot"
              style={{
                left: `${(h.pos[1] + (h.pos[0]&1)*0.5) * (100 / (COLS + 0.5)) + 1}%`,
                top: `${h.pos[0] * (100 / ROWS) + 1}%`,
                background: h.kind === "enemy" ? "var(--blood)" : "var(--mana-bright)",
                width: 5, height: 5, boxShadow: "0 0 0 1px #fff"
              }}
            />
          ))}
          {/* Self hero */}
          <div className="mm-dot"
            style={{
              left: `${(heroPos[1] + (heroPos[0]&1)*0.5) * (100 / (COLS + 0.5)) + 1}%`,
              top: `${heroPos[0] * (100 / ROWS) + 1}%`,
              background: "var(--gold-bright)",
              width: 6, height: 6, boxShadow: "0 0 0 1px #000, 0 0 6px var(--gold)"
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WORLD LOG (bottom ticker)
// ============================================================
function WorldLog() {
  // Double the array so animation loops seamlessly
  const items = [...WORLD_LOG, ...WORLD_LOG];
  return (
    <div className="worldlog">
      <div className="worldlog-label">▣ WORLD CHRONICLE</div>
      <div className="worldlog-track">
        {items.map((it, i) => (
          <div className="wl-item" key={i}>
            <span className="who">{it.who}</span>{" "}
            <span className="verb">{it.verb}</span>{" "}
            <span className="target">{it.target}</span>
            <span className="dot">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ENCOUNTER MODAL
// ============================================================
function EncounterModal({ encounter, onResolve, hero }) {
  if (!encounter) return null;
  const { kind, name, count, power, subkind, faction, handle } = encounter;

  const flavor = kind === "monster"
    ? `${name} blocks your advance. ${subkind === "dragon" ? "Smoke rises from her nostrils. The very stones smolder." : subkind === "skeleton" ? "Hollow eyes turn toward you. Bone-clatter fills the silence." : "They have you outnumbered, but not outclassed."}`
    : `${name} of the ${faction} stands across your path, banners furled.`;

  const heroPower = hero.attack * 4 + hero.army.reduce((s,u)=>s+u.count,0);
  const enemyPower = power * 6;
  const verdict = heroPower > enemyPower * 1.2 ? "FAVORABLE" :
                  heroPower > enemyPower * 0.8 ? "EVEN ODDS" : "GRIM";

  return (
    <div className="modal-scrim" onClick={() => onResolve('flee')}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          ⚔  ENCOUNTER
          <small>{kind === "monster" ? "WILD THREAT" : "RIVAL LORD"} · ODDS: {verdict}</small>
        </div>
        <div className="modal-body">
          <div className="encounter-vs">
            <div className="enc-side">
              <div className="label">YOUR FORCE</div>
              <div className="who">{hero.name}</div>
              <div className="stats">
                <span>⚔ {hero.attack}</span>
                <span>🛡 {hero.defense}</span>
                <span>👥 {hero.army.reduce((s,u)=>s+u.count,0)}</span>
              </div>
            </div>
            <div className="enc-vs-text">VS</div>
            <div className="enc-side">
              <div className="label">{kind === "monster" ? "ENEMY" : "RIVAL"}</div>
              <div className="who">{handle || name}</div>
              <div className="stats">
                <span>⚔ {power}</span>
                {count && <span>👥 {count}</span>}
                {!count && <span>🐲 ELITE</span>}
              </div>
            </div>
          </div>

          <div className="enc-flavor">"{flavor}"</div>

          <div className="enc-actions">
            <button className="btn btn-fight" onClick={() => onResolve('fight')}>
              FIGHT
              <span className="sub">Engage in tactical combat</span>
            </button>
            <button className="btn btn-parley" onClick={() => onResolve('parley')}>
              PARLEY
              <span className="sub">{kind === "monster" ? "Try to scare them off" : "Offer terms via chain"}</span>
            </button>
            <button className="btn btn-flee" onClick={() => onResolve('flee')}>
              FLEE
              <span className="sub">Lose all movement this turn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TILE INFO MODAL — when clicking a feature with full info
// ============================================================
function TileInfoModal({ tile, onClose, onAttack, onEnter }) {
  if (!tile) return null;
  const { feat, terrain, r, c, otherHero } = tile;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 460 }}>
        <div className="modal-header">
          ⚑  {feat?.name || otherHero?.name || TERRAIN_NAMES[terrain]}
          <small>HEX {r},{c} · {TERRAIN_NAMES[terrain].toUpperCase()}</small>
        </div>
        <div className="modal-body">
          {otherHero && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                <div className="hero-portrait" style={{ width: 56, height: 56 }}>
                  <div className="helm"></div><div className="visor"></div><div className="neck"></div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--f-ui)", fontSize: 13, color: "var(--gold-bright)" }}>{otherHero.name}</div>
                  <div style={{ fontSize: 16, color: "var(--parch-2)" }}>{otherHero.title}</div>
                  <div style={{ fontFamily: "var(--f-ui)", fontSize: 10, color: otherHero.kind === "enemy" ? "var(--blood)" : "var(--mana-bright)", marginTop: 4 }}>
                    {otherHero.handle} · {otherHero.faction}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 17, color: "var(--parch)", marginBottom: 14 }}>{otherHero.army}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="btn btn-fight" onClick={() => { onAttack(otherHero); onClose(); }}>
                  ATTACK <span className="sub">Begin encounter</span>
                </button>
                <button className="btn btn-parley" onClick={onClose}>
                  {otherHero.kind === "enemy" ? "PROPOSE TRUCE" : "OPEN TRADE"}
                  <span className="sub">Via Hive memo</span>
                </button>
              </div>
            </>
          )}
          {feat && !otherHero && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                <div style={{ width: 64, height: 64, display: "grid", placeItems: "center", background: "#0a0810", border: "2px solid var(--stone-1)", boxShadow: "inset 0 0 0 1px var(--stone-3)" }}>
                  <div style={{ transform: "scale(1.6)" }}>
                    <FeatureGlyph kind={feat.kind} subkind={feat.subkind} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--gold-bright)" }}>{feat.name}</div>
                  {feat.faction && <div style={{ fontSize: 16, color: "var(--parch-2)" }}>{feat.faction}</div>}
                  {feat.yield && <div style={{ fontFamily: "var(--f-ui)", fontSize: 10, color: "var(--emerald)", marginTop: 4 }}>{feat.yield}</div>}
                  {feat.power && <div style={{ fontFamily: "var(--f-ui)", fontSize: 10, color: "var(--blood)", marginTop: 4 }}>POWER {feat.power}  ·  {feat.count} units</div>}
                </div>
              </div>
              {feat.desc && <div style={{ fontSize: 17, color: "var(--parch-2)", fontStyle: "italic", marginBottom: 14 }}>"{feat.desc}"</div>}
              <div style={{ display: "grid", gridTemplateColumns: feat.kind === "monster" ? "1fr 1fr" : "1fr", gap: 10 }}>
                {feat.kind === "monster" && (
                  <button className="btn btn-fight" onClick={() => { onAttack(feat); onClose(); }}>
                    ENGAGE <span className="sub">Open encounter</span>
                  </button>
                )}
                {feat.kind === "castle" && feat.subkind === "player" && (
                  <button className="btn btn-gold" onClick={onClose}>
                    ENTER KEEP <span className="sub">Manage garrison & build</span>
                  </button>
                )}
                {feat.kind === "castle" && feat.subkind !== "player" && (
                  <button className={`btn ${feat.subkind === "enemy" ? "btn-fight" : "btn-parley"}`} onClick={() => { feat.subkind === "enemy" ? onAttack(feat) : onClose(); }}>
                    {feat.subkind === "enemy" ? "BESIEGE" : "VISIT"}
                    <span className="sub">{feat.subkind === "enemy" ? "Heavy garrison" : "Trade & recruit"}</span>
                  </button>
                )}
                {feat.kind === "resource" && (
                  <button className="btn btn-gold" onClick={onClose}>
                    CLAIM <span className="sub">Move adjacent to take</span>
                  </button>
                )}
                {feat.kind === "treasure" && (
                  <button className="btn btn-gold" onClick={onClose}>
                    INSPECT <span className="sub">Move onto tile to open</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HIVE LOGIN MODAL — mocked Keychain handshake
// ============================================================
function HiveModal({ open, onClose, hiveUser }) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal hive-modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottomColor: "var(--blood-dark)" }}>
          ⬡  HIVE IDENTITY
          <small>SIGNED VIA KEYCHAIN · L2 SESSION ACTIVE</small>
        </div>
        <div className="modal-body">
          <div className="hive-logo">⬢ AETHERIA ⬢</div>
          <div className="hive-sub">SOVEREIGN LORDS PLAY ON CHAIN</div>

          <div className="hive-row">
            <div className="ico">⬡</div>
            <div className="info">
              <div className="lbl">SIGNED IN AS</div>
              <div className="val">{hiveUser}</div>
            </div>
            <div style={{ fontFamily: "var(--f-ui)", fontSize: 10, color: "var(--emerald)" }}>● ACTIVE</div>
          </div>
          <div className="hive-row">
            <div className="ico" style={{ background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)" }}>⚜</div>
            <div className="info">
              <div className="lbl">CHAIN ASSETS</div>
              <div className="val">3 heroes · 7 relics · 1 keep deed</div>
            </div>
          </div>
          <div className="hive-row">
            <div className="ico" style={{ background: "linear-gradient(135deg, var(--mana) 0%, #2a3870 100%)" }}>HBD</div>
            <div className="info">
              <div className="lbl">WALLET BALANCE</div>
              <div className="val">142.07 HIVE · 36.50 HBD</div>
            </div>
          </div>
          <div className="hive-row">
            <div className="ico" style={{ background: "linear-gradient(135deg, var(--emerald) 0%, #2a6038 100%)" }}>⚐</div>
            <div className="info">
              <div className="lbl">GUILD</div>
              <div className="val">Dawnward Pact · 14 members · 2nd seat</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={onClose}>
              VIEW LEDGER <span className="sub">Open chain explorer</span>
            </button>
            <button className="btn btn-gold" onClick={onClose}>
              CLOSE <span className="sub">Return to map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopBar, Sidebar, WorldLog,
  EncounterModal, TileInfoModal, HiveModal
});

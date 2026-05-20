/* APP — Aetheria
   Wires the map, sidebar, modals, and Tweaks into one prototype. */

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp, useCallback: useCallbackApp, useRef: useRefApp } = React;

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "showCoords": false,
  "showOtherPlayers": true,
  "hiveUser": "@aldwin.h",
  "season": "Spring",
  "day": 47
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULS);

  // ---- core game state ----
  const [hero, setHero] = useStateApp({ ...SELF_HERO });
  const [otherHeroes] = useStateApp(HEROES.filter(h => h.id !== "self"));
  const [resources, setResources] = useStateApp({
    gold: 14250, wood: 28, ore: 12, mana: 24, gems: 6
  });
  const [day, setDay] = useStateApp(t.day);
  const [season, setSeason] = useStateApp(t.season);

  // ---- interaction state ----
  const [selectedTile, setSelectedTile] = useStateApp(null);
  const [hoverTile, setHoverTile] = useStateApp(null);
  const [destTile, setDestTile] = useStateApp(null);
  const [pathPreview, setPathPreview] = useStateApp([]);
  const [encounter, setEncounter] = useStateApp(null);
  const [tileInfo, setTileInfo] = useStateApp(null);
  const [hiveOpen, setHiveOpen] = useStateApp(false);
  const [activeSpell, setActiveSpell] = useStateApp(null);
  const [panOffset, setPanOffset] = useStateApp({ x: 0, y: 0 });
  const [fxPops, setFxPops] = useStateApp([]);
  const fxIdRef = useRefApp(0);
  const moveLockRef = useRefApp(false);

  // ---- update day/season when tweaks change ----
  useEffectApp(() => { setDay(t.day); }, [t.day]);
  useEffectApp(() => { setSeason(t.season); }, [t.season]);

  // ---- compute path preview when hover changes (after selecting hero) ----
  useEffectApp(() => {
    if (!selectedTile || !hoverTile) { setPathPreview([]); return; }
    // Only show path when selectedTile is the hero
    if (selectedTile[0] !== hero.pos[0] || selectedTile[1] !== hero.pos[1]) {
      setPathPreview([]);
      return;
    }
    const blocked = (r, c) => {
      // Block on other heroes and monsters; allow destination if it's enemy/monster
      if (otherHeroes.some(h => h.pos[0]===r && h.pos[1]===c)) return true;
      const key = `${r},${c}`;
      const f = FEATURES[key];
      if (f && (f.kind === "monster" || (f.kind === "castle" && f.subkind === "enemy"))) return true;
      if (f && f.kind === "castle" && f.subkind === "neutral") return false;
      return false;
    };
    const path = findPath(hero.pos, hoverTile, MAP, blocked);
    setPathPreview(path || []);
  }, [selectedTile, hoverTile, hero.pos, otherHeroes]);

  // ---- spawn a damage / info pop ----
  const popFx = (text, r, c) => {
    const [x, y] = offsetToPixel(c, r);
    const id = fxIdRef.current++;
    setFxPops(prev => [...prev, { id, x, y: y - 20, text }]);
    setTimeout(() => setFxPops(prev => prev.filter(f => f.id !== id)), 1300);
  };

  // ---- tile click handler ----
  const onTileClick = useCallbackApp((r, c) => {
    if (moveLockRef.current) return;

    // SPELL MODE — cast on tile
    if (activeSpell) {
      const spell = SPELLS.find(s => s.id === activeSpell);
      const dist = hexDistance(hero.pos[0], hero.pos[1], r, c);
      if (spell.range === 0) {
        // self-target
        popFx(spell.name.toUpperCase(), hero.pos[0], hero.pos[1]);
      } else if (dist > spell.range) {
        popFx("OUT OF RANGE!", r, c);
        return;
      } else {
        popFx(spell.name.toUpperCase(), r, c);
      }
      setResources(prev => ({ ...prev, mana: Math.max(0, prev.mana - spell.cost) }));
      setHero(prev => ({ ...prev, mana: Math.max(0, prev.mana - spell.cost) }));
      setActiveSpell(null);
      return;
    }

    const key = `${r},${c}`;
    const feat = FEATURES[key];
    const otherHero = otherHeroes.find(h => h.pos[0]===r && h.pos[1]===c);

    // Click on hero — select self
    if (r === hero.pos[0] && c === hero.pos[1]) {
      setSelectedTile([r, c]);
      return;
    }

    // Click on feature/other hero — show info modal (single click)
    if (feat || otherHero) {
      const terrain = TERRAIN_LEGEND[MAP[r][c]];
      setTileInfo({ feat, otherHero, terrain, r, c });
      return;
    }

    // Otherwise: if hero is selected (or auto-selected), set destination and move
    if (!selectedTile || (selectedTile[0] !== hero.pos[0] || selectedTile[1] !== hero.pos[1])) {
      setSelectedTile([hero.pos[0], hero.pos[1]]);
    }

    // If they double-clicked / re-clicked the same destination — execute move
    if (destTile && destTile[0]===r && destTile[1]===c) {
      executeMove(r, c);
      return;
    }
    setDestTile([r, c]);
  }, [activeSpell, hero, otherHeroes, selectedTile, destTile]);

  // Double-click moves immediately
  const onTileDoubleClick = useCallbackApp((r, c) => {
    if (activeSpell) return;
    const key = `${r},${c}`;
    const feat = FEATURES[key];
    const otherHero = otherHeroes.find(h => h.pos[0]===r && h.pos[1]===c);
    if (feat || otherHero) return; // info modal handles those
    executeMove(r, c);
  }, [activeSpell, otherHeroes]);

  // ---- execute movement along path ----
  const executeMove = useCallbackApp((r, c) => {
    const blocked = (rr, cc) => {
      if (otherHeroes.some(h => h.pos[0]===rr && h.pos[1]===cc)) return true;
      const f = FEATURES[`${rr},${cc}`];
      if (f && (f.kind === "monster" || (f.kind === "castle" && f.subkind === "enemy"))) return true;
      return false;
    };
    const path = findPath(hero.pos, [r, c], MAP, blocked);
    if (!path || !path.length) {
      popFx("NO PATH", r, c);
      return;
    }
    // Step through, decrementing movement
    moveLockRef.current = true;
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx >= path.length) {
        clearInterval(stepInterval);
        moveLockRef.current = false;
        setPathPreview([]);
        setDestTile(null);
        return;
      }
      const [nr, nc] = path[stepIdx];
      const terrain = TERRAIN_LEGEND[MAP[nr][nc]];
      const cost = MOVE_COST[terrain] || 1;
      setHero(prev => {
        const nm = Math.max(0, prev.movement - cost);
        return { ...prev, pos: [nr, nc], movement: nm };
      });
      stepIdx++;
      // Check adjacency to enemy at end of step
      if (stepIdx === path.length) {
        // Look for adjacent enemies
        const adjacents = neighbors(nr, nc);
        for (const [ar, ac] of adjacents) {
          const f = FEATURES[`${ar},${ac}`];
          const oh = otherHeroes.find(h => h.pos[0]===ar && h.pos[1]===ac);
          if (oh && oh.kind === "enemy") {
            clearInterval(stepInterval);
            moveLockRef.current = false;
            setTimeout(() => setEncounter({ ...oh, handle: oh.handle }), 300);
            return;
          }
          if (f && f.kind === "monster") {
            clearInterval(stepInterval);
            moveLockRef.current = false;
            setTimeout(() => setEncounter({ ...f }), 300);
            return;
          }
        }
      }
    }, 180);
  }, [hero.pos, otherHeroes]);

  // ---- spellbook click ----
  const onSpellClick = (id) => {
    setActiveSpell(prev => prev === id ? null : id);
  };

  // ---- encounter resolution ----
  const onEncounterResolve = (action) => {
    const enc = encounter;
    setEncounter(null);
    if (action === 'fight') {
      popFx("VICTORY!", hero.pos[0], hero.pos[1]);
      setResources(prev => ({ ...prev, gold: prev.gold + 350 }));
      setHero(prev => ({ ...prev, movement: 0 }));
    } else if (action === 'parley') {
      popFx("TRUCE", hero.pos[0], hero.pos[1]);
    } else {
      popFx("FLED", hero.pos[0], hero.pos[1]);
      setHero(prev => ({ ...prev, movement: 0 }));
    }
  };

  // ---- end turn ----
  const onEndTurn = () => {
    setDay(d => d + 1);
    setHero(prev => ({
      ...prev,
      movement: prev.movementMax,
      mana: Math.min(prev.manaMax, prev.mana + 4)
    }));
    setResources(prev => ({
      ...prev,
      gold: prev.gold + 1000,
      wood: prev.wood + 4,
      ore:  prev.ore + 2,
      mana: prev.mana + 5,
    }));
    popFx("+1000 GOLD", hero.pos[0], hero.pos[1]);
  };

  // ---- minimap click — pan to that area ----
  const onMinimapClick = (px, py) => {
    const targetX = px * ((COLS + 0.5) * STRIDE_X);
    const targetY = py * (ROWS * STRIDE_Y);
    setPanOffset({
      x: ((COLS + 0.5) * STRIDE_X)/2 - targetX,
      y: (ROWS * STRIDE_Y)/2 - targetY,
    });
  };

  // ---- attack from tile info ----
  const onAttack = (target) => {
    setEncounter(target);
  };

  // ---- hover tooltip ----
  const tooltipContent = useMemoApp(() => {
    if (!hoverTile) return null;
    const [r, c] = hoverTile;
    const terrain = TERRAIN_LEGEND[MAP[r][c]];
    const feat = FEATURES[`${r},${c}`];
    const oh = otherHeroes.find(h => h.pos[0]===r && h.pos[1]===c);
    const isHero = r === hero.pos[0] && c === hero.pos[1];
    const dist = hexDistance(hero.pos[0], hero.pos[1], r, c);
    const cost = MOVE_COST[terrain] || 1;
    return { r, c, terrain, feat, oh, isHero, dist, cost };
  }, [hoverTile, hero.pos, otherHeroes]);

  const activeSpellObj = SPELLS.find(s => s.id === activeSpell);

  return (
    <div className="app">
      <div className="topbar-wrap" style={{ display: "contents" }}>
        <TopBar
          resources={resources}
          day={day}
          season={season}
          onHiveClick={() => setHiveOpen(true)}
          hiveUser={t.hiveUser}
        />
      </div>

      <div className="mapwrap">
        <HexMap
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
          hoverTile={hoverTile}
          setHoverTile={setHoverTile}
          pathPreview={pathPreview}
          destTile={destTile}
          onTileClick={onTileClick}
          onTileDoubleClick={onTileDoubleClick}
          showCoords={t.showCoords}
          showOtherPlayers={t.showOtherPlayers}
          heroPos={hero.pos}
          otherHeroes={otherHeroes}
          spellMode={!!activeSpell}
          fxPops={fxPops}
          panOffset={panOffset}
          setPanOffset={setPanOffset}
        />

        <div className="map-vignette"></div>

        {/* Turn banner */}
        <div className="turn-banner">
          <div className="dot"></div>
          <span>YOUR TURN</span>
          <span className="day">DAY {day} · {season.toUpperCase()}</span>
        </div>

        {/* Spell mode banner */}
        {activeSpell && (
          <div className="spell-mode-banner">
            ✦ CASTING {activeSpellObj.name.toUpperCase()} — CLICK A TARGET HEX (RANGE {activeSpellObj.range || "SELF"})
            <button onClick={() => setActiveSpell(null)} style={{ color: "var(--parch)", marginLeft: 14, fontFamily: "var(--f-ui)", fontSize: 10 }}>[CANCEL]</button>
          </div>
        )}

        {/* Action bar */}
        <div className="action-bar">
          <button className="btn" onClick={() => setActiveSpell(null)}>HEROES</button>
          <button className="btn" onClick={() => {
            const f = Object.entries(FEATURES).find(([k,v]) => v.kind === "castle" && v.subkind === "player");
            if (f) {
              const [r, c] = f[0].split(',').map(Number);
              setPanOffset({ x: 0 - offsetToPixel(c, r)[0] + ((COLS+0.5)*STRIDE_X)/2, y: 0 - offsetToPixel(c, r)[1] + (ROWS*STRIDE_Y)/2 });
            }
          }}>CENTER ON KEEP</button>
          <button className="end-turn" onClick={onEndTurn}>⌛ END TURN</button>
          <button className="btn" onClick={() => setHiveOpen(true)}>GUILD</button>
          <button className="btn">CHAT</button>
        </div>

        {/* Hover info — fixed corner */}
        {tooltipContent && !tileInfo && !encounter && (
          <HoverPanel data={tooltipContent} />
        )}
      </div>

      <Sidebar
        hero={hero}
        activeSpell={activeSpell}
        onSpellClick={onSpellClick}
        mapState={null}
        panOffset={panOffset}
        onMinimapClick={onMinimapClick}
      />

      <WorldLog />

      {/* Modals */}
      <EncounterModal encounter={encounter} onResolve={onEncounterResolve} hero={hero} />
      <TileInfoModal tile={tileInfo} onClose={() => setTileInfo(null)} onAttack={onAttack} />
      <HiveModal open={hiveOpen} onClose={() => setHiveOpen(false)} hiveUser={t.hiveUser} />

      {/* Tweaks panel */}
      <TweaksPanel title="TWEAKS">
        <TweakSection label="World">
          <TweakToggle label="Show hex coords" value={t.showCoords} onChange={v => setTweak('showCoords', v)} />
          <TweakToggle label="Show other players" value={t.showOtherPlayers} onChange={v => setTweak('showOtherPlayers', v)} />
          <TweakRadio label="Season" value={t.season} options={["Spring", "Summer", "Autumn", "Winter"]} onChange={v => setTweak('season', v)} />
          <TweakSlider label="Day" value={t.day} min={1} max={120} step={1} onChange={v => setTweak('day', v)} />
        </TweakSection>
        <TweakSection label="Hive identity">
          <TweakText label="Your @handle" value={t.hiveUser} onChange={v => setTweak('hiveUser', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Hover info — top-left corner panel
function HoverPanel({ data }) {
  if (!data) return null;
  const { r, c, terrain, feat, oh, isHero, dist, cost } = data;
  return (
    <div style={{
      position: "absolute",
      top: 14, left: 14,
      zIndex: 40,
      background: "rgba(20, 17, 29, 0.94)",
      border: "2px solid var(--gold-dark)",
      boxShadow: "inset 0 0 0 1px var(--gold), 0 0 0 1px #000",
      padding: "8px 12px",
      fontFamily: "var(--f-ui)",
      fontSize: 10,
      color: "var(--parch)",
      minWidth: 200,
      letterSpacing: 0.5,
    }}>
      <div style={{ fontSize: 12, color: "var(--gold-bright)", marginBottom: 4 }}>
        {feat?.name || oh?.name || (isHero ? "Sir Aldwin" : TERRAIN_NAMES[terrain])}
      </div>
      <div style={{ color: "var(--parch-2)", fontSize: 9, marginBottom: 6 }}>
        HEX {r},{c} · {TERRAIN_NAMES[terrain].toUpperCase()} · COST {cost}
      </div>
      {!isHero && (
        <div style={{ color: "var(--parch-2)", fontSize: 9 }}>
          DISTANCE: {dist} HEX{dist !== 1 ? "ES" : ""}
        </div>
      )}
      {feat?.kind === "monster" && (
        <div style={{ color: "var(--blood)", fontSize: 9, marginTop: 4 }}>
          ⚔ {feat.count} units · PWR {feat.power}
        </div>
      )}
      {oh && (
        <div style={{ color: oh.kind === "enemy" ? "var(--blood)" : "var(--mana-bright)", fontSize: 9, marginTop: 4 }}>
          {oh.handle} · {oh.faction}
        </div>
      )}
      {feat?.kind === "resource" && (
        <div style={{ color: "var(--emerald)", fontSize: 9, marginTop: 4 }}>
          {feat.yield}
        </div>
      )}
    </div>
  );
}

// Tooltip
function TileTooltip({ data }) { return null; }

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

/* HEX MAP — Aetheria
   Renders the hex grid with terrain, features, heroes.
   Handles selection, pathing preview, movement, encounters. */

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ---------------- Feature glyph render ----------------
function FeatureGlyph({ kind, subkind }) {
  if (kind === "castle") {
    return (
      <div className={`g-castle ${subkind}`}>
        <div className="tower left"></div>
        <div className="tower right"></div>
        <div className="wall"></div>
        <div className="tower center"></div>
        <div className="gate"></div>
        <div className="flag"></div>
      </div>
    );
  }
  if (kind === "monster") {
    if (subkind === "dragon") return (
      <div className="g-dragon">
        <div className="body"></div>
        <div className="wing"></div>
        <div className="head"></div>
        <div className="eye"></div>
      </div>
    );
    if (subkind === "skeleton") return (
      <div className="g-skeleton"><div className="skull"></div><div className="ribs"></div></div>
    );
    if (subkind === "orc") return (
      <div className="g-orc"><div className="body"></div><div className="head"></div><div className="eye"></div><div className="blade"></div></div>
    );
  }
  if (kind === "resource") {
    if (subkind === "gold")  return <div className="g-mine"><div className="rock"></div><div className="vein"></div></div>;
    if (subkind === "mana")  return <div className="g-mana"><div className="crystal"></div></div>;
    if (subkind === "wood")  return <div className="g-sawmill"><div className="roof"></div><div className="house"></div></div>;
  }
  if (kind === "treasure") return <div className="g-chest"></div>;
  return null;
}

function HeroGlyph({ heroKind }) {
  const cls = heroKind === "self" ? "" :
              heroKind === "enemy" ? "p2" :
              heroKind === "ally" ? "p3" : "p4";
  return (
    <div className={`g-hero ${cls}`}>
      <div className="pole"></div>
      <div className="banner"></div>
      <div className="helmet"></div>
      <div className="visor"></div>
      <div className="body"></div>
      <div className="crest"></div>
    </div>
  );
}

// Vegetation decoration on plain terrain (deterministic by row/col)
function TerrainDecor({ terrain, row, col }) {
  // pseudo-random based on position
  const seed = (row * 17 + col * 31) % 100;
  if (terrain === "forest") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "grid", placeItems: "center" }}>
        <div className="g-tree" style={{ transform: `translate(${(seed%4)-2}px, ${(seed%3)-1}px) scale(${0.85 + (seed%5)/20})` }}></div>
      </div>
    );
  }
  if (terrain === "mountain") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "grid", placeItems: "center" }}>
        <div className="g-mountain"></div>
      </div>
    );
  }
  if (terrain === "water") {
    return (
      <div style={{ position: "absolute", top: "40%", left: "20%", pointerEvents: "none" }}>
        <div className="g-wave"></div>
      </div>
    );
  }
  if (terrain === "desert" && seed % 3 === 0) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "grid", placeItems: "center" }}>
        <div className="g-cactus"></div>
      </div>
    );
  }
  if (terrain === "snow" && seed % 4 === 0) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "grid", placeItems: "center" }}>
        <div className="g-mountain" style={{ transform: "scale(0.6)" }}></div>
      </div>
    );
  }
  return null;
}

// ---------------- HexMap component ----------------
function HexMap({
  selectedTile, setSelectedTile,
  hoverTile, setHoverTile,
  pathPreview, destTile,
  onTileClick, onTileDoubleClick,
  showCoords, showOtherPlayers,
  heroPos, otherHeroes,
  spellMode, fxPops,
  panOffset, setPanOffset,
}) {
  const wrapRef = useRef(null);
  const dragRef = useRef(null);

  // Compute map pixel dimensions
  const mapWidth  = (COLS + 0.5) * STRIDE_X + 4;
  const mapHeight = (ROWS - 1) * STRIDE_Y + HEX_H + 4;

  // Center map on player on first mount
  useEffect(() => {
    if (wrapRef.current && panOffset.x === 0 && panOffset.y === 0) {
      const w = wrapRef.current.clientWidth;
      const h = wrapRef.current.clientHeight;
      const [hx, hy] = offsetToPixel(heroPos[1], heroPos[0]);
      // center hero
      const initX = -(hx - mapWidth/2) - 0; // around translate(-50%) baseline of map-grid
      const initY = -(hy - mapHeight/2);
      // Adjust: map-grid is anchored at top:50% left:50% with internal coordinate origin at top-left of grid.
      // We want hero (hx, hy) to appear at center, so pan = (mapWidth/2 - hx, mapHeight/2 - hy)
      setPanOffset({
        x: (mapWidth/2 - hx),
        y: (mapHeight/2 - hy),
      });
    }
  // eslint-disable-next-line
  }, []);

  // Pan handling
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.hex')) return; // let hex clicks through
    dragRef.current = { x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPanOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  };
  const onMouseUp = () => { dragRef.current = null; };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  // Path lookup
  const pathSet = useMemo(() => {
    const s = new Set();
    pathPreview?.forEach(([r,c]) => s.add(`${r},${c}`));
    return s;
  }, [pathPreview]);

  // Other heroes lookup
  const heroByPos = useMemo(() => {
    const m = new Map();
    otherHeroes.forEach(h => m.set(`${h.pos[0]},${h.pos[1]}`, h));
    return m;
  }, [otherHeroes]);

  return (
    <div
      ref={wrapRef}
      className="map-pan"
      onMouseDown={onMouseDown}
    >
      <div
        className="map-grid"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))`,
        }}
      >
        {MAP.map((row, r) =>
          [...row].map((char, c) => {
            const terrain = TERRAIN_LEGEND[char] || 'grass';
            const [x, y] = offsetToPixel(c, r);
            const isSelected = selectedTile && selectedTile[0]===r && selectedTile[1]===c;
            const isDest = destTile && destTile[0]===r && destTile[1]===c;
            const isPath = pathSet.has(`${r},${c}`);
            const isHero = heroPos[0]===r && heroPos[1]===c;
            const isOther = showOtherPlayers && heroByPos.has(`${r},${c}`);
            const feat = FEATURES[`${r},${c}`];

            const cls = [
              "hex",
              `t-${terrain}`,
              isSelected ? "selected" : "",
              isDest ? "dest" : "",
              isPath ? "path" : "",
              isHero ? "has-hero hero-self" : "",
            ].filter(Boolean).join(" ");

            return (
              <div
                key={`${r},${c}`}
                className={cls}
                style={{ left: x, top: y }}
                onClick={() => onTileClick(r, c)}
                onDoubleClick={() => onTileDoubleClick && onTileDoubleClick(r, c)}
                onMouseEnter={() => setHoverTile([r, c])}
              >
                <div className="hex-inner">
                  <TerrainDecor terrain={terrain} row={r} col={c} />
                  {feat && (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                      <FeatureGlyph kind={feat.kind} subkind={feat.subkind} />
                    </div>
                  )}
                  {showCoords && (
                    <div className="hex-coord">{r},{c}</div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* HERO LAYER — unclipped, rendered above all tiles */}
        {(() => {
          const heroes = [
            { ...SELF_HERO, kind: "self", pos: heroPos, handle: "@aldwin.h" }
          ];
          if (showOtherPlayers) heroes.push(...otherHeroes);
          return heroes.map(h => {
            const [hx, hy] = offsetToPixel(h.pos[1], h.pos[0]);
            const isSelf = h.kind === "self";
            return (
              <div key={h.id} style={{
                position: "absolute",
                left: hx + 32 - 20,
                top: hy + 36 - 26,
                width: 40, height: 50,
                pointerEvents: "none",
                zIndex: 10,
                transform: isSelf ? "scale(1.25)" : "scale(1.1)",
                transformOrigin: "center bottom",
                filter: isSelf ? "drop-shadow(0 0 6px rgba(240, 224, 128, 0.6))" : "none",
              }}>
                <HeroGlyph heroKind={h.kind === "self" ? "self" : h.kind} />
                <div className={`hero-handle ${h.kind !== "self" ? h.kind : ""}`}>
                  {h.handle}
                </div>
              </div>
            );
          });
        })()}

        {/* FX pops */}
        {fxPops.map(fx => (
          <div key={fx.id} className="fx-pop" style={{ left: fx.x, top: fx.y }}>{fx.text}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HexMap, FeatureGlyph, HeroGlyph });

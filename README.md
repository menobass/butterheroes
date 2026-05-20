# Heroes of Butter — Aetheria: The Sundered Realms

A browser-based hex-grid strategy game prototype inspired by the Heroes of Might and Magic series, built with React (via CDN/Babel — no build step required).

## Running Locally

Just open `Aetheria.html` in a browser. Because the `.jsx` files are loaded via `<script type="text/babel">`, you need to serve the files over HTTP rather than opening directly from the filesystem (to avoid CORS issues):

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080/Aetheria.html
```

## Project Structure

| File | Purpose |
|------|---------|
| `Aetheria.html` | Entry point — loads React, Babel, and all modules |
| `app.jsx` | Root component — wires map, sidebar, modals, and tweaks |
| `hex-map.jsx` | Hex grid renderer and pathfinding |
| `ui-shell.jsx` | HUD, sidebar panels, modals (encounters, Hive wallet) |
| `tweaks-panel.jsx` | Dev tweaks overlay for rapid iteration |
| `world-data.jsx` | Map tiles, hero definitions, and feature data |
| `styles.css` | All game styles |
| `screenshots/` | Progress screenshots |

## Tech Stack

- React 18 (UMD build via unpkg)
- Babel Standalone (JSX transform in-browser)
- Plain CSS — no framework
- No build toolchain required

## Screenshots

![Initial view](screenshots/initial.png)

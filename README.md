# ROGUESNEK — Cyberpunk Roguelike Snake Engine

[![Version](https://img.shields.io/badge/Version-1.5.0-brightgreen.svg)](package.json)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646cff.svg)](https://vitejs.dev/)
[![HTML5 Canvas](https://img.shields.io/badge/Render-HTML5%20Canvas-E34F26.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ROGUESNEK** is a high-octane cyberpunk terminal roguelike that transforms the classic retro Snake formula into a deep, tactical arcade deckbuilder. Navigate procedural cyberspace grids, survive lethal anomalies, draft cybernetic relics, trigger active tactical powerups, and upgrade your grid in the terminal black market.

---

## Table of Contents
- [Gameplay & Mechanics](#gameplay--mechanics)
- [Relics & Powerups](#relics--powerups)
- [System Anomalies & Events](#system-anomalies--events)
- [Inter-Level Cyber Shop](#inter-level-cyber-shop)
- [Controls & Keybindings](#controls--keybindings)
- [System Requirements & Dependencies](#system-requirements--dependencies)
- [How to Build & Run](#how-to-build--run)
- [Custom Sandbox & Cheat Engine](#custom-sandbox--cheat-engine)
- [Project Architecture](#project-architecture)
- [License](#license)

---

## Gameplay & Mechanics

1. **Procedural Grid Navigation**: Collect data nodes (Apples) to grow your byte stream and gather Crypto Credits (Coins) to spend between floors.
2. **Dynamic Level Progression**: Every 5 level requirements (`LEVEL_REQ`), the grid clears and opens a **Relic Draft Phase**.
3. **Dynamic Shrinking Borders**: The grid perimeter shrinks dynamically over time, squeezing the playable space and forcing high-speed tactical routing.
4. **Hazards & Malware**: Dodge static mines, toxic glitch pods, and roving pulse orbs.

---

## Relics & Powerups

### 🧬 Passive Relics (Drafted on Level Completion)

| Relic | Rarity | Symbol | Effect |
| :--- | :--- | :---: | :--- |
| **Nutrient Rich** | Common | `[+]` | Apples yield **+2 Length** instead of +1, accelerating score gain. |
| **Greed Protocol** | Common | `[$]` | Crypto Coins spawn **2x more frequently** across the grid. |
| **Phase Bit** | Rare | `[#]` | Taking damage grants **2 seconds of absolute invulnerability**. |
| **Elasticity** | Legendary | `[~]` | Colliding with border walls deals **0 damage** (bounce safely). |

### ⚡ Active Powerups (Triggered via `Spacebar` / On-Screen Button)

| Powerup | Rarity | Cooldown | Effect |
| :--- | :--- | :---: | :--- |
| **Overclock** | Common | `20s` | Triggers **3 seconds of 2x speed & Godmode**, plowing through hazards. |
| **Deflector** | Rare | `30s` | Deploys an energy barrier that **completely absorbs the next damage hit**. |
| **EMP Blast** | Legendary | `60s` | Emits a full-screen electromagnetic shockwave that **vaporizes all hazards**. |

---

## System Anomalies & Events

During runs, random cyberspace system anomalies will trigger dynamically:

| Anomaly | Type | Duration | Description |
| :--- | :---: | :---: | :--- |
| **Firewall** | 🔴 Hostile | 60s | Grid borders turn into lethal firewalls. Any contact causes instant death! |
| **Overclock Event** | 🔴 Hostile | 5s | Involuntary double game speed surge. |
| **Snail Trail** | 🟢 Beneficial | 30s | Snake movement speed reduced by 30% for ultra-precise micro-dodging. |
| **Double Everything** | 🟡 Neutral | 15s | 2x spawn rate for all hazards, coins, and food nodes simultaneously. |
| **Glitch Storms** | 🔴 Hostile | 10s | Rapidly generates clusters of proximity mines across the grid. |
| **Golden Frenzy** | 🟢 Beneficial | 8s | Massive burst of Crypto Coins while borders temporarily contract. |
| **Magnetic Field** | 🟢 Beneficial | 15s | Gravitational pull draws nearby coins and apples directly to your head. |
| **Cache Clear** | 🟢 Beneficial | Instant | Board sanitizer wipes all active hazards immediately. |
| **System Injection** | 🟢 Beneficial | Instant | Injects immediate credit bonus scaled with difficulty inflation. |
| **Mining Malware** | 🔴 Hostile | Instant | Spawns sudden explosive cluster mines in your vicinity. |

---

## Inter-Level Cyber Shop

Between sector clearances, access the **Terminal Black Market** to spend your Crypto Credits:

- 💉 **Data Defrag / Repair**: Recover health and append +5 growth segments.
- ⚡ **Overclock Powerup**: Permanently reduce active powerup cooldown by 20%.
- 📐 **Expand Firewall Bounds**: Purchase grid expansions to enlarge the border perimeter.

---

## Controls & Keybindings

### Desktop (Configurable)
- **Movement**: `Arrow Keys` or `W`, `A`, `S`, `D`
- **Activate Powerup**: `Spacebar`
- **Pause / Menu**: `Escape`

### Mobile & Touchscreens
- **Movement**: Intuitive directional **Swipe Gestures** anywhere on canvas.
- **Activate Powerup**: Tap on the active powerup status card on the HUD.

---

## System Requirements & Dependencies

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (v9+), `yarn`, or `pnpm`
- **Core Dependencies**:
  - `react` (`^18.3.1`)
  - `react-dom` (`^18.3.1`)
- **Build Tools**:
  - `vite` (`^5.4.1`)
  - `@vitejs/plugin-react` (`^4.3.1`)
  - `vite-plugin-singlefile` (`^2.3.0`) — Compiles the entire game into a standalone, single offline HTML file.

---

## How to Build & Run

### 🚀 One-Click Launcher (Recommended)
Run the bundled launcher script:
```bash
cd ROGUESNEK
chmod +x launch_roguesnek.sh
./launch_roguesnek.sh
```

### 🛠️ Manual Development Server
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 📦 Production Single-File Build
```bash
npm run build
```
This outputs a completely self-contained, single-file HTML executable in `dist/index.html` that can be run locally or hosted anywhere with zero external network dependencies!

```bash
# Preview the production build locally
npm run preview
```

---

## Custom Sandbox & Cheat Engine

Access the **Custom / Sandbox Mode** from the Main Menu to tailor your experience:
- 🛡️ **God Mode Toggle**: Immune to hazards and wall collisions.
- ⏩ **Speed Modifier**: Adjust game loop tick rate (0.5x slow-mo to 3.0x ultra-speed).
- 🧱 **Shrinking Borders Switch**: Enable or disable dynamic perimeter contraction.
- 💰 **Infinite Crypto Credits**: Test full relic drafts and shop upgrades without constraints.

---

## Project Architecture

```text
ROGUESNEK/
├── index.html                   # HTML entry point with retro viewport configuration
├── vite.config.js               # Vite config with React & SingleFile plugin
├── package.json                 # Project dependencies and npm scripts
├── launch_roguesnek.sh          # One-click execution & build script
├── main.jsx                     # React DOM root mounting
├── App.jsx                      # Main UI coordinator & canvas container
├── constants.js                 # Items, Relics, Powerups, and Anomaly databases
├── hooks/
│   └── useGameState.jsx         # Unified reactive game state hook
├── components/
│   ├── HUD.jsx                  # Cyberpunk CRT scanline HUD & active cooldowns
│   ├── Menu.jsx                 # Main menu, custom sandbox, & keybind remapping
│   ├── Shop.jsx                 # Inter-level Black Market terminal
│   ├── DraftOverlay.jsx         # Roguelike 3-card Relic draft selection
│   └── TerminalMenuBox.jsx      # Reusable retro terminal frame wrapper
├── utils/
│   ├── GameEngine.js            # Core 60FPS Canvas game loop & collision logic
│   ├── logic.js                 # Grid bounds, damage calculation, & scaling
│   ├── rng.js                   # Seeded procedural placement & hazard distribution
│   └── formatters.js            # Score formatting & time parsing utilities
└── dist/                        # Compiled single-file deployment output
```

---

## License

This project is licensed under the [MIT License](LICENSE).

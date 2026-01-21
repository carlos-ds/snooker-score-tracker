# 🎱 Snooker Score Tracker

> **Professional scoring app for 1v1 snooker matches** — Built as a Progressive Web App for seamless offline play

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Netlify](https://img.shields.io/badge/Netlify-Live-00C7B7?logo=netlify&logoColor=white)](https://snooker-score-tracker.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<h3 align="center">
  <a href="https://snooker-score-tracker.netlify.app/">🎯 Try it Live</a>
</h3>

---
## ✨ Key Features

### 🎯 Complete Snooker Scoring
- **Real-time score tracking** for two players
- **Break tracking** with visual ball sequence display
- **Points remaining** calculation and lead indicators
- **Frame and match scoring** with best-of-X format support

### 📋 Full Rules Implementation
- **Red & color phases** with proper ball sequencing
- **Strict color order** (Yellow → Green → Brown → Blue → Pink → Black)
- **Free ball rule** with correct point allocation
- **Foul penalties** (4-7 points based on ball involved)
- **Three-miss rule** — automatic frame loss after 3 consecutive misses
- **Respotted black tiebreaker** with coin toss for first shot
- **Frame resignation** option

### 🔄 Game Management
- **Undo** — revert any shot or action
- **End break** — switch turns without recording a foul
- **Play again** — rematch with same players and settings
- **New game** — fresh start with new players

### 📊 Statistics
- **Match statistics** — total points, balls potted, highest break, centuries
- **Per-player breakdown** — individual scores, fouls, breaks
- **Frame-by-frame analysis** — detailed stats for each frame

### 📱 PWA / Offline Support
- **Installable** on mobile and desktop devices
- **Works offline** — full functionality without internet
- **Local data persistence** using IndexedDB
- **Service worker caching** for instant loading

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [React 19](https://react.dev/) with [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) with React Compiler |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| **State/Server** | [TanStack Query](https://tanstack.com/query) |
| **Database** | [Dexie.js](https://dexie.org/) (IndexedDB wrapper) |
| **Styling** | Vanilla CSS with custom design system |
| **Fonts** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), [Sora](https://fonts.google.com/specimen/Sora) |
| **PWA** | Custom Service Worker with precache manifest |
| **Hosting** | [Netlify](https://www.netlify.com/) with continuous deployment |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ 
- npm 9+ (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/snooker-score-tracker.git

# Navigate to project directory
cd snooker-score-tracker

# Install dependencies
npm install
```

### Development Mode

```bash
# Start development server (without PWA/offline support)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> ⚠️ **Note:** Development mode does not include PWA/offline functionality. The service worker is only generated during the production build.

### Production Mode (with PWA/Offline Support)

To run the app with full PWA capabilities (installable, offline support):

```bash
# Build for production
npm run build

# Serve the production build
npx serve dist
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can now install the app and use it offline.

---

## 🎮 Game Setup Flow

Setting up a match is a simple 3-step wizard:

### Step 1: Select Reds
Choose the number of red balls to start with:
- **6 reds** — shorter game (~45 mins)
- **10 reds** — medium game (~60 mins)  
- **15 reds** — full professional game (~90 mins)

### Step 2: Select Frames
Choose the match format (best-of-X):
- Quick presets: **1**, **3**, **5**, or **7** frames
- Custom input for longer matches (must be odd number)

### Step 3: Enter Player Names
- Enter names for **Player 1** and **Player 2**
- Names must be different
- Press Enter or click "Start Game" to begin

---

## 📜 Supported Snooker Rules

### Scoring Phases

| Phase | Description |
|-------|-------------|
| **Reds Phase** | Alternate between potting reds (1 pt) and colors (2-7 pts). Colors are respotted. |
| **Free Color Choice** | After potting the final red, player gets one free color choice. |
| **Strict Color Order** | Once all reds are gone, pot colors in order: Yellow (2) → Green (3) → Brown (4) → Blue (5) → Pink (6) → Black (7). |

### Ball Point Values

| Ball | Points | Foul Penalty |
|------|--------|--------------|
| 🔴 Red | 1 | 4 |
| 🟡 Yellow | 2 | 4 |
| 🟢 Green | 3 | 4 |
| 🟤 Brown | 4 | 4 |
| 🔵 Blue | 5 | 5 |
| 🩷 Pink | 6 | 6 |
| ⚫ Black | 7 | 7 |
| ⚪ Cue Ball | — | 4 |

### Special Rules

| Rule | Implementation |
|------|----------------|
| **Free Ball** | After a foul leaves player snookered, they can nominate any ball as the "ball on". Points scored equal the actual ball on, not the nominated ball. |
| **Miss Rule** | Track consecutive misses per player. After 3 misses, that player forfeits the frame. |
| **Respotted Black** | If scores are tied after the final black, the black is respotted. A coin toss determines who breaks. First score (pot or foul) wins the frame. |
| **Frame Resignation** | Players can concede a frame at any time. The opponent wins the frame. |

---

## 📱 PWA Features

### Installation
The app can be installed on any device:
- **Mobile (iOS/Android)**: Tap "Add to Home Screen" in browser menu
- **Desktop (Chrome/Edge)**: Click install icon in address bar

### Offline Capability
- All game data stored locally in IndexedDB
- Service worker precaches all assets on first load
- Full functionality without internet connection
- Data persists across sessions

### How It Works
1. On build, `generate-sw-manifest.js` creates a precache list from Vite's manifest
2. The service worker (`sw.js`) caches all assets on install
3. Cache-first strategy serves content instantly
4. SPA routing works offline via index.html fallback

---

## 📁 Project Structure

```
snooker-score-tracker/
├── public/                     # Static assets
│   ├── favicon/               # Favicon variants
│   ├── icon-*.png             # PWA icons
│   ├── manifest.json          # PWA manifest
│   ├── sw-template.js         # Service worker template
│   ├── _headers               # Netlify headers
│   └── _redirects             # Netlify SPA redirects
│
├── scripts/
│   └── generate-sw-manifest.js # Post-build SW generator
│
├── src/
│   ├── components/            # React components
│   │   ├── Balls/            # Ball display components
│   │   ├── CoinTossModal/    # Respotted black coin toss
│   │   ├── FoulModal/        # Foul selection modal
│   │   ├── FrameContainer/   # Main frame wrapper
│   │   ├── FrameDisplay/     # Score display & break sequence
│   │   ├── GameControls/     # Menu actions (resign, new game)
│   │   ├── GameSetup/        # 3-step setup wizard
│   │   ├── MatchCompleteView/# Match winner display
│   │   ├── MatchScoreHeader/ # Frame score header
│   │   ├── ShotButtons/      # Ball potting buttons
│   │   └── ...               # Other UI components
│   │
│   ├── config/
│   │   └── constants.ts      # Game rules, ball values, query keys
│   │
│   ├── features/             # Feature-based logic
│   │   ├── frame/           # Frame operations & hooks
│   │   ├── game/            # Game operations & hooks
│   │   ├── player/          # Player operations & hooks
│   │   ├── shot/            # Shot recording, undo, fouls
│   │   └── statistics/      # Match statistics calculation
│   │
│   ├── lib/
│   │   ├── db.ts            # Dexie database schema
│   │   └── queryClient.ts   # TanStack Query configuration
│   │
│   ├── pages/               # Page components
│   │   ├── Game/           # Active game page
│   │   ├── Home/           # Game setup page
│   │   └── Statistics/     # Post-match statistics
│   │
│   ├── routes/              # TanStack Router route definitions
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home route (/)
│   │   ├── game.tsx        # Game route (/game)
│   │   └── statistics.tsx  # Stats route (/statistics)
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── frame.ts        # Frame types
│   │   ├── game.ts         # Game types
│   │   ├── player.ts       # Player types
│   │   └── shot.ts         # Shot types
│   │
│   ├── main.tsx            # App entry point
│   └── routeTree.gen.ts    # Auto-generated route tree
│
├── index.html              # HTML entry point
├── index.css               # Global styles
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## �‍💻 Authors

This project was created by **Keano Segers** and **Cas Verheye** for a programming course at **Artevelde University of Applied Sciences**.

---

## �📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made by Keano Segers & Cas Verheye**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Star on GitHub](../../stargazers)

</div>
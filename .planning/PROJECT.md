# Snake Game — Project Specification

## 1. Project Overview
A high-quality, modern, browser-based Snake game built with Vanilla JavaScript and HTML5 Canvas. The game captures the nostalgic essence of the classic 1997 Nokia snake and Google's Doodle Snake, upgraded with modern responsive UI, 6 game modes, unlockable skins, dynamic board themes, particle effects, sound effects, and full desktop/mobile input support.

## 2. Core Value Proposition
- **Instant Playability**: 100% Free & Open Source, zero build tools, zero installations, runnable directly in any browser.
- **Rich Gameplay Modes**: From Classic and No Walls to Two-Headed, Moving Targets, Broken Snake, and Speed Demon.
- **Deep Progression**: Unlockable snake skins, fruit varieties, and board themes driven by score milestones persisted in `localStorage`.
- **Cross-Platform Polish**: Smooth 60fps canvas rendering, responsive layouts, keyboard controls for desktop, and swipe + on-screen D-pad for mobile.

## 3. Tech Stack
- **Language**: Vanilla JavaScript (ES6+ Modules)
- **Rendering**: HTML5 Canvas 2D API (60fps requestAnimationFrame loop)
- **Styling**: Modern CSS3 + CSS Custom Properties (Theme variables)
- **Audio**: Web Audio API / Howler.js with fallback sound synthesis
- **Persistence**: `localStorage` (High scores, leaderboard, settings, unlocked skins/themes)
- **Assets**: Scraped assets in `snake/` (`apple_types.png`, `trophy_types.png`, `die.png`, `eat.png`, `effect.png`, `blink.png`, `tongue.png`, UI SVGs/PNGs)

## 4. Architectural Boundaries
- **Core Loop & Entities**: Decoupled `GameLoop`, `Snake`, `Food`, and `Particle` entities.
- **Collision & Modes**: Strategy pattern via `GameMode` base class allowing clean mode overrides without touching the core collision engine.
- **Decoupled Messaging**: Simple `EventBus` pub/sub for cross-module communication (e.g., `food:eaten`, `game:over`).
- **Storage & State**: Centralized `Storage` abstraction managing keys, migrations, and serialization safely.

## 5. Constraints & Non-Goals
- **No Heavy Frameworks**: No React, Vue, or Webpack/Vite build steps needed. Pure web standards.
- **No Backend**: All state, unlocks, and leaderboard data are local to the client browser.
- **No Monetization / Accounts**: Zero ads, paywalls, or third-party logins.


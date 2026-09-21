# Tech Stack & Architectural Decisions

## 1. Core Architecture
- **Vanilla ES6 Modules (`type="module"`)**:
  - Eliminates build pipeline complexity while allowing clean separation of concerns.
  - Native browser support across all modern browsers (Chrome, Edge, Firefox, Safari).
- **HTML5 Canvas 2D**:
  - Efficient 60fps rendering via `requestAnimationFrame` and delta-time updates.
  - Logical grid coordinate system (e.g. 20x20, 30x30, 40x40 cells) mapped to a dynamic square canvas (600x600 logical resolution scaled with CSS).
- **CSS Custom Properties for Theming**:
  - Themes (`classic`, `dark`, `forest`, `space`, `retro`, `ocean`) defined as CSS variables on `[data-theme]`.
  - Instant theme switching without canvas reloads.

## 2. Audio Strategy
- **Primary**: Howler.js / Web Audio API.
- **Fallback**: Procedural Web Audio API sound generator (beeps, pops, fanfare) so the game is 100% playable even if external audio files fail to load.

## 3. Scraped Assets Integration
- The `snake/` directory contains high-quality Google Snake game assets:
  - `apple_types.png`: 152KB spritesheet with 20+ fruit varieties.
  - `trophy_types.png`: 45KB spritesheet with achievement/trophy icons.
  - `die.png`, `eat.png`, `effect.png`, `blink.png`, `tongue.png`: Visual effect sprites and animations.
  - UI icons: `volume_up_white_24dp.png`, `refresh_white_24dp.png`, `shuffle_white_24dp.png`, `keys.svg`.
- The game will copy and organize these into standard `assets/images/` and slice the spritesheets cleanly using Canvas `drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)`.


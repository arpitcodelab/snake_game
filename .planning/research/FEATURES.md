# Features & Game Capabilities Research

## 1. Core Mechanics
- **Continuous Snake Movement**: Moves step-by-step based on current speed timer (150ms base down to 60ms minimum).
- **Smooth Interpolation / Rendering**: Option for stepped grid movement or slight tweening.
- **Directional Controls**: Arrow keys, WASD, touch swipe, on-screen D-pad.
- **Input Buffer**: 2-action queue prevents 180-degree self-collisions when rapid keys are pressed.

## 2. Food & Fruit System
- **Fruit Varieties**:
  - Apple (1 pt)
  - Cherry / Strawberry / Banana (3 pts)
  - Golden Fruit (10 pts, 5s countdown timer before despawn)
- **Fruit Quantities**: Configurable 1, 3, or 5 fruits active simultaneously on board.
- **Visuals**: Sliced from `apple_types.png` spritesheet with subtle pulse/glow.

## 3. Game Modes (6 Core Modes)
1. **Classic**: Traditional walls kill, self-collision kills.
2. **No Walls**: Screen wrapping (exiting right emerges on left, etc.).
3. **Two-Headed**: Snake has a head at both ends, both must avoid obstacles.
4. **Moving Targets**: Fruits slowly drift / hop to adjacent tiles every few seconds.
5. **Broken Snake**: Snake body has periodic invisible gaps, creating optical illusions.
6. **Speed Demon**: 2x speed from start, 2x points awarded.

## 4. Customization & Unlocks
- **Snake Skins**: Default Green, Neon, Galaxy, Fire, Ice, Gold. Unlocked via total fruit or score thresholds.
- **Board Themes**: Classic Dark (#1a1a2e), Pure Dark (#0d0d0d), Forest (#1a2f1a), Space (#050510), Retro CRT, Ocean.
- **Local Leaderboard**: Top 10 scores per mode, arcade 3-letter initials, date.

# Snake Game — Requirements Specification

## 1. Requirement Categories & Scoped Items

### Core Engine & Loop (CORE)
- **CORE-01**: Game runs on an HTML5 2D Canvas with a fixed logical grid (Small 20x20, Medium 30x30, Large 40x40) at 60fps via `requestAnimationFrame`.
- **CORE-02**: Snake entity maintains a body queue of grid coordinates with head, body, and tail segments.
- **CORE-03**: Snake moves continuously in current direction and responds to input without 180-degree self-collision glitches (input queue buffering).
- **CORE-04**: Wall collision detection stops gameplay and triggers game over when snake hits arena boundary.
- **CORE-05**: Self collision detection triggers game over when snake head collides with any body segment.
- **CORE-06**: Snake speed gradually increases as snake grows (from 150ms down to 60ms step delay).

### Fruit System (FOOD)
- **FOOD-01**: Fruit spawns at random unoccupied grid positions on the board.
- **FOOD-02**: Multiple fruit types with distinct point values (Normal fruit = 1 pt, Special fruit = 3 pts).
- **FOOD-03**: Timed golden fruit spawns periodically (worth 10 pts, despawns after 5 seconds if not eaten).
- **FOOD-04**: Configurable active fruit count (1, 3, or 5 fruits on screen simultaneously).
- **FOOD-05**: Fruit rendering uses sliced sprites from `apple_types.png` spritesheet.

### Game Modes (MODE)
- **MODE-01**: Base `GameMode` strategy class enabling custom collision, spawning, and scoring behaviors.
- **MODE-02**: **Classic Mode** (Standard rules: walls kill, self collision kills).
- **MODE-03**: **No Walls Mode** (Snake wraps around edges of the board).
- **MODE-04**: **Two-Headed Mode** (Snake has an active head on both ends, both must avoid obstacles).
- **MODE-05**: **Moving Targets Mode** (Fruits periodically move to adjacent unoccupied cells).
- **MODE-06**: **Broken Snake Mode** (Snake body displays periodic gaps, creating optical challenge).
- **MODE-07**: **Speed Demon Mode** (Snake starts at 2x speed with 2x point rewards).

### Customization, Themes & Persistence (SKIN)
- **SKIN-01**: Board themes system using CSS custom properties (Classic Dark, Pure Dark, Forest, Space, Retro CRT, Ocean).
- **SKIN-02**: 6+ Snake skins (Default Green, Neon, Galaxy, Fire, Ice, Gold) rendered dynamically.
- **SKIN-03**: Milestone-based unlock system (skins unlock upon reaching score or fruit milestones).
- **SKIN-04**: Local storage persistence for high scores, unlock status, and player settings.

### User Interface & Screens (UI)
- **UI-01**: Screen manager controlling transitions between Start, Game, Pause, Game Over, and Leaderboard.
- **UI-02**: Start Screen with title, Play button, High Score display, and quick skin preview.
- **UI-03**: In-game HUD displaying current score, high score, fruit counter, pause, and mute buttons.
- **UI-04**: Game Over overlay showing final score, high score indicator, replay button, and menu button.
- **UI-05**: Settings Panel for configuring game mode, board size, fruit count, theme, skin, and sound.
- **UI-06**: Local Leaderboard displaying top 10 scores with 3-letter arcade initials and date.

### Controls & Responsiveness (CTRL)
- **CTRL-01**: Desktop keyboard controls supporting Arrow Keys and WASD, with Space/ESC/P to pause.
- **CTRL-02**: Mobile touch swipe gestures for directional steering without viewport scrolling.
- **CTRL-03**: On-screen Mobile D-pad rendered below canvas on touch/small screens.
- **CTRL-04**: Responsive canvas scaling preserving square aspect ratio and sharp rendering on High-DPI screens.

### Audio & Visual Polish (FX)
- **FX-01**: Audio Manager with sound effects for eat, death, and high score fanfare, plus background music toggle.
- **FX-02**: Procedural Web Audio API sound generator fallback if external audio files fail.
- **FX-03**: Particle burst effect when fruit is eaten.
- **FX-04**: Subtle screen shake and flash effect upon snake death.
- **FX-05**: Floating "+1" / "+3" / "+10" score text animation upon eating fruit.

---

## 2. Requirement Traceability Matrix

| Requirement | Category | Phase Assigned |
|-------------|----------|----------------|
| CORE-01     | Core     | Phase 1        |
| CORE-02     | Core     | Phase 1        |
| CORE-03     | Core     | Phase 1        |
| CORE-04     | Core     | Phase 1        |
| CORE-05     | Core     | Phase 1        |
| CORE-06     | Core     | Phase 2        |
| FOOD-01     | Fruit    | Phase 2        |
| FOOD-02     | Fruit    | Phase 2        |
| FOOD-03     | Fruit    | Phase 2        |
| FOOD-04     | Fruit    | Phase 2        |
| FOOD-05     | Fruit    | Phase 2        |
| MODE-01     | Mode     | Phase 3        |
| MODE-02     | Mode     | Phase 3        |
| MODE-03     | Mode     | Phase 3        |
| MODE-04     | Mode     | Phase 3        |
| MODE-05     | Mode     | Phase 3        |
| MODE-06     | Mode     | Phase 3        |
| MODE-07     | Mode     | Phase 3        |
| UI-01       | UI       | Phase 4        |
| UI-02       | UI       | Phase 4        |
| UI-03       | UI       | Phase 4        |
| UI-04       | UI       | Phase 4        |
| UI-05       | UI       | Phase 4        |
| UI-06       | UI       | Phase 5        |
| CTRL-01     | Controls | Phase 1        |
| CTRL-02     | Controls | Phase 4        |
| CTRL-03     | Controls | Phase 4        |
| CTRL-04     | Controls | Phase 4        |
| SKIN-01     | Skin     | Phase 5        |
| SKIN-02     | Skin     | Phase 5        |
| SKIN-03     | Skin     | Phase 5        |
| SKIN-04     | Skin     | Phase 5        |
| FX-01       | FX/Audio | Phase 6        |
| FX-02       | FX/Audio | Phase 6        |
| FX-03       | FX/Audio | Phase 6        |
| FX-04       | FX/Audio | Phase 6        |
| FX-05       | FX/Audio | Phase 6        |

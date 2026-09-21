# Snake Game — Project Roadmap

## Summary Checklist
- [ ] **Phase 1: Project Foundation & Core Canvas Loop**
- [ ] **Phase 2: Fruit System & Collision Mechanics**
- [ ] **Phase 3: Game Modes Engine**
- [ ] **Phase 4: UI Screens, HUD & Mobile Controls**
- [ ] **Phase 5: Skins, Themes & Local Storage**
- [ ] **Phase 6: Audio, Particles & Visual Polish**

---

## Progress Table
| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation & Core Canvas Loop | 0/1 | Not started | - |
| 2. Fruit System & Collision Mechanics | 0/1 | Not started | - |
| 3. Game Modes Engine | 0/1 | Not started | - |
| 4. UI Screens, HUD & Mobile Controls | 0/1 | Not started | - |
| 5. Skins, Themes & Local Storage | 0/1 | Not started | - |
| 6. Audio, Particles & Visual Polish | 0/1 | Not started | - |

---

## Phase Details

### Phase 1: Project Foundation & Core Canvas Loop
**Goal**: Establish modular project architecture, asset organization, HTML5 canvas rendering pipeline, and playable keyboard-controlled snake movement.
**Depends on**: Nothing (first phase)
**Requirements**: CORE-01, CORE-02, CORE-03, CORE-04, CORE-05, CTRL-01
**Success Criteria** (what must be TRUE):
  1. Project structure is established with modular ES6 files and scraped Google Snake assets organized in `assets/`.
  2. Canvas renders a crisp grid with responsive layout at 60fps.
  3. Player can control snake direction using Arrow keys and WASD without 180-degree self-turn bugs.
  4. Hitting a wall or colliding with the snake's own body ends the run and freezes the loop.
**Plans**: TBD

### Phase 2: Fruit System & Collision Mechanics
**Goal**: Implement fruit spawning, spritesheet slicing from Google Snake assets, collision mechanics, snake growth, and scoring.
**Depends on**: Phase 1
**Requirements**: CORE-06, FOOD-01, FOOD-02, FOOD-03, FOOD-04, FOOD-05
**Success Criteria** (what must be TRUE):
  1. Fruits spawn randomly on unoccupied grid cells using sprites sliced from `apple_types.png`.
  2. Eating fruit increases score (+1 for normal, +3 for special), lengthens the snake by 1 segment, and increases snake speed.
  3. Golden fruit spawns occasionally with an active countdown timer before despawning.
  4. Configurable fruit count (1, 3, or 5) maintains the exact number of active fruits on the board.
**Plans**: TBD

### Phase 3: Game Modes Engine
**Goal**: Implement the extensible `GameMode` strategy architecture and deliver all 6 game modes.
**Depends on**: Phase 2
**Requirements**: MODE-01, MODE-02, MODE-03, MODE-04, MODE-05, MODE-06, MODE-07
**Success Criteria** (what must be TRUE):
  1. `GameMode` base class allows overriding wall collision, food behavior, and speed modifiers.
  2. In **No Walls Mode**, snake smoothly wraps around the edges of the board instead of dying.
  3. In **Moving Targets Mode**, fruits periodically shift position across the board.
  4. In **Speed Demon Mode**, snake runs at 2x base speed and awards double points.
  5. In **Broken Snake Mode**, snake body segments render with periodic gaps.
  6. In **Two-Headed Mode**, snake features two active heads that both avoid collisions.
**Plans**: TBD

### Phase 4: UI Screens, HUD & Mobile Controls
**Goal**: Build the complete screen navigation flow, in-game HUD, settings modal, and mobile touch/D-pad controls.
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, CTRL-02, CTRL-03, CTRL-04
**Success Criteria** (what must be TRUE):
  1. Player can navigate seamlessly between Start Screen, Game HUD, Pause overlay, Settings modal, and Game Over screen.
  2. HUD displays live score, high score, fruit count, and interactive pause/mute buttons.
  3. Settings panel allows players to configure game mode, board size (20x20, 30x30, 40x40), and fruit count before playing.
  4. On mobile devices, swipe gestures and on-screen D-pad control snake movement without page scrolling or gestures.
  5. Canvas automatically scales to fit viewport maintaining square aspect ratio and sharp High-DPI resolution.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Skins, Themes & Local Storage
**Goal**: Implement dynamic board themes, unlockable snake skins, arcade leaderboard, and robust local persistence.
**Depends on**: Phase 4
**Requirements**: SKIN-01, SKIN-02, SKIN-03, SKIN-04, UI-06
**Success Criteria** (what must be TRUE):
  1. Player can switch between 6 board themes (Classic, Dark, Forest, Space, Retro CRT, Ocean) with instant CSS variable updates.
  2. Player can equip different snake skins (Neon, Galaxy, Fire, Ice, Gold) which render distinct head, body, and tail graphics.
  3. Skins unlock automatically as the player achieves cumulative score and fruit milestones.
  4. Top 10 high scores per mode are saved with 3-letter initials and viewable in the Leaderboard screen.
  5. All unlocks, high scores, and settings persist across browser restarts in `localStorage`.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Audio, Particles & Visual Polish
**Goal**: Elevate game feel with sound effects, procedural Web Audio fallback, particle bursts, screen shake, and score animations.
**Depends on**: Phase 5
**Requirements**: FX-01, FX-02, FX-03, FX-04, FX-05
**Success Criteria** (what must be TRUE):
  1. Eating fruit triggers an eat sound effect and a colorful particle burst at the fruit position.
  2. Dying triggers a subtle screen shake, death flash, and game over sound.
  3. Achieving a new high score plays a celebratory fanfare sound.
  4. Floating "+1", "+3", or "+10" score text rises and fades out when food is eaten.
  5. Audio works reliably across browsers, gracefully falling back to procedural Web Audio synthesis if audio files are unavailable.
**Plans**: TBD

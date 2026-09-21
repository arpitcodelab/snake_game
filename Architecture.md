# 🐍 Snake Game — Architecture Document

> **Version:** 1.0  
> **Stack:** Vanilla JavaScript + HTML5 Canvas  (100% Free & Open Source)  
> **No frameworks needed — just ship it!**

---

## 1. 🧠 Tech Stack Decision

We're keeping this **pure and simple** — no React, no Vue, no build tools needed. This is the perfect vibe-coder stack: open a browser, see your game run.

| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | Vanilla JavaScript (ES6+) | No installs, runs everywhere, fast |
| **Rendering** | HTML5 Canvas API | Perfect for 2D games, 60fps, pixel-perfect |
| **Styling** | CSS3 + CSS Variables | Theming, responsive, zero dependencies |
| **Audio** | Web Audio API + Howler.js (free CDN) | Cross-browser audio, simple API |
| **Storage** | localStorage | No backend needed — saves scores & settings |
| **Build Tool** | None (or Vite if preferred) | Just open index.html and play |
| **Assets** | OpenGameArt.org / Kenney.nl / freesound.org | 100% free, open-source assets |

---

## 2. 📁 Project Folder Structure

```
snake-game/
│
├── index.html                 ← Entry point
├── README.md
│
├── assets/
│   ├── audio/
│   │   ├── eat.mp3            ← Fruit eat sound
│   │   ├── die.mp3            ← Death sound
│   │   ├── highscore.mp3      ← New high score fanfare
│   │   └── music.mp3          ← Background chiptune (optional)
│   │
│   ├── images/
│   │   ├── fruits/
│   │   │   ├── apple.png
│   │   │   ├── cherry.png
│   │   │   ├── strawberry.png
│   │   │   └── golden.png     ← Special timed fruit
│   │   └── ui/
│   │       ├── logo.png
│   │       └── favicon.ico
│   │
│   └── fonts/
│       └── (any Google Fonts downloaded locally, optional)
│
├── css/
│   ├── main.css               ← Global styles, layout, typography
│   ├── themes.css             ← Board/UI themes (CSS variables per theme)
│   ├── hud.css                ← HUD overlay styles
│   ├── screens.css            ← Start, GameOver, Leaderboard screens
│   ├── settings.css           ← Settings panel styles
│   └── mobile.css             ← Mobile responsive + D-pad styles
│
├── js/
│   ├── main.js                ← Entry point — boots the game
│   │
│   ├── core/
│   │   ├── Game.js            ← Main game controller (state machine)
│   │   ├── GameLoop.js        ← requestAnimationFrame loop, delta time
│   │   ├── InputManager.js    ← Keyboard, swipe, D-pad input handling
│   │   └── EventBus.js        ← Simple pub/sub event system
│   │
│   ├── entities/
│   │   ├── Snake.js           ← Snake logic (head, body, movement, collision)
│   │   ├── Food.js            ← Food/fruit spawning, types, timers
│   │   └── Particle.js        ← Particle effects (eat burst, death flash)
│   │
│   ├── systems/
│   │   ├── CollisionSystem.js ← Wall, self, food collision detection
│   │   ├── ScoreSystem.js     ← Points, multipliers, high score tracking
│   │   ├── SkinSystem.js      ← Load & apply snake skins + unlock logic
│   │   └── ThemeSystem.js     ← Apply board theme CSS variables
│   │
│   ├── modes/
│   │   ├── ClassicMode.js     ← Standard walls kill you
│   │   ├── NoWallsMode.js     ← Wrap-around walls
│   │   ├── TwoHeadedMode.js   ← Snake has 2 active heads
│   │   ├── MovingTargetsMode.js ← Fruits drift around
│   │   ├── BrokenSnakeMode.js ← Body has gaps
│   │   └── SpeedDemonMode.js  ← 2× speed from start
│   │
│   ├── renderer/
│   │   ├── Renderer.js        ← Master renderer — calls all draw methods
│   │   ├── SnakeRenderer.js   ← Draws snake body with skin applied
│   │   ├── FoodRenderer.js    ← Draws fruits with glow effects
│   │   ├── GridRenderer.js    ← Draws board grid (subtle lines)
│   │   └── UIRenderer.js      ← Draws score, HUD elements on canvas
│   │
│   ├── ui/
│   │   ├── ScreenManager.js   ← Show/hide screens (start, game, gameover)
│   │   ├── StartScreen.js     ← Start screen logic
│   │   ├── GameOverScreen.js  ← Game over + replay logic
│   │   ├── SettingsPanel.js   ← Settings panel open/close + save
│   │   ├── LeaderboardScreen.js ← Local top 10 display
│   │   └── SkinGallery.js     ← Skin unlock + equip UI
│   │
│   ├── audio/
│   │   └── AudioManager.js    ← Play/stop sounds, music toggle
│   │
│   └── utils/
│       ├── Storage.js         ← localStorage wrapper (get/set/clear)
│       ├── Vector2.js         ← {x, y} helper (grid position math)
│       └── Constants.js       ← Game-wide constants (grid size, speed, etc.)
│
└── lib/
    └── howler.min.js          ← Howler.js (audio, download once from CDN)
```

---

## 3. 🔄 Game State Machine

The game lives in one of these **states** at any time. `Game.js` manages transitions.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   LOADING ──► START ──► PLAYING ──► PAUSED      │
│                 ▲           │         │          │
│                 │           ▼         │          │
│                 └──── GAME_OVER ◄─────┘          │
│                             │                   │
│                             ▼                   │
│                      LEADERBOARD                │
│                                                 │
└─────────────────────────────────────────────────┘
```

| State | What's Active |
|-------|--------------|
| `LOADING` | Asset preload, init systems |
| `START` | Start screen visible, no game loop |
| `PLAYING` | Game loop running, input active |
| `PAUSED` | Game loop frozen, pause overlay visible |
| `GAME_OVER` | Score shown, game loop stopped |
| `LEADERBOARD` | High score table visible |

---

## 4. 🏗️ Core Architecture: How It All Connects

```
main.js
  └── new Game()
        ├── GameLoop.start()           ← runs every frame (60fps)
        │     └── game.update(delta)
        │           ├── InputManager.flush()     ← read pending input
        │           ├── snake.update()           ← move snake
        │           ├── CollisionSystem.check()  ← detect collisions
        │           ├── ScoreSystem.update()     ← update score
        │           └── particles.update()       ← animate particles
        │
        └── GameLoop.render()
              └── Renderer.draw()
                    ├── GridRenderer.draw()
                    ├── FoodRenderer.draw()
                    ├── SnakeRenderer.draw()
                    ├── ParticleRenderer.draw()
                    └── UIRenderer.draw()        ← HUD on top
```

---

## 5. 🐍 Snake Entity — How the Snake Works

The snake is a **queue of grid cells** (not pixel positions).

```javascript
// Snake internal data structure
snake = {
  body: [
    { x: 15, y: 10 },   // ← HEAD (index 0)
    { x: 14, y: 10 },
    { x: 13, y: 10 },   // ← TAIL (last index)
  ],
  direction: { x: 1, y: 0 },   // moving right
  nextDirection: { x: 1, y: 0 }, // queued input
  length: 3,
  speed: 150,   // ms per step
  growing: false
}
```

### Movement Logic (every `speed` ms):
```
1. nextDirection → direction (apply buffered input)
2. Compute new head = head + direction
3. Check collisions BEFORE moving
4. If food eaten: push new head, DON'T pop tail → snake grows
5. If no food: push new head, pop tail → snake slides
6. Update body array
```

### Input Buffering:
- Only one direction change per step (prevents reversing into yourself when spamming keys)
- Queue max 2 inputs ahead (feels more responsive)

---

## 6. 🎯 Collision System

```javascript
// CollisionSystem.js — check order matters!
function checkCollisions(snake, board, foods) {
  const head = snake.body[0];

  // 1. Wall collision
  if (head.x < 0 || head.x >= board.cols ||
      head.y < 0 || head.y >= board.rows) {
    return { type: 'WALL' };   // → triggers game over
  }

  // 2. Self collision (skip first 3 segments — impossible to hit those)
  for (let i = 3; i < snake.body.length; i++) {
    if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
      return { type: 'SELF' };  // → triggers game over
    }
  }

  // 3. Food collision
  for (const food of foods) {
    if (head.x === food.x && head.y === food.y) {
      return { type: 'FOOD', food };  // → eat food, grow, score
    }
  }

  return { type: 'NONE' };
}
```

**Mode Overrides:**
- `NoWallsMode` — wall collision wraps position instead of triggering game over
- `TwoHeadedMode` — collision checked for both head positions

---

## 7. 🎨 Rendering Pipeline

All rendering uses **HTML5 Canvas 2D Context**. The canvas is divided into a grid:

```
Canvas Size:  600×600px (scales via CSS to fit screen)
Grid:         30×30 cells (MEDIUM mode)
Cell Size:    600 / 30 = 20px per cell
```

### Draw Order (painter's algorithm — back to front):
```
1. Clear canvas
2. Draw board background (theme color)
3. Draw grid lines (subtle, 10% opacity)
4. Draw food items (sprite + glow effect)
5. Draw snake body (skin applied)
6. Draw snake head (slightly larger, skin head sprite)
7. Draw particles (on top of everything)
8. Draw HUD elements (score, etc.) — drawn last
```

### Snake Skin Rendering:
```javascript
// SnakeRenderer.js
function drawSnake(ctx, snake, skin) {
  snake.body.forEach((segment, i) => {
    if (i === 0) {
      drawHead(ctx, segment, snake.direction, skin.head);
    } else if (i === snake.body.length - 1) {
      drawTail(ctx, segment, skin.tail);
    } else {
      drawBodySegment(ctx, segment, skin.body, skin.color);
    }
  });
}
```

---

## 8. 🕹️ Game Modes Architecture

All modes **extend a base `GameMode` class**. This is the cleanest pattern for adding new modes without touching core code.

```javascript
// modes/GameMode.js  ← Base class
class GameMode {
  onWallCollision(snake, board) { /* default: game over */ }
  onFoodEaten(snake, food, score) { /* default: +1 point, grow */ }
  onUpdate(delta) { /* default: nothing extra */ }
  getSpeedModifier() { return 1.0; }
}

// modes/NoWallsMode.js  ← Override only what changes
class NoWallsMode extends GameMode {
  onWallCollision(snake, board) {
    // Wrap around instead of dying
    const head = snake.body[0];
    if (head.x < 0) head.x = board.cols - 1;
    if (head.x >= board.cols) head.x = 0;
    if (head.y < 0) head.y = board.rows - 1;
    if (head.y >= board.rows) head.y = 0;
  }
}

// modes/SpeedDemonMode.js
class SpeedDemonMode extends GameMode {
  getSpeedModifier() { return 2.0; }
  onFoodEaten(snake, food, score) {
    score.add(food.points * 2);  // double points
    snake.grow();
  }
}
```

---

## 9. 💾 Storage (localStorage) Schema

```javascript
// Storage keys used across the game
const STORAGE_KEYS = {
  HIGH_SCORE:       'snake_highscore',
  LEADERBOARD:      'snake_leaderboard',     // JSON array, top 10
  UNLOCKED_SKINS:   'snake_unlocked_skins',  // JSON array of skin IDs
  SELECTED_SKIN:    'snake_selected_skin',
  SELECTED_THEME:   'snake_selected_theme',
  SETTINGS:         'snake_settings',        // JSON object
  TOTAL_FRUITS_EATEN: 'snake_total_fruits',  // for unlock milestones
};

// Example settings object stored
{
  gameMode: 'classic',
  boardSize: 'medium',
  fruitsOnScreen: 1,
  soundEnabled: true,
  musicEnabled: false,
}

// Example leaderboard entry
{
  initials: 'AAA',
  score: 142,
  mode: 'classic',
  date: '2024-11-15'
}
```

---

## 10. 📱 Input Manager — Desktop + Mobile

```javascript
// InputManager.js
class InputManager {
  constructor() {
    this.pendingDirection = null;
    this.setupKeyboard();
    this.setupSwipe();
    this.setupDPad();
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      const map = {
        'ArrowUp': {x:0,y:-1}, 'KeyW': {x:0,y:-1},
        'ArrowDown': {x:0,y:1}, 'KeyS': {x:0,y:1},
        'ArrowLeft': {x:-1,y:0}, 'KeyA': {x:-1,y:0},
        'ArrowRight': {x:1,y:0}, 'KeyD': {x:1,y:0},
      };
      if (map[e.code]) this.pendingDirection = map[e.code];
      if (e.code === 'Escape' || e.code === 'KeyP') game.togglePause();
    });
  }

  setupSwipe() {
    // Touch swipe detection on canvas
    let startX, startY;
    canvas.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.pendingDirection = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
      } else {
        this.pendingDirection = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
      }
    });
  }

  setupDPad() {
    // HTML D-pad buttons (mobile only, shown via CSS media query)
    document.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        const dirMap = { up:{x:0,y:-1}, down:{x:0,y:1},
                         left:{x:-1,y:0}, right:{x:1,y:0} };
        this.pendingDirection = dirMap[btn.dataset.dir];
      });
    });
  }

  flush() {
    const dir = this.pendingDirection;
    this.pendingDirection = null;
    return dir;
  }
}
```

---

## 11. 🔊 Audio Manager

Using **Howler.js** (free, open-source, CDN available) for cross-browser audio.

```javascript
// AudioManager.js
import { Howl } from 'howler';  // or load from CDN

class AudioManager {
  constructor() {
    this.sounds = {
      eat:       new Howl({ src: ['assets/audio/eat.mp3'], volume: 0.6 }),
      die:       new Howl({ src: ['assets/audio/die.mp3'], volume: 0.8 }),
      highScore: new Howl({ src: ['assets/audio/highscore.mp3'], volume: 1.0 }),
      music:     new Howl({ src: ['assets/audio/music.mp3'], loop: true, volume: 0.3 }),
    };
    this.soundEnabled = true;
    this.musicEnabled = false;
  }

  play(name) {
    if (this.soundEnabled && this.sounds[name]) {
      this.sounds[name].play();
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.musicEnabled ? this.sounds.music.play() : this.sounds.music.stop();
  }
}
```

---

## 12. 🎨 Theme System (CSS Variables)

Themes are just **CSS variable overrides**. Easy to add new ones!

```css
/* themes.css */

/* Default: Classic */
:root {
  --board-bg:     #1a1a2e;
  --grid-line:    rgba(255,255,255,0.05);
  --snake-color:  #4ecca3;
  --food-glow:    #ff6b6b;
  --ui-bg:        #16213e;
  --text-primary: #eee;
  --accent:       #e94560;
}

[data-theme="dark"] {
  --board-bg:    #0d0d0d;
  --grid-line:   rgba(255,255,255,0.03);
  --snake-color: #00ff88;
  --food-glow:   #ff4444;
  --ui-bg:       #111111;
}

[data-theme="forest"] {
  --board-bg:    #1a2f1a;
  --grid-line:   rgba(100,200,100,0.08);
  --snake-color: #7bc67e;
  --food-glow:   #ff8c42;
  --ui-bg:       #152615;
}

[data-theme="space"] {
  --board-bg:    #050510;
  --grid-line:   rgba(100,100,255,0.06);
  --snake-color: #9d4edd;
  --food-glow:   #f77f00;
  --ui-bg:       #040410;
}
```

```javascript
// ThemeSystem.js — applying a theme
function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  Storage.set('snake_selected_theme', themeName);
}
```

---

## 13. 🧩 EventBus — Communication Between Modules

Modules stay decoupled using a simple pub/sub system:

```javascript
// EventBus.js
class EventBus {
  constructor() { this.listeners = {}; }

  on(event, callback) {
    (this.listeners[event] ??= []).push(callback);
  }

  emit(event, data) {
    (this.listeners[event] ?? []).forEach(cb => cb(data));
  }
}

export const bus = new EventBus();

// Usage examples:
// CollisionSystem emits:
bus.emit('food:eaten', { food, points: 3 });
bus.emit('game:over', { score: 42 });

// AudioManager listens:
bus.on('food:eaten', () => audio.play('eat'));
bus.on('game:over', () => audio.play('die'));

// ScoreSystem listens:
bus.on('food:eaten', ({ points }) => score.add(points));

// UIRenderer listens:
bus.on('food:eaten', ({ food }) => particles.burst(food.x, food.y));
```

---

## 14. 📐 Constants Reference

```javascript
// utils/Constants.js  — single source of truth
export const GRID = {
  SMALL:  { cols: 20, rows: 20 },
  MEDIUM: { cols: 30, rows: 30 },
  LARGE:  { cols: 40, rows: 40 },
};

export const SPEED = {
  BASE_MS:    150,   // ms per snake step at start
  MIN_MS:     60,    // fastest possible (at max length)
  STEP_DOWN:  2,     // ms reduction per fruit eaten
};

export const SCORE = {
  NORMAL_FRUIT:  1,
  SPECIAL_FRUIT: 3,
  GOLDEN_FRUIT:  10,
  GOLDEN_TIMER:  5000,  // ms before golden fruit disappears
};

export const CANVAS = {
  SIZE: 600,   // px — scaled by CSS
};

export const UNLOCK_MILESTONES = {
  'neon':    50,
  'galaxy':  100,
  'fire':    200,
  'ice':     350,
  'gold':    500,
};
```

---

## 15. 🖼️ index.html Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="classic">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐍 Snake Game</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/themes.css">
  <link rel="stylesheet" href="css/screens.css">
  <link rel="stylesheet" href="css/hud.css">
  <link rel="stylesheet" href="css/mobile.css">
</head>
<body>

  <!-- Screen: Start -->
  <div id="screen-start" class="screen active">
    <div class="logo">🐍 SNAKE</div>
    <div class="high-score">Best: <span id="display-high-score">0</span></div>
    <button id="btn-play" class="btn-primary">PLAY</button>
    <button id="btn-settings" class="btn-icon">⚙️</button>
    <button id="btn-leaderboard" class="btn-icon">🏆</button>
  </div>

  <!-- Screen: Game -->
  <div id="screen-game" class="screen hidden">
    <div class="hud">
      <span id="hud-score">0</span>
      <button id="btn-pause">⏸</button>
      <span id="hud-highscore">0</span>
    </div>
    <canvas id="game-canvas" width="600" height="600"></canvas>
    <!-- Mobile D-Pad -->
    <div class="dpad" id="dpad">
      <button data-dir="up">▲</button>
      <div class="dpad-row">
        <button data-dir="left">◀</button>
        <button data-dir="right">▶</button>
      </div>
      <button data-dir="down">▼</button>
    </div>
  </div>

  <!-- Screen: Game Over -->
  <div id="screen-gameover" class="screen hidden">
    <h1>GAME OVER</h1>
    <div class="score-display">
      <div>Score <span id="go-score">0</span></div>
      <div>Best  <span id="go-best">0</span></div>
    </div>
    <button id="btn-replay" class="btn-primary">PLAY AGAIN</button>
    <button id="btn-menu" class="btn-secondary">MENU</button>
  </div>

  <!-- Panel: Settings -->
  <div id="panel-settings" class="panel hidden">
    <!-- settings controls injected by SettingsPanel.js -->
  </div>

  <!-- Screen: Leaderboard -->
  <div id="screen-leaderboard" class="screen hidden">
    <h2>🏆 TOP SCORES</h2>
    <ol id="leaderboard-list"></ol>
    <button id="btn-leaderboard-back">← BACK</button>
  </div>

  <!-- Scripts -->
  <script src="lib/howler.min.js"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

---

## 16. 🛠️ Development Setup (Zero Build Tools)

```bash
# Option A — Simplest (just open in browser)
# Double-click index.html  ← works for most things

# Option B — Local dev server (recommended, fixes module imports)
# Install Node.js once, then:
npx serve .
# → Opens at http://localhost:3000

# Option C — VS Code Live Server
# Install "Live Server" extension → right-click index.html → Open with Live Server

# Option D — Vite (best hot-reload DX, still free)
npm create vite@latest snake-game -- --template vanilla
# Copy files in, run: npm run dev
```

---

## 17. 🆓 Free Asset Sources

| Asset Type | Source | License |
|------------|--------|---------|
| Sound effects | [freesound.org](https://freesound.org) | CC0 / CC-BY |
| Pixel art sprites | [kenney.nl](https://kenney.nl/assets) | CC0 (fully free) |
| Game art packs | [opengameart.org](https://opengameart.org) | Various CC |
| Chiptune music | [incompetech.com](https://incompetech.com) | CC-BY |
| Fonts | [fonts.google.com](https://fonts.google.com) | OFL (free) |
| Howler.js audio | [howlerjs.com](https://howlerjs.com) | MIT |

---

## 18. 🏁 Build Order for Vibe Coding

Follow this order — each step is a playable milestone:

```
Step 1 → index.html + canvas + game loop (see snake move)
Step 2 → Snake entity + keyboard input (control the snake)
Step 3 → Food spawning + collision + eating (core gameplay!)
Step 4 → Score + game over screen (it's a real game now)
Step 5 → Mobile controls (swipe + D-pad)
Step 6 → Settings panel + board size + speed
Step 7 → Game modes (NoWalls first — easy win)
Step 8 → Skins + themes (make it look sick)
Step 9 → Sound effects + particles
Step 10 → Leaderboard + unlock system
Step 11 → Polish, animations, mobile tweaks
Step 12 → 🚀 SHIP IT
```

---

*Architecture designed for vibe coding — modular, readable, zero magic. Give this to your IDE and start at Step 1! 🐍*

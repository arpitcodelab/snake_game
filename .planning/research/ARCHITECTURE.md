# System Architecture & Component Design

## 1. Class Hierarchy & Modules
```
main.js (Entry point)
  └── Game (State Machine & Coordinator)
        ├── GameLoop (requestAnimationFrame, delta time)
        ├── EventBus (pub/sub decoupled communication)
        ├── InputManager (keyboard, touch swipe, mobile D-pad)
        ├── Snake (head/body grid coordinates, movement, growth)
        ├── Food (food spawning, types, timers, positions)
        ├── CollisionSystem (wall, self, food collision checks)
        ├── ScoreSystem (score, high score, milestones)
        ├── GameMode (Strategy pattern: Classic, NoWalls, TwoHeaded, etc.)
        ├── Renderer (Master canvas rendering coordinator)
        │     ├── GridRenderer
        │     ├── SnakeRenderer
        │     ├── FoodRenderer
        │     ├── ParticleRenderer
        │     └── UIRenderer
        ├── ScreenManager (StartScreen, GameOverScreen, SettingsPanel, LeaderboardScreen)
        ├── AudioManager (Howler.js / Web Audio API)
        └── Storage (localStorage wrapper with schema versioning)
```

## 2. State Machine Flow
- `LOADING`: Asset preloading (spritesheets, audio).
- `START`: Main menu, skin preview, high score, play button.
- `PLAYING`: Active game loop, input active, HUD visible.
- `PAUSED`: Game loop frozen, overlay visible (resume, restart, exit).
- `GAME_OVER`: Death sequence, final score, new high score check, replay button.
- `LEADERBOARD`: High score table, initials input on qualifying score.

## 3. Communication Patterns
- `EventBus` provides loose coupling:
  - `bus.emit('food:eaten', { food, points })`
  - `bus.emit('game:over', { score, mode })`
  - `bus.emit('score:updated', { score, highScore })`
  - `bus.emit('theme:changed', { theme })`
- Systems listen and react independently without circular dependencies.

# 🐍 Snake Game — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Status:** Ready for Development  
> **Target:** Web Browser (Desktop + Mobile)  
> **Stack:** 100% Free & Open Source

---

## 1. 🎯 Product Vision

Build a **high-quality, modern Snake game** playable directly in the browser — capturing the nostalgia of the classic 1997 Nokia snake, but upgraded with polished visuals, multiple game modes, unlockable skins, smooth animations, and a responsive UI that feels great on both desktop and mobile.

---

## 2. 👤 Target Users

| User Type | Description |
|-----------|-------------|
| **Casual Gamer** | Wants a quick, fun time-killer — no learning curve |
| **Nostalgic Player** | Grew up with Nokia/Google snake, wants that vibe back |
| **Score Chaser** | Wants leaderboards, high scores, challenges |
| **Mobile User** | Plays on phone with touch controls |
| **Family Player** | Ages 7+ — zero violence, wholesome fun |

---

## 3. 🕹️ Core Game Features

### 3.1 Basic Gameplay (MVP)
- Snake moves continuously in the current direction
- Player controls direction with **arrow keys** (desktop) or **swipe / D-pad** (mobile)
- Snake grows longer when it eats food (fruit)
- Game ends when snake hits a **wall** or its **own tail**
- Score increases by +1 (or configurable points) per fruit eaten
- Speed gradually increases as snake grows longer

### 3.2 Food / Fruits System
- Multiple fruit types displayed on screen (apple, cherry, strawberry, etc.)
- Each fruit type has a different **point value** (1–5 pts)
- Special golden fruit spawns occasionally — worth 10 pts, disappears after 5 seconds
- Configurable: how many fruits appear on screen at once (1, 3, or 5)

### 3.3 Game Modes (16 Modes — Phased)

**Phase 1 (MVP Launch):**
| Mode | Description |
|------|-------------|
| **Classic** | Standard snake — walls kill you |
| **No Walls** | Snake passes through walls and comes out the other side |
| **Two-Headed** | Snake has a head on both ends — both must avoid obstacles |
| **Moving Targets** | Fruits move around the board randomly |
| **Broken Snake** | Snake body has gaps — creates optical illusions |
| **Speed Demon** | Snake starts at 2× speed — high risk, high reward |

**Phase 2 (Post-Launch):**
| Mode | Description |
|------|-------------|
| **Maze Mode** | Static obstacles block the arena |
| **Time Attack** | Eat as many fruits as possible in 60 seconds |
| **Multiplayer Local** | 2 snakes on same keyboard, same screen |
| More modes... | To be designed based on player feedback |

### 3.4 Skins & Themes
- **Snake Skins:** 10+ unlockable snake body styles (neon, pixel, pastel, galaxy, fire, ice, etc.)
- **Board Themes:** 6 background themes (Classic Green, Dark Mode, Retro CRT, Forest, Ocean, Space)
- **Unlock system:** Skins unlock at score milestones (e.g., score 50 → unlock "Neon" skin)
- All unlocks saved in **localStorage** (no login required)

---

## 4. 🖥️ UI Screens & Flow

```
[Start Screen]
      ↓  Click "Play"
[Settings Panel] — optional pre-game config
      ↓  Click "Start"
[Game Screen] — active gameplay
      ↓  Snake dies
[Game Over Screen] — score + high score + replay
      ↓  Replay / Menu
[Leaderboard Screen] — local high scores (top 10)
[Skins / Themes Gallery] — unlock & equip
```

### 4.1 Start Screen
- Game logo / title animation
- "Play" button (big, centered)
- Settings icon (top-right)
- High Score display
- Skin preview of currently selected snake

### 4.2 Settings Panel (Pre-game config)
- **Fruits count:** 1 / 3 / 5 on screen
- **Game Mode:** dropdown with all available modes
- **Board Width:** Small / Medium / Large
- **Snake Skin:** visual picker (locked ones shown greyed out)
- **Board Theme:** visual picker
- **Sound:** toggle on/off

### 4.3 Game Screen (HUD)
- Current **Score** — top-left
- **High Score** — top-right  
- **Fruit counter** (how many eaten)
- **Pause button** — top-center or ESC key
- **Mute button**
- Game canvas — centered, responsive

### 4.4 Game Over Screen
- Large "Game Over" or "You Died!" text
- Your score: **XX**
- High score: **XX**
- New high score celebration (animation + sound) if broken
- Buttons: **[Play Again]** | **[Menu]** | **[Share Score]**

### 4.5 Leaderboard (Local)
- Top 10 high scores stored in localStorage
- Name entry: player can enter initials (3 letters, like old arcades)
- Date of score shown

---

## 5. 🎮 Controls

### Desktop
| Action | Key |
|--------|-----|
| Move Up | `↑` or `W` |
| Move Down | `↓` or `S` |
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Pause | `ESC` or `P` |
| Restart | `R` (on game over screen) |

### Mobile
| Action | Control |
|--------|---------|
| Move | Swipe in direction |
| On-screen D-Pad | 4 arrow buttons rendered below canvas |
| Pause | Tap pause button in HUD |

---

## 6. 🔊 Audio & Visual Feedback

### Sound Effects (free assets from freesound.org / OpenGameArt)
- Fruit eat sound — satisfying "pop" or "crunch"
- Death sound — retro "game over" beep
- High score fanfare — short celebratory jingle
- Background music — optional looping chiptune (toggleable)

### Visual Effects
- Smooth snake movement (no grid-snap jitter) — tweened animation
- Fruit sparkle / glow effect
- Snake death animation — flash red + shrink
- Score pop-up: "+1" floats up when fruit eaten
- Screen shake on death (subtle)
- Particle burst when fruit is eaten

---

## 7. 📱 Responsiveness

| Device | Behavior |
|--------|----------|
| Desktop (1920×1080) | Large canvas, full UI |
| Laptop (1280×720) | Slightly smaller canvas, full UI |
| Tablet (768px) | Canvas scales, touch controls appear |
| Mobile (375px) | Full-width canvas, on-screen D-pad, compact HUD |

- Canvas always maintains **square aspect ratio**
- On mobile, D-pad controls render below the game canvas
- Font sizes scale with viewport

---

## 8. 🏆 Scoring System

| Event | Points |
|-------|--------|
| Eat normal fruit | +1 |
| Eat special fruit (cherry, star) | +3 |
| Eat golden fruit (timed) | +10 |
| Multiplier (longer snake) | +bonus at length 20, 40, 60 |
| Speed mode bonus | 2× all points |

- High score persisted in **localStorage**
- Leaderboard: top 10 scores with player initials

---

## 9. ⚙️ Settings & Configuration

All settings saved in **localStorage** so they persist between sessions.

| Setting | Options | Default |
|---------|---------|---------|
| Game Mode | Classic, No Walls, Two-Headed, Moving Targets, Broken, Speed Demon | Classic |
| Fruits on Screen | 1, 3, 5 | 1 |
| Board Size | Small (20×20), Medium (30×30), Large (40×40) | Medium |
| Snake Speed | Slow, Normal, Fast (auto-set by Mode) | Normal |
| Snake Skin | Unlocked skins list | Default Green |
| Board Theme | 6 themes | Classic |
| Sound | On / Off | On |
| Music | On / Off | Off |

---

## 10. 🚀 Phases & Milestones

### Phase 1 — MVP (Build This First)
- [ ] Classic game loop working
- [ ] 3 game modes (Classic, No Walls, Moving Targets)
- [ ] Basic fruit system (3 fruit types)
- [ ] Score + high score system
- [ ] Game Over screen with restart
- [ ] Desktop keyboard controls
- [ ] Mobile swipe + on-screen D-pad
- [ ] 3 snake skins
- [ ] 2 board themes (Classic + Dark)
- [ ] Sound effects (eat, die)
- [ ] Settings panel (game mode, board size, skin)
- [ ] Responsive layout

### Phase 2 — Polish
- [ ] All 6 game modes
- [ ] Full skin gallery (10 skins) with unlock system
- [ ] All 6 board themes
- [ ] Local leaderboard (top 10 + initials)
- [ ] Background music toggle
- [ ] Particle effects
- [ ] Screen shake
- [ ] Score pop-ups
- [ ] New high score animation
- [ ] Share score button (copy to clipboard)

### Phase 3 — Extras (Optional)
- [ ] Additional game modes (Maze, Time Attack, Local 2-player)
- [ ] PWA support (installable on phone)
- [ ] Keyboard shortcut cheatsheet overlay

---

## 11. ✅ Success Metrics

| Metric | Goal |
|--------|------|
| Game loads in < 2 seconds | ✅ |
| No frame drops below 60fps | ✅ |
| Works on Chrome, Firefox, Safari, Edge | ✅ |
| Fully playable on mobile (iOS + Android) | ✅ |
| Zero third-party logins or payments required | ✅ |
| localStorage saves persist across sessions | ✅ |

---

## 12. 🚫 Out of Scope (Not Building)

- Online multiplayer (too complex for v1)
- User accounts / cloud saves
- Ads or monetization
- Native mobile app (iOS/Android)
- Social login

---

*Document created for vibe coding — feed this into your IDE and let's go! 🐍*

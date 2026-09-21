import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { Snake } from '../entities/Snake.js';
import { Food } from '../entities/Food.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { Renderer } from '../renderer/Renderer.js';
import { modeManager } from '../modes/ModeManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { bus } from './EventBus.js';
import { GRID, SPEED, GAME_STATE, DIR } from '../utils/Constants.js';

/**
 * Main Game Coordinator orchestrating state, loop, entities, and rendering
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = GAME_STATE.START;
    this.grid = { ...GRID.MEDIUM }; // 17x15 Google Snake default
    this.speed = SPEED.BASE_MS;

    // Active mode
    this.mode = modeManager.get('classic');

    // Systems
    this.renderer = new Renderer(canvas);
    this.inputManager = new InputManager();
    this.collisionSystem = new CollisionSystem();
    this.scoreSystem = new ScoreSystem();
    this.food = new Food();
    this.audioManager = new AudioManager();
    this.particleSystem = new ParticleSystem();

    this.prevHighScore = 0;
    this.celebratedHighScore = false;

    this.snake = new Snake(
      { x: Math.floor(this.grid.cols / 2), y: Math.floor(this.grid.rows / 2) },
      3,
      DIR.RIGHT
    );

    // Game loop
    this.loop = new GameLoop(
      (tickDelta) => this.update(tickDelta),
      (interp) => this.render(interp)
    );
    this.loop.setSpeed(this.speed);

    // Initial entities setup
    this.food.reset(this.snake.body, this.grid);

    // Bind event bus listeners
    this.setupEvents();
    this.updateHUD();
    this.render(0);
    this.loop.start();
  }

  setupEvents() {
    bus.on('game:start', () => {
      if (this.state === GAME_STATE.START) {
        this.start();
      }
    });

    bus.on('input:direction', (dir) => {
      if (this.state === GAME_STATE.START) {
        bus.emit('screen:change', { screen: 'game' });
        this.start();
        this.snake.setDirection(dir);
      }
    });

    bus.on('input:pause', () => this.togglePause());
    bus.on('input:restart', () => this.restart());
    bus.on('game:over', () => this.handleGameOver());

    bus.on('food:eaten', ({ food, points, score }) => {
      const gridW = this.renderer.logicalWidth - this.renderer.borderX * 2;
      const gridH = this.renderer.logicalHeight - this.renderer.borderY * 2;
      const cellW = gridW / this.grid.cols;
      const cellH = gridH / this.grid.rows;
      const cx = this.renderer.borderX + (food.x + 0.5) * cellW;
      const cy = this.renderer.borderY + (food.y + 0.5) * cellH;

      const colors = {
        apple: '#ff4757',
        banana: '#ffa502',
        cherry: '#e84118',
        strawberry: '#ff6b81',
        gold: '#ffd700'
      };
      const color = colors[food.type] || '#ffd700';

      this.particleSystem.spawnFruitBurst(cx, cy, color, food.isSpecial ? 24 : 16);
      this.particleSystem.spawnFloatingScore(`+${points}`, cx, cy - 10, color);
      this.audioManager.playEat(food.points > 1, food.type === 'gold');

      // Check if player just broke high score during this run
      if (this.prevHighScore > 0 && score > this.prevHighScore && !this.celebratedHighScore) {
        this.celebratedHighScore = true;
        this.audioManager.playHighScore();
        bus.emit('highscore:beaten', { score });
      }
    });

    const pauseHudBtn = document.getElementById('btn-pause-hud');
    if (pauseHudBtn) {
      pauseHudBtn.addEventListener('click', () => this.togglePause());
    }
  }

  /**
   * Set active game mode by ID
   * @param {string} modeId
   */
  setMode(modeId) {
    this.mode = modeManager.get(modeId);
    console.log('🎮 Mode changed to:', this.mode.name);
    if (this.state === GAME_STATE.PLAYING) {
      this.restart();
    }
  }

  /**
   * Set grid dimensions
   * @param {object} gridObj - { cols, rows }
   */
  setGrid(gridObj) {
    if (!gridObj || !gridObj.cols || !gridObj.rows) return;
    this.grid = { ...gridObj };
    if (this.state === GAME_STATE.PLAYING) {
      this.restart();
    } else {
      this.snake.reset(
        { x: Math.floor(this.grid.cols / 2), y: Math.floor(this.grid.rows / 2) },
        3,
        DIR.RIGHT
      );
      this.food.reset(this.snake.body, this.grid);
      this.render(0);
    }
  }

  /**
   * Set active fruit count
   * @param {number} count
   */
  setFruitCount(count) {
    this.food.setTargetCount(count);
    if (this.state === GAME_STATE.PLAYING) {
      this.food.ensurePopulation(this.snake.body, this.grid);
    } else {
      this.food.reset(this.snake.body, this.grid);
      this.render(0);
    }
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.particleSystem.reset();
    this.prevHighScore = this.scoreSystem.highScore;
    this.celebratedHighScore = false;

    this.snake.reset(
      { x: Math.floor(this.grid.cols / 2), y: Math.floor(this.grid.rows / 2) },
      3,
      DIR.RIGHT
    );
    this.food.reset(this.snake.body, this.grid);
    this.inputManager.reset(DIR.RIGHT);

    const baseSpeed = Math.round(SPEED.BASE_MS / this.mode.getSpeedModifier());
    this.loop.setSpeed(baseSpeed);
    this.loop.start();
    this.updateHUD();
    console.log('🐍 Game started! Mode:', this.mode.name, 'Grid:', this.grid.cols, 'x', this.grid.rows);
  }

  restart() {
    this.scoreSystem.reset();
    this.updateHUD();
    this.start();
  }

  togglePause() {
    if (this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.WIN) return;

    const isPaused = this.loop.togglePause();
    this.state = isPaused ? GAME_STATE.PAUSED : GAME_STATE.PLAYING;
    this.updateHUD();
    console.log(isPaused ? '⏸ Game Paused' : '▶ Game Resumed');
  }

  handleGameOver() {
    if (this.state === GAME_STATE.GAME_OVER) return;
    this.state = GAME_STATE.GAME_OVER;
    this.snake.isDead = true;

    this.audioManager.playDie();
    this.renderer.triggerScreenShake(350, 8);

    this.updateHUD();
    console.log('💀 GAME OVER! Score:', this.scoreSystem.score);
  }

  handleWin() {
    if (this.state === GAME_STATE.WIN || this.state === GAME_STATE.GAME_OVER) return;
    this.state = GAME_STATE.WIN;
    this.audioManager.playHighScore();
    this.updateHUD();
    bus.emit('game:win', { score: this.scoreSystem.score });
    console.log('🏆 VICTORY! Arena cleared! Score:', this.scoreSystem.score);
  }

  updateHUD() {
    const scoreStr = this.scoreSystem.score.toString();
    const highScoreStr = this.scoreSystem.highScore.toString();

    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    const hudScoreEl = document.getElementById('hud-score');
    const hudBestEl = document.getElementById('hud-best');
    const pauseHudBtn = document.getElementById('btn-pause-hud');

    if (scoreEl) scoreEl.textContent = scoreStr;
    if (highScoreEl) highScoreEl.textContent = highScoreStr;
    if (hudScoreEl) hudScoreEl.textContent = scoreStr;
    if (hudBestEl) hudBestEl.textContent = highScoreStr;

    if (pauseHudBtn) {
      pauseHudBtn.textContent = this.state === GAME_STATE.PAUSED ? '▶' : '⏸';
    }
  }

  /**
   * Fixed tick logic update
   */
  update(tickDelta) {
    if (this.state !== GAME_STATE.PLAYING) {
      this.particleSystem.update(tickDelta / 1000);
      return;
    }

    // Update particle effects and floating score text
    this.particleSystem.update(tickDelta / 1000);

    // 1. Mode-specific update hook (e.g. moving targets)
    this.mode.onUpdate(tickDelta, this.snake, this.food, this.grid);

    // 2. Update food timers (e.g. golden fruit)
    this.food.update(tickDelta, this.snake.body, this.grid);

    // 3. Poll buffered input direction
    const nextDir = this.inputManager.pollDirection(this.snake.direction);
    if (nextDir) {
      this.snake.setDirection(nextDir);
    }

    // 4. Move snake
    this.snake.move();

    // 5. Check wall and self collisions (delegating to active mode)
    const collision = this.collisionSystem.check(this.snake, this.grid, this.mode);
    if (collision.collided) {
      bus.emit('game:over', { score: this.scoreSystem.score, cause: collision.type });
      return;
    }

    // 6. Check food collision
    const eatenFood = this.collisionSystem.checkFood(this.snake.head, this.food.items);
    if (eatenFood) {
      this.snake.grow(1);

      const points = eatenFood.points * this.mode.getScoreMultiplier();
      this.scoreSystem.add(points);
      this.mode.onFoodEaten(eatenFood, this.scoreSystem, this.snake);
      this.food.consume(eatenFood, this.snake.body, this.grid);

      // Accelerate speed dynamically as more fruits are consumed
      const rawSpeed = this.scoreSystem.getSpeedMs(SPEED.BASE_MS, SPEED.MIN_MS, SPEED.STEP_DOWN);
      const newSpeed = Math.round(rawSpeed / this.mode.getSpeedModifier());
      this.loop.setSpeed(newSpeed);

      bus.emit('food:eaten', {
        food: eatenFood,
        points,
        score: this.scoreSystem.score
      });

      this.updateHUD();

      // Check win condition (all cells occupied by snake)
      if (this.snake.body.length >= this.grid.cols * this.grid.rows) {
        this.handleWin();
        return;
      }
    }
  }

  /**
   * Render frame (60fps)
   */
  render(interpolation) {
    this.renderer.draw(this.snake, this.food, this.grid, this.mode, this.particleSystem, 16.67);
  }
}

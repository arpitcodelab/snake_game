import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { Snake } from '../entities/Snake.js';
import { Food } from '../entities/Food.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { Renderer } from '../renderer/Renderer.js';
import { bus } from './EventBus.js';
import { GRID, SPEED, GAME_STATE, DIR } from '../utils/Constants.js';

/**
 * Main Game Coordinator orchestrating state, loop, entities, and rendering
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = GAME_STATE.START;
    this.grid = { ...GRID.MEDIUM }; // 30x30 default
    this.speed = SPEED.BASE_MS;

    // Systems
    this.renderer = new Renderer(canvas);
    this.inputManager = new InputManager();
    this.collisionSystem = new CollisionSystem();
    this.scoreSystem = new ScoreSystem();
    this.food = new Food();

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

    // Bind event bus listeners
    this.setupEvents();
    this.updateHUD();
  }

  setupEvents() {
    bus.on('input:pause', () => this.togglePause());
    bus.on('input:restart', () => this.restart());
    bus.on('game:over', () => this.handleGameOver());
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.snake.reset(
      { x: Math.floor(this.grid.cols / 2), y: Math.floor(this.grid.rows / 2) },
      3,
      DIR.RIGHT
    );
    this.food.reset(this.snake.body, this.grid);
    this.inputManager.reset(DIR.RIGHT);
    this.loop.setSpeed(this.speed);
    this.loop.start();
    console.log('🐍 Game started! Grid:', this.grid.cols, 'x', this.grid.rows);
  }

  restart() {
    this.scoreSystem.reset();
    this.updateHUD();
    this.start();
  }

  togglePause() {
    if (this.state === GAME_STATE.GAME_OVER) return;

    const isPaused = this.loop.togglePause();
    this.state = isPaused ? GAME_STATE.PAUSED : GAME_STATE.PLAYING;
    console.log(isPaused ? '⏸ Game Paused' : '▶ Game Resumed');
  }

  handleGameOver() {
    this.state = GAME_STATE.GAME_OVER;
    this.snake.isDead = true;
    this.loop.stop();

    this.updateHUD();
    console.log('💀 GAME OVER! Score:', this.scoreSystem.score);
  }

  updateHUD() {
    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    if (scoreEl) scoreEl.textContent = this.scoreSystem.score.toString();
    if (highScoreEl) highScoreEl.textContent = this.scoreSystem.highScore.toString();
  }

  /**
   * Fixed tick logic update
   */
  update(tickDelta) {
    if (this.state !== GAME_STATE.PLAYING) return;

    // 1. Update food timers (e.g. golden fruit)
    this.food.update(tickDelta, this.snake.body, this.grid);

    // 2. Poll buffered input direction
    const nextDir = this.inputManager.pollDirection(this.snake.direction);
    if (nextDir) {
      this.snake.setDirection(nextDir);
    }

    // 3. Move snake
    this.snake.move();

    // 4. Check wall and self collisions
    const collision = this.collisionSystem.check(this.snake, this.grid);
    if (collision.collided) {
      bus.emit('game:over', { score: this.scoreSystem.score, cause: collision.type });
      return;
    }

    // 5. Check food collision
    const eatenFood = this.collisionSystem.checkFood(this.snake.head, this.food.items);
    if (eatenFood) {
      this.snake.grow(1);
      this.scoreSystem.add(eatenFood.points);
      this.food.consume(eatenFood, this.snake.body, this.grid);

      // Accelerate speed dynamically as more fruits are consumed
      const newSpeed = this.scoreSystem.getSpeedMs(SPEED.BASE_MS, SPEED.MIN_MS, SPEED.STEP_DOWN);
      this.loop.setSpeed(newSpeed);

      bus.emit('food:eaten', {
        food: eatenFood,
        points: eatenFood.points,
        score: this.scoreSystem.score
      });

      this.updateHUD();
    }
  }

  /**
   * Render frame (60fps)
   */
  render(interpolation) {
    this.renderer.draw(this.snake, this.food, this.grid);
  }
}


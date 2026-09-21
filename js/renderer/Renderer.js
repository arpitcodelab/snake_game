import { GridRenderer } from './GridRenderer.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { FoodRenderer } from './FoodRenderer.js';
import { CANVAS } from '../utils/Constants.js';

/**
 * Master Renderer managing Canvas context, High-DPI scaling, and rendering pipeline
 * with Google Snake bordered grid layout.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.logicalWidth = CANVAS.LOGICAL_WIDTH || 660;
    this.logicalHeight = CANVAS.LOGICAL_HEIGHT || 592;
    this.borderX = CANVAS.BORDER_X || 24;
    this.borderY = CANVAS.BORDER_Y || 26;

    this.gridRenderer = new GridRenderer(this.borderX, this.borderY);
    this.snakeRenderer = new SnakeRenderer();
    this.foodRenderer = new FoodRenderer();

    // Screen shake state
    this.shakeDuration = 0;
    this.shakeRemaining = 0;
    this.shakeIntensity = 0;

    this.setupHighDpi();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.setupHighDpi());
    }
  }

  /**
   * Trigger screen shake effect
   * @param {number} durationMs - Duration in milliseconds
   * @param {number} intensity - Max pixel displacement
   */
  triggerScreenShake(durationMs = 300, intensity = 8) {
    this.shakeDuration = durationMs;
    this.shakeRemaining = durationMs;
    this.shakeIntensity = intensity;
  }

  /**
   * Set up high-DPI scaling
   */
  setupHighDpi() {
    if (typeof window === 'undefined') return;
    const dpr = window.devicePixelRatio || 1;

    // Physical pixel size
    this.canvas.width = Math.round(this.logicalWidth * dpr);
    this.canvas.height = Math.round(this.logicalHeight * dpr);

    // Scale to logical units
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  }

  /**
   * Master draw frame
   * @param {Snake} snake
   * @param {Food} food
   * @param {object} grid - { cols, rows }
   * @param {GameMode} [mode]
   * @param {ParticleSystem} [particleSystem]
   * @param {number} [frameDeltaMs]
   */
  draw(snake, food, grid, mode = null, particleSystem = null, frameDeltaMs = 16.67) {
    const gridW = this.logicalWidth - this.borderX * 2;
    const gridH = this.logicalHeight - this.borderY * 2;
    const cellWidth = gridW / grid.cols;
    const cellHeight = gridH / grid.rows;

    let isShaking = false;
    if (this.shakeRemaining > 0) {
      isShaking = true;
      const progress = 1 - (this.shakeRemaining / this.shakeDuration);
      const intensity = this.shakeIntensity * (1 - progress);
      const ox = (Math.random() * 2 - 1) * intensity;
      const oy = (Math.random() * 2 - 1) * intensity;

      this.ctx.save();
      this.ctx.translate(ox, oy);

      this.shakeRemaining -= frameDeltaMs;
      if (this.shakeRemaining < 0) this.shakeRemaining = 0;
    }

    // 1. Draw board border & checkerboard
    this.gridRenderer.draw(this.ctx, this.logicalWidth, this.logicalHeight, grid.cols, grid.rows);

    // 2. Draw active food items (with border offset)
    if (food && food.items) {
      this.foodRenderer.draw(this.ctx, food.items, cellWidth, cellHeight, this.borderX, this.borderY);
    }

    // 3. Draw snake (with border offset)
    if (snake) {
      this.snakeRenderer.draw(this.ctx, snake, cellWidth, cellHeight, mode, frameDeltaMs, this.borderX, this.borderY);
    }

    // 4. Draw particle effects and floating score text
    if (particleSystem) {
      particleSystem.draw(this.ctx);
    }

    if (isShaking) {
      this.ctx.restore();
    }
  }
}

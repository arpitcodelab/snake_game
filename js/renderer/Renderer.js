import { GridRenderer } from './GridRenderer.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { FoodRenderer } from './FoodRenderer.js';
import { CANVAS } from '../utils/Constants.js';

/**
 * Master Renderer managing Canvas context, High-DPI scaling, and rendering pipeline
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.logicalSize = CANVAS.LOGICAL_SIZE;
    
    this.gridRenderer = new GridRenderer();
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
   * Set up high-DPI (Retina) scaling to eliminate blurriness
   */
  setupHighDpi() {
    if (typeof window === 'undefined') return;
    const dpr = window.devicePixelRatio || 1;
    
    // Physical pixel size of canvas backing store
    this.canvas.width = Math.round(this.logicalSize * dpr);
    this.canvas.height = Math.round(this.logicalSize * dpr);

    // Reset transform and scale to logical units
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
    const width = this.logicalSize;
    const height = this.logicalSize;
    const cellWidth = width / grid.cols;
    const cellHeight = height / grid.rows;

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

    // 1. Draw board background & grid
    this.gridRenderer.draw(this.ctx, width, height, grid.cols, grid.rows);

    // 2. Draw active food items
    if (food && food.items) {
      this.foodRenderer.draw(this.ctx, food.items, cellWidth, cellHeight);
    }

    // 3. Draw realistic snake with continuous body, tongue flick & blinking eyes
    if (snake) {
      this.snakeRenderer.draw(this.ctx, snake, cellWidth, cellHeight, mode, frameDeltaMs);
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

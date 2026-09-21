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

    this.setupHighDpi();
    window.addEventListener('resize', () => this.setupHighDpi());
  }

  /**
   * Set up high-DPI (Retina) scaling to eliminate blurriness
   */
  setupHighDpi() {
    const dpr = window.devicePixelRatio || 1;
    
    // Physical pixel size of canvas backing store
    this.canvas.width = Math.round(this.logicalSize * dpr);
    this.canvas.height = Math.round(this.logicalSize * dpr);

    // Reset transform and scale to logical units
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Master draw frame
   * @param {Snake} snake
   * @param {Food} food
   * @param {object} grid - { cols, rows }
   * @param {GameMode} [mode]
   */
  draw(snake, food, grid, mode = null) {
    const width = this.logicalSize;
    const height = this.logicalSize;
    const cellWidth = width / grid.cols;
    const cellHeight = height / grid.rows;

    // 1. Draw board background & grid
    this.gridRenderer.draw(this.ctx, width, height, grid.cols, grid.rows);

    // 2. Draw active food items
    if (food && food.items) {
      this.foodRenderer.draw(this.ctx, food.items, cellWidth, cellHeight);
    }

    // 3. Draw snake
    if (snake) {
      this.snakeRenderer.draw(this.ctx, snake, cellWidth, cellHeight, mode);
    }
  }
}


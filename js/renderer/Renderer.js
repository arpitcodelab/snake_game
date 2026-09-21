import { GridRenderer } from './GridRenderer.js';
import { SnakeRenderer } from './SnakeRenderer.js';
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

    this.setupHighDpi();
    window.addEventListener('resize', () => this.setupHighDpi());
  }

  /**
   * Set up high-DPI (Retina) scaling to eliminate blurriness
   */
  setupHighDpi() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
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
   * @param {object} grid - { cols, rows }
   */
  draw(snake, grid) {
    const width = this.logicalSize;
    const height = this.logicalSize;

    // 1. Draw board background & grid
    this.gridRenderer.draw(this.ctx, width, height, grid.cols, grid.rows);

    // 2. Draw snake
    if (snake) {
      this.snakeRenderer.draw(this.ctx, snake, width / grid.cols, height / grid.rows);
    }
  }
}

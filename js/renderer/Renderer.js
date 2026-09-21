import { GridRenderer } from './GridRenderer.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { FoodRenderer } from './FoodRenderer.js';
import { CANVAS } from '../utils/Constants.js';
import { performanceMonitor, QUALITY_TIER } from '../systems/PerformanceMonitor.js';

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

    // Cached post-processing overlays to eliminate per-frame 148 fillRect loops
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.cachedOverlayWidth = 0;
    this.cachedOverlayHeight = 0;

    this.setupHighDpi();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.setupHighDpi();
        this.gridRenderer.invalidateCache();
        this.overlayCanvas = null;
      });
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.setupHighDpi();
          this.gridRenderer.invalidateCache();
          this.overlayCanvas = null;
        }, 100);
      });
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
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

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
      this.snakeRenderer.draw(this.ctx, snake, cellWidth, cellHeight, mode, frameDeltaMs, this.borderX, this.borderY, particleSystem);
    }

    // 4. Draw particle effects and floating score text
    if (particleSystem) {
      particleSystem.draw(this.ctx);
    }

    // 5. Post-processing pass (dynamic lighting, vignette, scanlines, glass sheen)
    this.applyPostProcessing(this.ctx, this.logicalWidth, this.logicalHeight, snake, food, cellWidth, cellHeight);

    if (isShaking) {
      this.ctx.restore();
    }
  }

  /**
   * Adaptive Post-Processing Pass:
   * - HIGH: Full dynamic headlight, entity ambient halos, cached vignette/scanlines, curved glass sheen
   * - MEDIUM: Simplified headlight, cached vignette (no scanlines, no entity halos)
   * - LOW: Completely bypasses post-processing for maximum mobile performance
   */
  applyPostProcessing(ctx, width, height, snake, food, cellWidth, cellHeight) {
    const tier = performanceMonitor.getTier();

    // In LOW mode: bypass all post-processing for maximum responsiveness
    if (tier === QUALITY_TIER.LOW) {
      return;
    }

    ctx.save();

    // 1. Dynamic Headlight (MEDIUM and HIGH)
    if (snake && !snake.isDead && snake.head && snake.direction) {
      const hx = this.borderX + (snake.head.x + 0.5) * cellWidth;
      const hy = this.borderY + (snake.head.y + 0.5) * cellHeight;
      const dir = snake.direction;
      const reach = cellWidth * (tier === QUALITY_TIER.HIGH ? 3.2 : 2.2);

      const coneGrad = ctx.createRadialGradient(
        hx, hy, cellWidth * 0.2,
        hx + dir.x * (reach * 0.7), hy + dir.y * (reach * 0.7), reach
      );
      coneGrad.addColorStop(0, 'rgba(0, 242, 254, 0.08)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.arc(hx, hy, reach, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Target Ambient Light Halos (HIGH only)
    if (tier === QUALITY_TIER.HIGH && food && food.items) {
      for (const item of food.items) {
        const ix = this.borderX + (item.x + 0.5) * cellWidth;
        const iy = this.borderY + (item.y + 0.5) * cellHeight;
        const haloR = cellWidth * 1.6;

        const haloGrad = ctx.createRadialGradient(ix, iy, 4, ix, iy, haloR);
        const color = item.isGolden ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 8, 68, 0.06)';
        haloGrad.addColorStop(0, color);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(ix, iy, haloR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Pre-Rendered Vignette & Scanline Overlay (Zero per-frame fillRect loops)
    this.drawCachedOverlay(ctx, width, height, tier);

    // 4. Curved Cabinet Glass Reflection Sheen (HIGH only)
    if (tier === QUALITY_TIER.HIGH) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, 0);
      ctx.bezierCurveTo(width * 0.35, height * 0.45, width * 0.65, height * 0.55, width * 0.9, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw pre-rendered vignette & scanline overlay (eliminating 148 fillRect calls per frame)
   */
  drawCachedOverlay(ctx, width, height, tier) {
    if (
      !this.overlayCanvas ||
      this.cachedOverlayWidth !== width ||
      this.cachedOverlayHeight !== height
    ) {
      this.bakeOverlay(width, height);
    }

    if (this.overlayCanvas) {
      ctx.drawImage(this.overlayCanvas, 0, 0);
    }
  }

  bakeOverlay(width, height) {
    if (typeof document === 'undefined') return;

    if (!this.overlayCanvas) {
      this.overlayCanvas = document.createElement('canvas');
    }
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.cachedOverlayWidth = width;
    this.cachedOverlayHeight = height;

    const octx = this.overlayCtx;

    // Pre-bake vignette
    const vignette = octx.createRadialGradient(
      width * 0.5, height * 0.5, Math.min(width, height) * 0.42,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.65, 'rgba(4, 6, 12, 0.18)');
    vignette.addColorStop(1, 'rgba(2, 4, 8, 0.62)');
    octx.fillStyle = vignette;
    octx.fillRect(0, 0, width, height);

    // Pre-bake scanlines ONCE (eliminating 148 fillRect calls per frame)
    octx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < height; y += 4) {
      octx.fillRect(0, y, width, 1);
    }
  }
}

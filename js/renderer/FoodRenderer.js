/**
 * FoodRenderer slices 128x128 fruit frames from apple_types.png
 * and renders fruits with subtle breathing animations and golden fruit effects.
 */
export class FoodRenderer {
  constructor() {
    this.spritesheet = new Image();
    this.spritesheet.src = 'assets/images/fruits/apple_types.png';
    this.isLoaded = false;
    this.frameSize = 128; // 128x128 per frame in 1792x128 sprite sheet

    this.spritesheet.onload = () => {
      this.isLoaded = true;
    };
    this.spritesheet.onerror = () => {
      console.warn('Could not load fruit spritesheet, using fallback shapes');
    };
  }

  /**
   * Draw all active food items
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<object>} foodItems
   * @param {number} cellWidth
   * @param {number} cellHeight
   * @param {number} [offsetX=0]
   * @param {number} [offsetY=0]
   */
  draw(ctx, foodItems, cellWidth, cellHeight, offsetX = 0, offsetY = 0) {
    if (!foodItems || foodItems.length === 0) return;

    const now = performance.now();

    for (const food of foodItems) {
      const centerX = offsetX + food.x * cellWidth + cellWidth / 2;
      const centerY = offsetY + food.y * cellHeight + cellHeight / 2;

      // Subtle breathing scale (1.0 to 1.06)
      const scale = 1.0 + Math.sin(now * 0.006 + food.x + food.y) * 0.03;
      const drawW = cellWidth * scale;
      const drawH = cellHeight * scale;
      const drawX = centerX - drawW / 2;
      const drawY = centerY - drawH / 2;

      ctx.save();

      // Golden fruit effects
      if (food.isGolden) {
        if (food.timer < 1500) {
          const flash = Math.floor(now / 150) % 2 === 0;
          if (flash) ctx.globalAlpha = 0.4;
        }

        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 16;

        if (food.duration > 0) {
          const progress = Math.max(0, food.timer / food.duration);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellWidth * 0.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
          ctx.stroke();
        }
      }

      if (this.isLoaded) {
        // Draw from spritesheet
        const frameIndex = food.spriteIndex || 0;
        const sx = frameIndex * this.frameSize;
        ctx.drawImage(
          this.spritesheet,
          sx, 0, this.frameSize, this.frameSize,
          drawX, drawY, drawW, drawH
        );
      } else {
        // Fallback procedural circle
        ctx.fillStyle = food.color || '#ff4757';
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellWidth * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

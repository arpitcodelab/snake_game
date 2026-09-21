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
   */
  draw(ctx, foodItems, cellWidth, cellHeight) {
    if (!foodItems || foodItems.length === 0) return;

    const now = performance.now();

    for (const food of foodItems) {
      const centerX = food.x * cellWidth + cellWidth / 2;
      const centerY = food.y * cellHeight + cellHeight / 2;

      // Subtle breathing scale (1.0 to 1.08)
      const scale = 1.0 + Math.sin(now * 0.006 + food.x + food.y) * 0.04;
      const drawW = cellWidth * scale;
      const drawH = cellHeight * scale;
      const drawX = centerX - drawW / 2;
      const drawY = centerY - drawH / 2;

      ctx.save();

      // Golden fruit effects
      if (food.isGolden) {
        // Flash warning when < 1500ms remain
        if (food.timer < 1500) {
          const flash = Math.floor(now / 150) % 2 === 0;
          if (flash) ctx.globalAlpha = 0.4;
        }

        // Golden aura glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 16;

        // Draw countdown timer arc
        if (food.duration > 0) {
          const progress = Math.max(0, food.timer / food.duration);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, (cellWidth / 2) + 2, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
          ctx.stroke();
        }
      }

      if (this.isLoaded) {
        const sx = (food.spriteIndex || 0) * this.frameSize;
        ctx.drawImage(
          this.spritesheet,
          sx, 0, this.frameSize, this.frameSize,
          drawX, drawY, drawW, drawH
        );
      } else {
        // Fallback procedural rendering
        ctx.fillStyle = food.isGolden ? '#ffd700' : (food.points > 1 ? '#ff4757' : '#2ed573');
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(drawW, drawH) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

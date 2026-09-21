/**
 * GridRenderer draws the board background and checkerboard or grid lines
 */
export class GridRenderer {
  constructor() {
    this.bgDark = '#161722';
    this.bgLight = '#1b1c2a';
    this.lineColor = 'rgba(255, 255, 255, 0.03)';
  }

  setThemeColors(bgDark, bgLight, lineColor) {
    if (bgDark) this.bgDark = bgDark;
    if (bgLight) this.bgLight = bgLight;
    if (lineColor) this.lineColor = lineColor;
  }

  /**
   * Render grid board
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width - Logical width
   * @param {number} height - Logical height
   * @param {number} cols
   * @param {number} rows
   */
  draw(ctx, width, height, cols, rows) {
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Draw checkerboard tiles like classic Google Snake
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isEven = (r + c) % 2 === 0;
        ctx.fillStyle = isEven ? this.bgLight : this.bgDark;
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      }
    }

    // Optional fine grid lines
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      const x = Math.floor(c * cellWidth);
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let r = 0; r <= rows; r++) {
      const y = Math.floor(r * cellHeight);
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
  }
}

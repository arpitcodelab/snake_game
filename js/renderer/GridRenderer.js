/**
 * GridRenderer draws the board background border and checkered tiles
 * matching the authentic Google Snake look.
 */
export class GridRenderer {
  constructor(borderX = 24, borderY = 26) {
    this.borderX = borderX;
    this.borderY = borderY;
    this.borderColor = '#ab4e30'; // Terracotta border matching screenshot
    this.bgLight = '#fed049';     // Warm yellow tile 1
    this.bgDark = '#f5c338';      // Warm yellow tile 2
    this.lineColor = 'rgba(0, 0, 0, 0)';
  }

  setThemeColors(bgDark, bgLight, lineColor, borderColor = null) {
    if (bgDark) this.bgDark = bgDark;
    if (bgLight) this.bgLight = bgLight;
    if (lineColor) this.lineColor = lineColor;
    if (borderColor) this.borderColor = borderColor;
  }

  /**
   * Render grid board with surrounding border
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width - Logical width (including borders)
   * @param {number} height - Logical height (including borders)
   * @param {number} cols
   * @param {number} rows
   */
  draw(ctx, width, height, cols, rows) {
    // 1. Draw outer border (terracotta)
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw inner checkered tiles
    const gridW = width - this.borderX * 2;
    const gridH = height - this.borderY * 2;
    const cellWidth = gridW / cols;
    const cellHeight = gridH / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isEven = (r + c) % 2 === 0;
        ctx.fillStyle = isEven ? this.bgLight : this.bgDark;
        ctx.fillRect(
          this.borderX + c * cellWidth,
          this.borderY + r * cellHeight,
          cellWidth,
          cellHeight
        );
      }
    }
  }
}

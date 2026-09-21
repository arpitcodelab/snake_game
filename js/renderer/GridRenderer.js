import { assetLoader } from '../utils/AssetLoader.js';

/**
 * GridRenderer renders a premium 2.5D futuristic cyberpunk arena from the year 2099:
 * - High-tech sci-fi space arena border & background from boaa.png
 * - Glowing cyber frame with corner chamfers, neon rails, and coordinate grid
 * - Emissive cyan laser guide rails with controlled bloom
 * - Offscreen canvas caching for 99% draw call reduction
 */
export class GridRenderer {
  constructor(borderX = 24, borderY = 26) {
    this.borderX = borderX;
    this.borderY = borderY;

    // Preload futuristic board asset
    assetLoader.load('board', 'assets/images/boaa.png');
    assetLoader.onLoad((key) => {
      if (key === 'board') {
        this.invalidateCache();
      }
    });

    // Default 2099 Cyber Obsidian palette
    this.borderColor = '#0c101a';
    this.wallHighlight = '#1a233a';
    this.wallShadow = '#06080e';
    this.bgLight = '#121826';
    this.bgDark = '#0c101b';
    this.lineColor = 'rgba(0, 242, 254, 0.05)';
    this.emissiveRail = '#00f2fe';
    this.beaconColor = '#00f2fe';

    // Offscreen Canvas Cache for 99% draw call reduction
    this.cacheCanvas = null;
    this.cacheCtx = null;
    this.cachedWidth = 0;
    this.cachedHeight = 0;
    this.cachedCols = 0;
    this.cachedRows = 0;
    this.isDirty = true;
  }

  setThemeColors(bgDark, bgLight, lineColor = null, borderColor = null) {
    if (bgDark) this.bgDark = bgDark;
    if (bgLight) this.bgLight = bgLight;
    if (lineColor) this.lineColor = lineColor;
    if (borderColor) this.borderColor = borderColor;
    this.isDirty = true;
  }

  invalidateCache() {
    this.isDirty = true;
  }

  /**
   * Master draw frame for the 2.5D World / Maze
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width - Logical canvas width
   * @param {number} height - Logical canvas height
   * @param {number} cols - Grid column count
   * @param {number} rows - Grid row count
   */
  draw(ctx, width, height, cols, rows) {
    if (
      this.isDirty ||
      !this.cacheCanvas ||
      this.cachedWidth !== width ||
      this.cachedHeight !== height ||
      this.cachedCols !== cols ||
      this.cachedRows !== rows
    ) {
      this.bakeCache(width, height, cols, rows);
    }

    ctx.drawImage(this.cacheCanvas, 0, 0);
  }

  /**
   * Pre-render the entire static arena onto an offscreen canvas
   */
  bakeCache(width, height, cols, rows) {
    if (typeof document === 'undefined') return;

    if (!this.cacheCanvas) {
      this.cacheCanvas = document.createElement('canvas');
    }
    this.cacheCanvas.width = width;
    this.cacheCanvas.height = height;
    this.cacheCtx = this.cacheCanvas.getContext('2d');

    const ctx = this.cacheCtx;
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.cachedCols = cols;
    this.cachedRows = rows;
    this.isDirty = false;

    const gridW = width - this.borderX * 2;
    const gridH = height - this.borderY * 2;
    const cellWidth = gridW / cols;
    const cellHeight = gridH / rows;
    const bx = this.borderX;
    const by = this.borderY;

    // ============================================================
    // 1. ARENA FLOOR & FUTURISTIC BOARD ASSET
    // ============================================================
    if (assetLoader.isReady('board')) {
      const boardImg = assetLoader.get('board');
      // Draw futuristic sci-fi arena frame & cosmic space background
      ctx.drawImage(boardImg, 0, 0, width, height);

      // High-tech coordinate grid lines over the play area
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.09)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 1; c < cols; c++) {
        const lx = bx + c * cellWidth;
        ctx.moveTo(lx, by);
        ctx.lineTo(lx, by + gridH);
      }
      for (let r = 1; r < rows; r++) {
        const ly = by + r * cellHeight;
        ctx.moveTo(bx, ly);
        ctx.lineTo(bx + gridW, ly);
      }
      ctx.stroke();

      // Subtle coordinate intersection node pins
      ctx.fillStyle = 'rgba(0, 242, 254, 0.28)';
      for (let r = 1; r < rows; r += 2) {
        for (let c = 1; c < cols; c += 2) {
          const px = bx + c * cellWidth;
          const py = by + r * cellHeight;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }

      // Emissive laser guide boundary framing the arena
      ctx.save();
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 0.5, by + 0.5, gridW - 1, gridH - 1);
      ctx.restore();

      return;
    }

    // ============================================================
    // PROCEDURAL FALLBACK (When board.png is loading or in headless tests)
    // ============================================================
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isEven = (r + c) % 2 === 0;
        const tileX = bx + c * cellWidth;
        const tileY = by + r * cellHeight;

        ctx.fillStyle = isEven ? this.bgLight : this.bgDark;
        ctx.fillRect(tileX, tileY, cellWidth, cellHeight);
      }
    }

    // Micro-grooves between floor plates
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < cols; c++) {
      const lx = bx + c * cellWidth;
      ctx.moveTo(lx, by);
      ctx.lineTo(lx, by + gridH);
    }
    for (let r = 1; r < rows; r++) {
      const ly = by + r * cellHeight;
      ctx.moveTo(bx, ly);
      ctx.lineTo(bx + gridW, ly);
    }
    ctx.stroke();

    // Subtle intersection node pins (high-tech coordinate grid)
    ctx.fillStyle = 'rgba(0, 242, 254, 0.18)';
    for (let r = 1; r < rows; r += 2) {
      for (let c = 1; c < cols; c += 2) {
        const px = bx + c * cellWidth;
        const py = by + r * cellHeight;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }
    }

    // Specular floor gloss & central spotlight vignette
    const floorGrad = ctx.createRadialGradient(
      bx + gridW * 0.5, by + gridH * 0.4, 40,
      bx + gridW * 0.5, by + gridH * 0.5, gridW * 0.7
    );
    floorGrad.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
    floorGrad.addColorStop(0.5, 'rgba(0, 102, 255, 0.02)');
    floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(bx, by, gridW, gridH);

    // Diagonal polished acrylic sheen reflection across the arena
    const sheenGrad = ctx.createLinearGradient(bx, by, bx + gridW, by + gridH);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
    sheenGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.06)');
    sheenGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.01)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(bx, by, gridW, gridH);

    // ============================================================
    // 2. INNER AMBIENT OCCLUSION (Shadow cast from walls onto floor)
    // ============================================================
    // Top inner wall shadow
    const topShadow = ctx.createLinearGradient(bx, by, bx, by + 14);
    topShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    topShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topShadow;
    ctx.fillRect(bx, by, gridW, 14);

    // Left inner wall shadow
    const leftShadow = ctx.createLinearGradient(bx, by, bx + 14, by);
    leftShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    leftShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(bx, by, 14, gridH);

    // Bottom inner shadow
    const btmShadow = ctx.createLinearGradient(bx, by + gridH, bx, by + gridH - 10);
    btmShadow.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    btmShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = btmShadow;
    ctx.fillRect(bx, by + gridH - 10, gridW, 10);

    // Right inner shadow
    const rightShadow = ctx.createLinearGradient(bx + gridW, by, bx + gridW - 10, by);
    rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rightShadow;
    ctx.fillRect(bx + gridW - 10, by, 10, gridH);

    // ============================================================
    // 3. EXTRUDED 3D BOUNDARY WALLS & BEVELED CHASSIS
    // ============================================================
    ctx.save();

    // Top extruded wall slab
    const topWallGrad = ctx.createLinearGradient(0, 0, 0, by);
    topWallGrad.addColorStop(0, this.wallHighlight);
    topWallGrad.addColorStop(0.7, this.borderColor);
    topWallGrad.addColorStop(1, this.wallShadow);
    ctx.fillStyle = topWallGrad;
    ctx.fillRect(0, 0, width, by);

    // Bottom extruded wall slab
    const btmWallGrad = ctx.createLinearGradient(0, height - by, 0, height);
    btmWallGrad.addColorStop(0, this.wallShadow);
    btmWallGrad.addColorStop(0.4, this.borderColor);
    btmWallGrad.addColorStop(1, this.wallHighlight);
    ctx.fillStyle = btmWallGrad;
    ctx.fillRect(0, height - by, width, by);

    // Left extruded wall slab
    const leftWallGrad = ctx.createLinearGradient(0, 0, bx, 0);
    leftWallGrad.addColorStop(0, this.wallHighlight);
    leftWallGrad.addColorStop(0.7, this.borderColor);
    leftWallGrad.addColorStop(1, this.wallShadow);
    ctx.fillStyle = leftWallGrad;
    ctx.fillRect(0, by, bx, gridH);

    // Right extruded wall slab
    const rightWallGrad = ctx.createLinearGradient(width - bx, 0, width, 0);
    rightWallGrad.addColorStop(0, this.wallShadow);
    rightWallGrad.addColorStop(0.4, this.borderColor);
    rightWallGrad.addColorStop(1, this.wallHighlight);
    ctx.fillStyle = rightWallGrad;
    ctx.fillRect(width - bx, by, bx, gridH);

    // Outer edge rim highlight (simulating directional light from top-left)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, height - 1);
    ctx.lineTo(1, 1);
    ctx.lineTo(width - 1, 1);
    ctx.stroke();

    // Outer bottom/right shadow bevel
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(width - 1, 1);
    ctx.lineTo(width - 1, height - 1);
    ctx.lineTo(1, height - 1);
    ctx.stroke();

    // 45° Corner chamfer bevels
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(bx, by);
    ctx.moveTo(width, 0); ctx.lineTo(bx + gridW, by);
    ctx.moveTo(0, height); ctx.lineTo(bx, by + gridH);
    ctx.moveTo(width, height); ctx.lineTo(bx + gridW, by + gridH);
    ctx.stroke();

    // ============================================================
    // 4. EMISSIVE CYAN LASER GUIDE RAILS (Controlled Glow)
    // ============================================================
    ctx.shadowColor = this.emissiveRail;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = this.emissiveRail;
    ctx.lineWidth = 1.8;

    // Laser boundary line framing the sunken arena
    ctx.strokeRect(bx + 0.5, by + 0.5, gridW - 1, gridH - 1);

    // Secondary inner sub-rail (laser groove accent)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 3.5, by - 3.5, gridW + 7, gridH + 7);

    // ============================================================
    // 5. CORNER BEACON PYLONS (High-Tech LED Pillars)
    // ============================================================
    const beaconCorners = [
      { x: bx, y: by },
      { x: bx + gridW, y: by },
      { x: bx, y: by + gridH },
      { x: bx + gridW, y: by + gridH }
    ];

    for (const b of beaconCorners) {
      // Pylon base bevel
      ctx.fillStyle = '#161e30';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Metallic ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Emissive LED core
      ctx.shadowColor = this.beaconColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

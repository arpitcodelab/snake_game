import { DIR } from '../utils/Constants.js';

/**
 * SnakeRenderer renders the snake's head, eyes, body, and tail
 * with smooth rounded corners and expressive eyes.
 */
export class SnakeRenderer {
  constructor() {
    this.colors = {
      head: '#4ecca3',
      body: '#45b28e',
      eye: '#12131a',
      eyePupil: '#ffffff',
      deadHead: '#e94560',
      deadEye: '#ffffff'
    };
  }

  /**
   * Set colors based on active skin
   * @param {object} skin
   */
  setSkin(skin) {
    if (!skin) return;
    if (skin.head) this.colors.head = skin.head;
    if (skin.body) this.colors.body = skin.body;
    if (skin.eye) this.colors.eye = skin.eye;
    if (skin.eyeWhite) this.colors.eyePupil = skin.eyeWhite;
  }

  /**
   * Draw the snake on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Snake} snake
   * @param {number} cellWidth
   * @param {number} cellHeight
   * @param {GameMode} [mode]
   */
  draw(ctx, snake, cellWidth, cellHeight, mode = null) {
    if (!snake || snake.body.length === 0) return;

    const radius = Math.min(cellWidth, cellHeight) * 0.4;
    const hasSecondHead = mode && typeof mode.hasSecondaryHead === 'function' && mode.hasSecondaryHead();

    // Draw body segments (from tail to segment 1)
    for (let i = snake.body.length - 1; i >= 1; i--) {
      // Check Broken Snake mode gap
      if (mode && typeof mode.shouldRenderSegment === 'function') {
        if (!mode.shouldRenderSegment(i, snake.body.length)) {
          continue;
        }
      }

      // If this is the tail and mode is Two-Headed, render it as a secondary head
      if (i === snake.body.length - 1 && hasSecondHead) {
        continue; // Will draw as secondary head below
      }

      const seg = snake.body[i];
      const px = seg.x * cellWidth;
      const py = seg.y * cellHeight;

      ctx.fillStyle = this.colors.body;
      this.drawRoundedSegment(ctx, px, py, cellWidth, cellHeight, radius);
    }

    // Draw primary head (segment 0)
    const head = snake.head;
    const hx = head.x * cellWidth;
    const hy = head.y * cellHeight;

    ctx.fillStyle = snake.isDead ? this.colors.deadHead : this.colors.head;
    this.drawRoundedSegment(ctx, hx, hy, cellWidth, cellHeight, radius);
    this.drawEyes(ctx, hx, hy, cellWidth, cellHeight, snake.direction, snake.isDead);

    // Draw secondary head if Two-Headed mode
    if (hasSecondHead && snake.body.length > 1) {
      const tail = snake.body[snake.body.length - 1];
      const tx = tail.x * cellWidth;
      const ty = tail.y * cellHeight;

      // Determine reverse direction for secondary head
      const prev = snake.body[snake.body.length - 2];
      const secondDir = {
        x: tail.x - prev.x,
        y: tail.y - prev.y,
        name: (tail.x > prev.x ? 'RIGHT' : tail.x < prev.x ? 'LEFT' : tail.y > prev.y ? 'DOWN' : 'UP')
      };

      ctx.fillStyle = snake.isDead ? this.colors.deadHead : this.colors.head;
      this.drawRoundedSegment(ctx, tx, ty, cellWidth, cellHeight, radius);
      this.drawEyes(ctx, tx, ty, cellWidth, cellHeight, secondDir, snake.isDead);
    }
  }

  /**
   * Helper to draw a rounded rectangle cell
   */
  drawRoundedSegment(ctx, x, y, w, h, r) {
    const pad = 1;
    const rx = x + pad;
    const ry = y + pad;
    const rw = w - pad * 2;
    const rh = h - pad * 2;

    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, r);
    ctx.fill();
  }

  /**
   * Draw eyes oriented towards snake movement direction
   */
  drawEyes(ctx, hx, hy, w, h, dir, isDead) {
    const eyeRadius = Math.min(w, h) * 0.15;
    const pupilRadius = eyeRadius * 0.5;

    let eye1X, eye1Y, eye2X, eye2Y;
    const centerX = hx + w / 2;
    const centerY = hy + h / 2;
    const offsetFront = w * 0.22;
    const offsetSide = h * 0.24;

    if (dir.name === 'UP') {
      eye1X = centerX - offsetSide;
      eye1Y = centerY - offsetFront;
      eye2X = centerX + offsetSide;
      eye2Y = centerY - offsetFront;
    } else if (dir.name === 'DOWN') {
      eye1X = centerX - offsetSide;
      eye1Y = centerY + offsetFront;
      eye2X = centerX + offsetSide;
      eye2Y = centerY + offsetFront;
    } else if (dir.name === 'LEFT') {
      eye1X = centerX - offsetFront;
      eye1Y = centerY - offsetSide;
      eye2X = centerX - offsetFront;
      eye2Y = centerY + offsetSide;
    } else { // RIGHT
      eye1X = centerX + offsetFront;
      eye1Y = centerY - offsetSide;
      eye2X = centerX + offsetFront;
      eye2Y = centerY + offsetSide;
    }

    if (isDead) {
      // Draw X marks for dead eyes
      ctx.strokeStyle = this.colors.deadEye;
      ctx.lineWidth = 2;
      this.drawCross(ctx, eye1X, eye1Y, eyeRadius);
      this.drawCross(ctx, eye2X, eye2Y, eyeRadius);
      return;
    }

    // Outer eyes (whites)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner pupils
    ctx.fillStyle = this.colors.eye;
    const pupilShiftX = dir.x * (eyeRadius * 0.4);
    const pupilShiftY = dir.y * (eyeRadius * 0.4);

    ctx.beginPath();
    ctx.arc(eye1X + pupilShiftX, eye1Y + pupilShiftY, pupilRadius, 0, Math.PI * 2);
    ctx.arc(eye2X + pupilShiftX, eye2Y + pupilShiftY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCross(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r);
    ctx.lineTo(x - r, y + r);
    ctx.stroke();
  }
}


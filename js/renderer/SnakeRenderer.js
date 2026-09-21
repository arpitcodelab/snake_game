import { DIR } from '../utils/Constants.js';

/**
 * SnakeRenderer renders the authentic Google Snake:
 * - Solid, perfectly continuous rounded pill/capsule body (no lines, no seams, no gaps)
 * - Rounded head with expressive white circular eyes on the cheeks
 * - Forward-tracking pupils with catchlights
 * - Two cute nostril dots at the snout
 * - Animated eye blinks and subtle tongue flicks
 */
export class SnakeRenderer {
  constructor() {
    this.colors = {
      head: '#3b82f6',       // Google Snake Royal Blue
      body: '#3b82f6',
      eye: '#172554',        // Deep dark blue / black pupil
      eyePupil: '#172554',
      eyeWhite: '#ffffff',
      nostrils: '#bfdbfe',   // Light blue nostrils matching screenshot
      tongue: '#ff477e',
      deadHead: '#e94560',
      deadEye: '#ffffff'
    };

    // Animation states
    this.animTime = 0;
    this.tongueTimer = 0;
    this.isTongueOut = false;
    this.tongueProgress = 0;

    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkProgress = 0;
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
    if (skin.eyeWhite) this.colors.eyeWhite = skin.eyeWhite;
    if (skin.nostrils) this.colors.nostrils = skin.nostrils;
  }

  /**
   * Update animation timers
   * @param {number} deltaMs
   */
  updateAnimation(deltaMs = 16.67) {
    this.animTime += deltaMs;

    // Tongue flick timer (flicks every ~3.2s for 300ms)
    this.tongueTimer += deltaMs;
    if (!this.isTongueOut && this.tongueTimer > 3200) {
      this.isTongueOut = true;
      this.tongueTimer = 0;
    }
    if (this.isTongueOut) {
      const flickDur = 300;
      this.tongueProgress = Math.sin((this.tongueTimer / flickDur) * Math.PI);
      if (this.tongueTimer >= flickDur) {
        this.isTongueOut = false;
        this.tongueTimer = 0;
        this.tongueProgress = 0;
      }
    }

    // Eye blink timer (blinks every ~3.5s for 150ms)
    this.blinkTimer += deltaMs;
    if (!this.isBlinking && this.blinkTimer > 3500) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      const blinkDur = 150;
      this.blinkProgress = Math.sin((this.blinkTimer / blinkDur) * Math.PI);
      if (this.blinkTimer >= blinkDur) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkProgress = 0;
      }
    }
  }

  /**
   * Draw the authentic Google Snake
   * @param {CanvasRenderingContext2D} ctx
   * @param {Snake} snake
   * @param {number} cellWidth
   * @param {number} cellHeight
   * @param {GameMode} [mode]
   * @param {number} [deltaMs]
   * @param {number} [offsetX=0]
   * @param {number} [offsetY=0]
   */
  draw(ctx, snake, cellWidth, cellHeight, mode = null, deltaMs = 16.67, offsetX = 0, offsetY = 0) {
    if (!snake || snake.body.length === 0) return;

    this.updateAnimation(deltaMs);

    const radius = Math.min(cellWidth, cellHeight) * 0.42;
    const bodyLen = snake.body.length;
    const hasSecondHead = mode && typeof mode.hasSecondaryHead === 'function' && mode.hasSecondaryHead();

    // 1. Calculate segment centers
    const segments = [];
    for (let i = 0; i < bodyLen; i++) {
      const seg = snake.body[i];
      const cx = offsetX + (seg.x + 0.5) * cellWidth;
      const cy = offsetY + (seg.y + 0.5) * cellHeight;

      segments.push({
        x: seg.x,
        y: seg.y,
        cx,
        cy,
        r: radius,
        index: i
      });
    }

    // 2. Draw solid continuous body
    ctx.fillStyle = snake.isDead ? this.colors.deadHead : this.colors.body;

    for (let i = bodyLen - 1; i >= 1; i--) {
      if (mode && typeof mode.shouldRenderSegment === 'function') {
        if (!mode.shouldRenderSegment(i, bodyLen)) continue;
      }
      if (i === bodyLen - 1 && hasSecondHead) continue;

      const curr = segments[i];
      const prev = segments[i - 1];

      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const isAdjacent = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

      if (isAdjacent) {
        this.drawConnectingCapsule(ctx, curr, prev);
      } else {
        this.drawSegmentCircle(ctx, curr);
      }
    }

    // Draw tail cap
    const tailSeg = segments[bodyLen - 1];
    this.drawSegmentCircle(ctx, tailSeg);

    // 3. Draw primary head
    const headSeg = segments[0];
    this.drawHead(ctx, headSeg, cellWidth, cellHeight, snake.direction, snake.isDead);

    // 4. Secondary head if Two-Headed mode
    if (hasSecondHead && bodyLen > 1) {
      const tail = segments[bodyLen - 1];
      const prev = segments[bodyLen - 2];
      const secondDir = {
        x: tail.x - prev.x,
        y: tail.y - prev.y,
        name: (tail.x > prev.x ? 'RIGHT' : tail.x < prev.x ? 'LEFT' : tail.y > prev.y ? 'DOWN' : 'UP')
      };
      this.drawHead(ctx, tail, cellWidth, cellHeight, secondDir, snake.isDead);
    }
  }

  /**
   * Draw seamless solid connecting capsule between two adjacent segments
   */
  drawConnectingCapsule(ctx, segA, segB) {
    const angle = Math.atan2(segB.cy - segA.cy, segB.cx - segA.cx);
    const perp = angle + Math.PI / 2;
    const r = segA.r;

    const p1x = segA.cx + Math.cos(perp) * r;
    const p1y = segA.cy + Math.sin(perp) * r;
    const p2x = segB.cx + Math.cos(perp) * r;
    const p2y = segB.cy + Math.sin(perp) * r;
    const p3x = segB.cx - Math.cos(perp) * r;
    const p3y = segB.cy - Math.sin(perp) * r;
    const p4x = segA.cx - Math.cos(perp) * r;
    const p4y = segA.cy - Math.sin(perp) * r;

    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(segA.cx, segA.cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw circular segment
   */
  drawSegmentCircle(ctx, seg) {
    ctx.beginPath();
    ctx.arc(seg.cx, seg.cy, seg.r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw head with rounded snout, eyes on the cheeks, and nostrils
   */
  drawHead(ctx, headSeg, cellWidth, cellHeight, dir, isDead) {
    const cx = headSeg.cx;
    const cy = headSeg.cy;
    const r = headSeg.r;

    // 1. Tongue flick (behind head)
    if (!isDead && this.tongueProgress > 0) {
      this.drawTongue(ctx, cx, cy, dir, r, cellWidth);
    }

    // 2. Head base circle
    ctx.fillStyle = isDead ? this.colors.deadHead : this.colors.head;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3. Rounded snout cap extending forward
    const snoutX = cx + dir.x * (r * 0.16);
    const snoutY = cy + dir.y * (r * 0.16);
    ctx.beginPath();
    ctx.arc(snoutX, snoutY, r * 0.96, 0, Math.PI * 2);
    ctx.fill();

    // 4. Nostrils
    if (!isDead) {
      this.drawNostrils(ctx, cx, cy, dir, r);
    }

    // 5. Eyes
    this.drawEyes(ctx, cx, cy, r, dir, isDead);
  }

  /**
   * Draw nostrils at snout tip
   */
  drawNostrils(ctx, cx, cy, dir, r) {
    const tipX = cx + dir.x * (r * 0.85);
    const tipY = cy + dir.y * (r * 0.85);
    const perpX = -dir.y * (r * 0.22);
    const perpY = dir.x * (r * 0.22);

    ctx.fillStyle = this.colors.nostrils || '#bfdbfe';
    ctx.beginPath();
    ctx.arc(tipX + perpX, tipY + perpY, 1.8, 0, Math.PI * 2);
    ctx.arc(tipX - perpX, tipY - perpY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw cartoon eyes on cheeks
   */
  drawEyes(ctx, cx, cy, r, dir, isDead) {
    const eyeRadius = r * 0.38;
    const pupilRadius = eyeRadius * 0.48;

    const perpX = -dir.y;
    const perpY = dir.x;

    const forwardOffset = r * 0.14;
    const sideOffset = r * 0.58;

    const eye1X = cx + dir.x * forwardOffset + perpX * sideOffset;
    const eye1Y = cy + dir.y * forwardOffset + perpY * sideOffset;
    const eye2X = cx + dir.x * forwardOffset - perpX * sideOffset;
    const eye2Y = cy + dir.y * forwardOffset - perpY * sideOffset;

    if (isDead) {
      ctx.strokeStyle = this.colors.deadEye;
      ctx.lineWidth = 2.5;
      this.drawCross(ctx, eye1X, eye1Y, eyeRadius);
      this.drawCross(ctx, eye2X, eye2Y, eyeRadius);
      return;
    }

    const eyeScaleY = 1.0 - this.blinkProgress * 0.85;

    ctx.save();
    // 1. Sclera (pure white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eye1X, eye1Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(eye2X, eye2Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Pupil (dark, shifted forward in direction of movement)
    if (eyeScaleY > 0.3) {
      ctx.fillStyle = this.colors.eye;
      const pShiftX = dir.x * (eyeRadius * 0.36);
      const pShiftY = dir.y * (eyeRadius * 0.36);

      ctx.beginPath();
      ctx.ellipse(eye1X + pShiftX, eye1Y + pShiftY, pupilRadius, pupilRadius * eyeScaleY, 0, 0, Math.PI * 2);
      ctx.ellipse(eye2X + pShiftX, eye2Y + pShiftY, pupilRadius, pupilRadius * eyeScaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Specular catchlight dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eye1X + pShiftX - pupilRadius * 0.35, eye1Y + pShiftY - pupilRadius * 0.35, 1.4, 0, Math.PI * 2);
      ctx.arc(eye2X + pShiftX - pupilRadius * 0.35, eye2Y + pShiftY - pupilRadius * 0.35, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw forked tongue
   */
  drawTongue(ctx, cx, cy, dir, r, cellWidth) {
    const extLength = (cellWidth * 0.55) * this.tongueProgress;
    const startX = cx + dir.x * (r * 1.05);
    const startY = cy + dir.y * (r * 1.05);
    const endX = startX + dir.x * extLength;
    const endY = startY + dir.y * extLength;

    const forkLen = 4 * this.tongueProgress;
    const forkWidth = 3.5 * this.tongueProgress;
    const perpX = -dir.y;
    const perpY = dir.x;

    ctx.strokeStyle = this.colors.tongue;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX + dir.x * forkLen + perpX * forkWidth, endY + dir.y * forkLen + perpY * forkWidth);
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + dir.x * forkLen - perpX * forkWidth, endY + dir.y * forkLen - perpY * forkWidth);
    ctx.stroke();
  }

  drawCross(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.7);
    ctx.lineTo(x + r * 0.7, y + r * 0.7);
    ctx.moveTo(x + r * 0.7, y - r * 0.7);
    ctx.lineTo(x - r * 0.7, y + r * 0.7);
    ctx.stroke();
  }
}

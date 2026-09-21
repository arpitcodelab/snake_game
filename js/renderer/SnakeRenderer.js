import { DIR } from '../utils/Constants.js';

/**
 * SnakeRenderer renders a lifelike, organic, continuous snake
 * with seamless tubular segments, tapering tail, 3D cylindrical shading,
 * animated flickering tongue, expressive blinking eyes, and death shock.
 */
export class SnakeRenderer {
  constructor() {
    this.colors = {
      head: '#4ecca3',
      body: '#45b28e',
      bodyHighlight: '#62e2b8',
      bodyShadow: '#2f8a6c',
      eye: '#12131a',
      eyePupil: '#ffffff',
      tongue: '#ff477e',
      deadHead: '#e94560',
      deadEye: '#ffffff'
    };

    // Animation states
    this.animTime = 0;
    this.tongueTimer = 0;
    this.isTongueOut = false;
    this.tongueProgress = 0; // 0 to 1

    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkProgress = 0; // 0 to 1
  }

  /**
   * Set colors based on active skin
   * @param {object} skin
   */
  setSkin(skin) {
    if (!skin) return;
    if (skin.head) this.colors.head = skin.head;
    if (skin.body) {
      this.colors.body = skin.body;
      this.colors.bodyHighlight = this.adjustColor(skin.body, 25);
      this.colors.bodyShadow = this.adjustColor(skin.body, -30);
    }
    if (skin.eye) this.colors.eye = skin.eye;
    if (skin.eyeWhite) this.colors.eyePupil = skin.eyeWhite;
  }

  /**
   * Helper to brighten or darken a hex color
   */
  adjustColor(hex, percent) {
    if (!hex || hex[0] !== '#') return hex;
    let num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Update animation timers
   * @param {number} deltaMs
   */
  updateAnimation(deltaMs = 16.67) {
    this.animTime += deltaMs;

    // 1. Tongue flick timer (flicks every ~2.8s for 320ms)
    this.tongueTimer += deltaMs;
    if (!this.isTongueOut && this.tongueTimer > 2800) {
      this.isTongueOut = true;
      this.tongueTimer = 0;
    }
    if (this.isTongueOut) {
      const flickDuration = 320;
      this.tongueProgress = Math.sin((this.tongueTimer / flickDuration) * Math.PI);
      if (this.tongueTimer >= flickDuration) {
        this.isTongueOut = false;
        this.tongueTimer = 0;
        this.tongueProgress = 0;
      }
    }

    // 2. Eye blink timer (blinks every ~3.5s for 150ms)
    this.blinkTimer += deltaMs;
    if (!this.isBlinking && this.blinkTimer > 3500) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      const blinkDuration = 150;
      this.blinkProgress = Math.sin((this.blinkTimer / blinkDuration) * Math.PI);
      if (this.blinkTimer >= blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkProgress = 0;
      }
    }
  }

  /**
   * Draw the realistic snake
   * @param {CanvasRenderingContext2D} ctx
   * @param {Snake} snake
   * @param {number} cellWidth
   * @param {number} cellHeight
   * @param {GameMode} [mode]
   * @param {number} [deltaMs]
   */
  draw(ctx, snake, cellWidth, cellHeight, mode = null, deltaMs = 16.67) {
    if (!snake || snake.body.length === 0) return;

    this.updateAnimation(deltaMs);

    const baseRadius = Math.min(cellWidth, cellHeight) * 0.44;
    const bodyLen = snake.body.length;
    const hasSecondHead = mode && typeof mode.hasSecondaryHead === 'function' && mode.hasSecondaryHead();

    // 1. Compute segment centers and tapering radii
    const segments = [];
    for (let i = 0; i < bodyLen; i++) {
      const seg = snake.body[i];
      const cx = (seg.x + 0.5) * cellWidth;
      const cy = (seg.y + 0.5) * cellHeight;

      // Smooth taper towards the tail (last 4 segments taper down to 45%)
      let taper = 1.0;
      if (!hasSecondHead && bodyLen > 3) {
        const fromTail = bodyLen - 1 - i;
        if (fromTail < 4) {
          taper = 0.45 + 0.55 * (fromTail / 4);
        }
      }

      segments.push({
        x: seg.x,
        y: seg.y,
        cx,
        cy,
        r: baseRadius * taper,
        index: i
      });
    }

    // 2. Draw continuous body from tail to head
    for (let i = bodyLen - 1; i >= 1; i--) {
      // Check Broken Snake mode gap
      if (mode && typeof mode.shouldRenderSegment === 'function') {
        if (!mode.shouldRenderSegment(i, bodyLen)) continue;
      }

      // If tail in Two-Headed mode, treat as second head
      if (i === bodyLen - 1 && hasSecondHead) continue;

      const curr = segments[i];
      const prev = segments[i - 1];

      // Check if adjacent (avoid drawing connection across board wrap in No Walls mode)
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const isAdjacent = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

      if (isAdjacent) {
        this.drawConnectingCapsule(ctx, curr, prev, snake.isDead);
      } else {
        // Draw standalone rounded segment at edge
        this.drawSegmentCircle(ctx, curr, snake.isDead);
      }
    }

    // 3. Draw primary head (segment 0)
    const headSeg = segments[0];
    this.drawHead(ctx, headSeg, cellWidth, cellHeight, snake.direction, snake.isDead, false);

    // 4. Draw secondary head if Two-Headed mode
    if (hasSecondHead && bodyLen > 1) {
      const tailSeg = segments[bodyLen - 1];
      const prevSeg = segments[bodyLen - 2];
      const secondDir = {
        x: tailSeg.x - prevSeg.x,
        y: tailSeg.y - prevSeg.y,
        name: (tailSeg.x > prevSeg.x ? 'RIGHT' : tailSeg.x < prevSeg.x ? 'LEFT' : tailSeg.y > prevSeg.y ? 'DOWN' : 'UP')
      };
      this.drawHead(ctx, tailSeg, cellWidth, cellHeight, secondDir, snake.isDead, true);
    }
  }

  /**
   * Draw seamless connected capsule between two adjacent segments
   */
  drawConnectingCapsule(ctx, segA, segB, isDead) {
    const angle = Math.atan2(segB.cy - segA.cy, segB.cx - segA.cx);
    const perp = angle + Math.PI / 2;

    const rA = segA.r;
    const rB = segB.r;

    const p1x = segA.cx + Math.cos(perp) * rA;
    const p1y = segA.cy + Math.sin(perp) * rA;
    const p2x = segB.cx + Math.cos(perp) * rB;
    const p2y = segB.cy + Math.sin(perp) * rB;
    const p3x = segB.cx - Math.cos(perp) * rB;
    const p3y = segB.cy - Math.sin(perp) * rB;
    const p4x = segA.cx - Math.cos(perp) * rA;
    const p4y = segA.cy - Math.sin(perp) * rA;

    // Body shading gradient across the segment tube
    const grad = ctx.createLinearGradient(p1x, p1y, p4x, p4y);
    const mainColor = isDead ? this.colors.deadHead : this.colors.body;
    const hiColor = isDead ? '#ff7675' : this.colors.bodyHighlight;
    const shColor = isDead ? '#c0392b' : this.colors.bodyShadow;

    grad.addColorStop(0, hiColor);
    grad.addColorStop(0.35, mainColor);
    grad.addColorStop(1, shColor);

    ctx.fillStyle = grad;

    // Connecting quad
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();
    ctx.fill();

    // Round joint circle at segA
    ctx.beginPath();
    ctx.arc(segA.cx, segA.cy, rA, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dorsal spine scale highlight line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = Math.max(1, rA * 0.18);
    ctx.beginPath();
    ctx.moveTo(segA.cx, segA.cy);
    ctx.lineTo(segB.cx, segB.cy);
    ctx.stroke();
  }

  /**
   * Draw standalone segment circle (e.g. edge wrap)
   */
  drawSegmentCircle(ctx, seg, isDead) {
    const mainColor = isDead ? this.colors.deadHead : this.colors.body;
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(seg.cx, seg.cy, seg.r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw head with rounded snout, flickering tongue, and blinking eyes
   */
  drawHead(ctx, headSeg, cellWidth, cellHeight, dir, isDead, isSecondary = false) {
    const cx = headSeg.cx;
    const cy = headSeg.cy;
    const r = headSeg.r * 1.05;

    // 1. Draw animated flickering tongue (behind head if moving, out in front)
    if (!isDead && this.tongueProgress > 0) {
      this.drawTongue(ctx, cx, cy, dir, r, cellWidth);
    }

    // 2. Draw head base with 3D gradient
    const snoutOffsetX = dir.x * (r * 0.35);
    const snoutOffsetY = dir.y * (r * 0.35);

    const grad = ctx.createRadialGradient(
      cx + snoutOffsetX - r * 0.2,
      cy + snoutOffsetY - r * 0.2,
      r * 0.1,
      cx,
      cy,
      r * 1.1
    );

    const headColor = isDead ? this.colors.deadHead : this.colors.head;
    const headHi = isDead ? '#ff7675' : this.colors.bodyHighlight;
    const headSh = isDead ? '#b32d3a' : this.colors.bodyShadow;

    grad.addColorStop(0, headHi);
    grad.addColorStop(0.5, headColor);
    grad.addColorStop(1, headSh);

    ctx.fillStyle = grad;

    // Snout shape: rounded bulb oriented forward
    ctx.beginPath();
    ctx.arc(cx + snoutOffsetX, cy + snoutOffsetY, r, 0, Math.PI * 2);
    ctx.fill();

    // Fill back connection circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // 3. Subtle nostrils at the tip of the snout
    if (!isDead) {
      this.drawNostrils(ctx, cx + snoutOffsetX, cy + snoutOffsetY, dir, r);
    }

    // 4. Expressive eyes with blinking animation
    this.drawEyes(ctx, cx, cy, r, dir, isDead);
  }

  /**
   * Draw animated forked tongue flicking out from snout
   */
  drawTongue(ctx, cx, cy, dir, r, cellWidth) {
    const extLength = (cellWidth * 0.65) * this.tongueProgress;
    const startX = cx + dir.x * (r * 1.1);
    const startY = cy + dir.y * (r * 1.1);
    const endX = startX + dir.x * extLength;
    const endY = startY + dir.y * extLength;

    // Tongue vibration/fork
    const forkLen = 5 * this.tongueProgress;
    const forkWidth = 4 * this.tongueProgress;
    const perpX = -dir.y;
    const perpY = dir.x;

    ctx.strokeStyle = this.colors.tongue;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main stem
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    // Left fork
    ctx.lineTo(endX + dir.x * forkLen + perpX * forkWidth, endY + dir.y * forkLen + perpY * forkWidth);
    // Right fork
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + dir.x * forkLen - perpX * forkWidth, endY + dir.y * forkLen - perpY * forkWidth);
    ctx.stroke();
  }

  /**
   * Draw nostrils on snout
   */
  drawNostrils(ctx, snoutX, snoutY, dir, r) {
    const tipX = snoutX + dir.x * (r * 0.7);
    const tipY = snoutY + dir.y * (r * 0.7);
    const perpX = -dir.y * (r * 0.22);
    const perpY = dir.x * (r * 0.22);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(tipX + perpX, tipY + perpY, 1.2, 0, Math.PI * 2);
    ctx.arc(tipX - perpX, tipY - perpY, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw expressive eyes with directional tracking, blinking, and death marks
   */
  drawEyes(ctx, cx, cy, r, dir, isDead) {
    const eyeRadius = r * 0.32;
    const pupilRadius = eyeRadius * 0.52;

    // Eye placement
    const frontOffset = r * 0.25;
    const sideOffset = r * 0.45;
    const perpX = -dir.y;
    const perpY = dir.x;

    const eye1X = cx + dir.x * frontOffset + perpX * sideOffset;
    const eye1Y = cy + dir.y * frontOffset + perpY * sideOffset;
    const eye2X = cx + dir.x * frontOffset - perpX * sideOffset;
    const eye2Y = cy + dir.y * frontOffset - perpY * sideOffset;

    if (isDead) {
      // Draw dizzy X-eyes
      ctx.strokeStyle = this.colors.deadEye;
      ctx.lineWidth = 2.5;
      this.drawCross(ctx, eye1X, eye1Y, eyeRadius);
      this.drawCross(ctx, eye2X, eye2Y, eyeRadius);
      return;
    }

    // Blinking animation: scales eyes vertically based on blinkProgress
    const eyeScaleY = 1.0 - this.blinkProgress * 0.85;

    ctx.save();

    // 1. Sclera (eye white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eye1X, eye1Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(eye2X, eye2Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Eye shadow / ring for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // If mostly closed, don't draw pupils
    if (eyeScaleY > 0.3) {
      // 3. Pupils (dilated forward in movement direction)
      ctx.fillStyle = this.colors.eye;
      const pupilShiftX = dir.x * (eyeRadius * 0.38);
      const pupilShiftY = dir.y * (eyeRadius * 0.38);

      ctx.beginPath();
      ctx.ellipse(eye1X + pupilShiftX, eye1Y + pupilShiftY, pupilRadius, pupilRadius * eyeScaleY, 0, 0, Math.PI * 2);
      ctx.ellipse(eye2X + pupilShiftX, eye2Y + pupilShiftY, pupilRadius, pupilRadius * eyeScaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. White specular catchlight glint
      ctx.fillStyle = '#ffffff';
      const glintOffset = pupilRadius * 0.4;
      ctx.beginPath();
      ctx.arc(eye1X + pupilShiftX - glintOffset, eye1Y + pupilShiftY - glintOffset, 1.4, 0, Math.PI * 2);
      ctx.arc(eye2X + pupilShiftX - glintOffset, eye2Y + pupilShiftY - glintOffset, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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

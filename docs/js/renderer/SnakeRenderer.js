import { DIR } from '../utils/Constants.js';
import { performanceMonitor, QUALITY_TIER } from '../systems/PerformanceMonitor.js';

/**
 * SnakeRenderer — Smooth, organic snake with Catmull-Rom spline curves.
 *
 * Instead of drawing individual grid-cell circles, the snake's center-line is
 * interpolated through a Catmull-Rom spline, producing fluid curves at every
 * turn. The body is rendered as a filled ribbon that tapers from head to tail,
 * with 3D cylindrical shading, specular highlights, and a glowing energy spine.
 *
 * Premium effects:
 *   - Catmull-Rom spline through segment centers for silk-smooth curves
 *   - Tapered width: thick head → thin tail
 *   - 3D cylindrical gradient fill with specular crest
 *   - Soft drop shadow for 2.5D depth
 *   - Emissive spinal energy line with bloom
 *   - Cybernetic visor head with animated optics & tongue
 *   - Subtle energy trail particles
 */
export class SnakeRenderer {
  constructor() {
    this.colors = {
      head: '#00f2fe',
      headDark: '#0072ff',
      body: '#00c6ff',
      bodyDark: '#004db3',
      spine: '#00f2fe',
      rimCyan: '#00f2fe',
      rimMagenta: 'rgba(217, 70, 239, 0.35)',
      eye: '#ffffff',
      pupil: '#00f2fe',
      deadHead: '#ff0844',
      deadEye: '#ffffff',
      tongue: '#00f2fe'
    };

    this.animTime = 0;
    this.tongueTimer = 0;
    this.isTongueOut = false;
    this.tongueProgress = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkProgress = 0;
    this.trailTimer = 0;
  }

  setSkin(skin) {
    if (!skin) return;
    if (skin.head) this.colors.head = skin.head;
    if (skin.headDark) this.colors.headDark = skin.headDark;
    if (skin.body) {
      this.colors.body = skin.body;
      this.colors.spine = skin.spine || skin.head || skin.body;
    }
    if (skin.bodyDark) this.colors.bodyDark = skin.bodyDark;
    if (skin.crest) this.colors.crest = skin.crest;
    if (skin.contour) this.colors.contour = skin.contour;
    if (skin.eye) this.colors.pupil = skin.eye;
    if (skin.eyeWhite) this.colors.eye = skin.eyeWhite;
    if (skin.tongue) this.colors.tongue = skin.tongue;
  }

  updateAnimation(deltaMs = 16.67) {
    this.animTime += deltaMs;

    this.tongueTimer += deltaMs;
    if (!this.isTongueOut && this.tongueTimer > 3200) {
      this.isTongueOut = true;
      this.tongueTimer = 0;
    }
    if (this.isTongueOut) {
      const flickDur = 280;
      this.tongueProgress = Math.sin((this.tongueTimer / flickDur) * Math.PI);
      if (this.tongueTimer >= flickDur) {
        this.isTongueOut = false;
        this.tongueTimer = 0;
        this.tongueProgress = 0;
      }
    }

    this.blinkTimer += deltaMs;
    if (!this.isBlinking && this.blinkTimer > 3500) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      const blinkDur = 140;
      this.blinkProgress = Math.sin((this.blinkTimer / blinkDur) * Math.PI);
      if (this.blinkTimer >= blinkDur) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkProgress = 0;
      }
    }
  }

  // ================================================================
  // Catmull-Rom spline utilities
  // ================================================================

  /**
   * Evaluate Catmull-Rom spline at parameter t ∈ [0,1] given 4 control points.
   */
  catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: 0.5 * ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  }

  /**
   * Build a densely-sampled spline from the segment center points.
   * Returns an array of {x, y, t} where t ∈ [0, 1] is the normalized
   * position along the entire snake (0 = head, 1 = tail).
   *
   * Only adjacent segments (distance ≤ 1 grid cell apart) are splined;
   * teleport gaps are bridged with straight jumps.
   */
  buildSpline(segments, samplesPerSegment = 8) {
    const n = segments.length;
    if (n === 0) return [];
    if (n === 1) return [{ x: segments[0].cx, y: segments[0].cy, t: 0 }];

    const points = [];

    for (let i = 0; i < n - 1; i++) {
      const curr = segments[i];
      const next = segments[i + 1];
      const isAdj = Math.abs(curr.x - next.x) <= 1 && Math.abs(curr.y - next.y) <= 1;

      if (!isAdj) {
        // Teleport gap — just add the current point
        points.push({ x: curr.cx, y: curr.cy, segIdx: i });
        continue;
      }

      // 4 control points for Catmull-Rom: p0, p1(=curr), p2(=next), p3
      const p1 = { x: curr.cx, y: curr.cy };
      const p2 = { x: next.cx, y: next.cy };

      let p0;
      if (i > 0) {
        const prev = segments[i - 1];
        const prevAdj = Math.abs(prev.x - curr.x) <= 1 && Math.abs(prev.y - curr.y) <= 1;
        p0 = prevAdj ? { x: prev.cx, y: prev.cy } : { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
      } else {
        // Extrapolate before head
        p0 = { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
      }

      let p3;
      if (i + 2 < n) {
        const after = segments[i + 2];
        const afterAdj = Math.abs(next.x - after.x) <= 1 && Math.abs(next.y - after.y) <= 1;
        p3 = afterAdj ? { x: after.cx, y: after.cy } : { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
      } else {
        p3 = { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
      }

      const steps = samplesPerSegment;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const pt = this.catmullRom(p0, p1, p2, p3, t);
        pt.segIdx = i + t;
        points.push(pt);
      }
    }

    // Add the final tail point
    const last = segments[n - 1];
    points.push({ x: last.cx, y: last.cy, segIdx: n - 1 });

    // Normalize t ∈ [0, 1]
    const totalPts = points.length;
    for (let i = 0; i < totalPts; i++) {
      points[i].t = i / (totalPts - 1);
    }

    return points;
  }

  /**
   * Get width at normalized position t (0=head, 1=tail).
   * Starts thick, tapers smoothly to a point at the tail.
   */
  getWidth(t, baseRadius) {
    // Smooth taper: head is full width, tail narrows to 30%
    const headRegion = t < 0.08 ? 1.0 + 0.15 * Math.sin((t / 0.08) * Math.PI) : 1.0;
    const taper = 1.0 - t * 0.7;
    // Ease the taper with a subtle curve
    const eased = taper * taper * (3 - 2 * taper); // smoothstep-like
    return baseRadius * eased * headRegion;
  }

  // ================================================================
  // Main draw
  // ================================================================

  draw(ctx, snake, cellWidth, cellHeight, mode = null, deltaMs = 16.67, offsetX = 0, offsetY = 0, particleSystem = null) {
    if (!snake || snake.body.length === 0) return;

    this.updateAnimation(deltaMs);

    const radius = Math.min(cellWidth, cellHeight) * 0.44;
    const bodyLen = snake.body.length;
    const hasSecondHead = mode && typeof mode.hasSecondaryHead === 'function' && mode.hasSecondaryHead();

    // Calculate segment screen coordinates
    const segments = [];
    for (let i = 0; i < bodyLen; i++) {
      const seg = snake.body[i];
      const cx = offsetX + (seg.x + 0.5) * cellWidth;
      const cy = offsetY + (seg.y + 0.5) * cellHeight;
      segments.push({ x: seg.x, y: seg.y, cx, cy, r: radius, index: i });
    }

    // Energy trail particles
    if (particleSystem && !snake.isDead) {
      this.trailTimer += deltaMs;
      if (this.trailTimer > 120) {
        this.trailTimer = 0;
        const tail = segments[bodyLen - 1];
        particleSystem.spawnFruitBurst(tail.cx, tail.cy, this.colors.spine, 1);
      }
    }

    ctx.save();

    // Build the smooth spline
    const tier = performanceMonitor.getTier();
    const samplesPerSeg = tier === QUALITY_TIER.LOW ? 4 : (tier === QUALITY_TIER.HIGH ? 10 : 6);
    const spline = this.buildSpline(segments, samplesPerSeg);

    if (spline.length < 2) {
      // Single segment fallback
      this.drawShadedCircle(ctx, segments[0].cx, segments[0].cy, radius, snake.isDead);
      this.drawCyberHead(ctx, segments[0], cellWidth, cellHeight, snake.direction, snake.isDead);
      ctx.restore();
      return;
    }

    // Compute normals and widths for each spline point
    const splineData = [];
    for (let i = 0; i < spline.length; i++) {
      const pt = spline[i];
      let dx, dy;
      if (i === 0) {
        dx = spline[1].x - pt.x;
        dy = spline[1].y - pt.y;
      } else if (i === spline.length - 1) {
        dx = pt.x - spline[i - 1].x;
        dy = pt.y - spline[i - 1].y;
      } else {
        dx = spline[i + 1].x - spline[i - 1].x;
        dy = spline[i + 1].y - spline[i - 1].y;
      }
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len; // perpendicular normal
      const ny = dx / len;
      const w = this.getWidth(pt.t, radius);

      splineData.push({ x: pt.x, y: pt.y, nx, ny, w, t: pt.t, dirX: dx / len, dirY: dy / len });
    }

    // ========================================
    // 1. DROP SHADOW
    // ========================================
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
    ctx.beginPath();
    const shOx = 3, shOy = 5;
    // Left edge
    for (let i = 0; i < splineData.length; i++) {
      const d = splineData[i];
      const x = d.x + shOx + d.nx * d.w * 0.85;
      const y = d.y + shOy + d.ny * d.w * 0.85;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Right edge (reverse)
    for (let i = splineData.length - 1; i >= 0; i--) {
      const d = splineData[i];
      const x = d.x + shOx - d.nx * d.w * 0.85;
      const y = d.y + shOy - d.ny * d.w * 0.85;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ========================================
    // 2. MAIN BODY — 3D Cylindrical Fill
    // ========================================
    // We draw multiple layers for the 3D effect:
    // Layer 1: Dark base fill
    // Layer 2: Main gradient body
    // Layer 3: Specular highlight crest
    // Layer 4: Rim light

    // --- Layer 1: Outer body shape (dark base) ---
    this.drawBodyRibbon(ctx, splineData, 1.0, snake.isDead ? '#7f1d1d' : (this.colors.contour || '#0369a1'), null, 'fill');

    // --- Layer 2: Inner gradient body ---
    {
      const innerScale = 0.92;
      // Build gradient across the body — simulate cylindrical lighting
      // We use a multi-stop radial approach per-slice; for performance,
      // just do a solid color with overlay layers.

      if (snake.isDead) {
        this.drawBodyRibbon(ctx, splineData, innerScale, null, '#dc2626', 'fill');
        // Darker upper rim
        this.drawBodyRibbon(ctx, splineData, innerScale * 0.5, null, '#ff4757', 'fill');
      } else {
        // Main body color
        this.drawBodyRibbon(ctx, splineData, innerScale, null, this.colors.body || '#00c6ff', 'fill');

        // Lighter crest (top highlight) — thinner ribbon offset toward one side
        ctx.save();
        ctx.globalAlpha = 0.6;
        this.drawBodyRibbon(ctx, splineData, innerScale * 0.45, null, this.colors.crest || '#a5f3fc', 'fill', 0.3);
        ctx.restore();

        // Specular white highlight — very thin ribbon
        ctx.save();
        ctx.globalAlpha = 0.45;
        this.drawBodyRibbon(ctx, splineData, innerScale * 0.18, null, '#ffffff', 'fill', 0.35);
        ctx.restore();

        // Dark underside rim
        ctx.save();
        ctx.globalAlpha = 0.35;
        this.drawBodyRibbon(ctx, splineData, innerScale * 0.4, null, this.colors.headDark || '#0072ff', 'fill', -0.4);
        ctx.restore();
      }
    }

    // --- Layer 3: Outer contour stroke ---
    ctx.save();
    ctx.strokeStyle = snake.isDead ? '#7f1d1d' : (this.colors.contour || '#0369a1');
    ctx.lineWidth = 1.4;
    this.drawBodyRibbon(ctx, splineData, 1.0, null, null, 'stroke');
    ctx.restore();

    // ========================================
    // 3. EMISSIVE SPINAL ENERGY LINE
    // ========================================
    if (!snake.isDead) {
      const pulse = 0.5 + 0.5 * Math.sin(this.animTime * 0.004);
      ctx.save();
      if (tier === QUALITY_TIER.HIGH) {
        ctx.shadowColor = this.colors.spine;
        ctx.shadowBlur = 6;
      }
      ctx.strokeStyle = this.colors.spine;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.5 + pulse * 0.3;

      ctx.beginPath();
      for (let i = 0; i < splineData.length; i++) {
        const d = splineData[i];
        if (i === 0) ctx.moveTo(d.x, d.y);
        else ctx.lineTo(d.x, d.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ========================================
    // 4. SCALES PATTERN (subtle, high quality only)
    // ========================================
    if (!snake.isDead && tier === QUALITY_TIER.HIGH) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = this.colors.headDark || '#004db3';
      ctx.lineWidth = 0.8;

      // Draw subtle scale arcs every few spline points
      for (let i = 4; i < splineData.length - 2; i += 3) {
        const d = splineData[i];
        const w = d.w * 0.85;
        ctx.beginPath();
        const arcAngle = Math.atan2(d.dirY, d.dirX);
        ctx.arc(d.x, d.y, w, arcAngle - Math.PI * 0.4, arcAngle + Math.PI * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ========================================
    // 5. HEAD
    // ========================================
    this.drawCyberHead(ctx, segments[0], cellWidth, cellHeight, snake.direction, snake.isDead);

    // Secondary head (Two-Headed mode)
    if (hasSecondHead && bodyLen > 1) {
      const tail = segments[bodyLen - 1];
      const prev = segments[bodyLen - 2];
      const secondDir = {
        x: tail.x - prev.x,
        y: tail.y - prev.y,
        name: (tail.x > prev.x ? 'RIGHT' : tail.x < prev.x ? 'LEFT' : tail.y > prev.y ? 'DOWN' : 'UP')
      };
      this.drawCyberHead(ctx, tail, cellWidth, cellHeight, secondDir, snake.isDead);
    }

    ctx.restore();
  }

  /**
   * Draw the body as a smooth ribbon shape from spline data.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} splineData - Array of {x, y, nx, ny, w, t}
   * @param {number} widthScale - Multiplier on the width (1.0 = full)
   * @param {string|null} strokeColor - If set, stroke instead of fill
   * @param {string|null} fillColor - If set, fill color
   * @param {'fill'|'stroke'} drawMode
   * @param {number} normalBias - Offset the ribbon center toward one side (-1 to 1)
   */
  drawBodyRibbon(ctx, splineData, widthScale = 1.0, strokeColor = null, fillColor = null, drawMode = 'fill', normalBias = 0) {
    if (splineData.length < 2) return;

    ctx.beginPath();

    // Left edge (head to tail)
    for (let i = 0; i < splineData.length; i++) {
      const d = splineData[i];
      const biasOff = d.w * normalBias;
      const x = d.x + d.nx * (d.w * widthScale + biasOff);
      const y = d.y + d.ny * (d.w * widthScale + biasOff);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Tail cap (rounded)
    const tailPt = splineData[splineData.length - 1];
    const tailW = tailPt.w * widthScale;
    const tailAngle = Math.atan2(tailPt.dirY, tailPt.dirX);
    ctx.arc(tailPt.x + tailPt.nx * tailW * normalBias, tailPt.y + tailPt.ny * tailW * normalBias,
      tailW, tailAngle - Math.PI / 2, tailAngle + Math.PI / 2);

    // Right edge (tail to head)
    for (let i = splineData.length - 1; i >= 0; i--) {
      const d = splineData[i];
      const biasOff = d.w * normalBias;
      const x = d.x - d.nx * (d.w * widthScale - biasOff);
      const y = d.y - d.ny * (d.w * widthScale - biasOff);
      ctx.lineTo(x, y);
    }

    // Head cap (rounded)
    const headPt = splineData[0];
    const headW = headPt.w * widthScale;
    const headAngle = Math.atan2(headPt.dirY, headPt.dirX);
    ctx.arc(headPt.x - headPt.nx * headW * normalBias, headPt.y - headPt.ny * headW * normalBias,
      headW, headAngle + Math.PI / 2, headAngle - Math.PI / 2);

    ctx.closePath();

    if (drawMode === 'fill') {
      if (fillColor) ctx.fillStyle = fillColor;
      ctx.fill();
    } else {
      if (strokeColor) ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }

  // ================================================================
  // Head rendering
  // ================================================================

  drawCyberHead(ctx, headSeg, cellWidth, cellHeight, dir, isDead) {
    const cx = headSeg.cx;
    const cy = headSeg.cy;
    const r = headSeg.r;

    // Energy tongue flick
    if (!isDead && this.tongueProgress > 0) {
      this.drawEnergyTongue(ctx, cx, cy, dir, r, cellWidth);
    }

    // Head base — slightly larger, shaded circle
    this.drawShadedCircle(ctx, cx, cy, r * 1.05, isDead);

    // Extended snout
    const snoutX = cx + dir.x * (r * 0.28);
    const snoutY = cy + dir.y * (r * 0.28);
    this.drawShadedCircle(ctx, snoutX, snoutY, r * 0.88, isDead);

    // Cybernetic eyes
    this.drawCyberOptics(ctx, cx, cy, r, dir, isDead);
  }

  drawShadedCircle(ctx, cx, cy, r, isDead) {
    const grad = ctx.createRadialGradient(
      cx - r * 0.35, cy - r * 0.35, r * 0.1,
      cx, cy, r
    );

    if (isDead) {
      grad.addColorStop(0, '#ff4757');
      grad.addColorStop(0.7, '#dc2626');
      grad.addColorStop(1, '#991b1b');
    } else {
      grad.addColorStop(0, this.colors.crest || '#a5f3fc');
      grad.addColorStop(0.35, this.colors.head);
      grad.addColorStop(0.75, this.colors.body);
      grad.addColorStop(1, this.colors.headDark || '#0072ff');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Contour
    ctx.strokeStyle = isDead ? '#7f1d1d' : (this.colors.contour || '#0369a1');
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Specular gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.30, cy - r * 0.30, r * 0.20, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCyberOptics(ctx, cx, cy, r, dir, isDead) {
    const eyeRadius = r * 0.38;
    const perpX = -dir.y;
    const perpY = dir.x;
    const forwardOffset = r * 0.16;
    const sideOffset = r * 0.56;

    const eye1X = cx + dir.x * forwardOffset + perpX * sideOffset;
    const eye1Y = cy + dir.y * forwardOffset + perpY * sideOffset;
    const eye2X = cx + dir.x * forwardOffset - perpX * sideOffset;
    const eye2Y = cy + dir.y * forwardOffset - perpY * sideOffset;

    const tier = performanceMonitor.getTier();

    if (isDead) {
      ctx.strokeStyle = '#ff0844';
      ctx.lineWidth = 2.5;
      if (tier !== QUALITY_TIER.LOW) {
        ctx.shadowColor = '#ff0844';
        ctx.shadowBlur = 8;
      }
      this.drawCross(ctx, eye1X, eye1Y, eyeRadius);
      this.drawCross(ctx, eye2X, eye2Y, eyeRadius);
      ctx.shadowBlur = 0;
      return;
    }

    const eyeScaleY = 1.0 - this.blinkProgress * 0.88;

    // Dark visor housing
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.ellipse(eye1X, eye1Y, eyeRadius * 1.15, eyeRadius * 1.15 * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(eye2X, eye2Y, eyeRadius * 1.15, eyeRadius * 1.15 * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing lens
    if (tier !== QUALITY_TIER.LOW) {
      ctx.shadowColor = this.colors.pupil || '#00f2fe';
      ctx.shadowBlur = 6;
    }
    ctx.fillStyle = this.colors.eye || '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eye1X, eye1Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(eye2X, eye2Y, eyeRadius, eyeRadius * eyeScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    if (eyeScaleY > 0.3) {
      ctx.fillStyle = this.colors.pupil || '#00f2fe';
      const pShiftX = dir.x * (eyeRadius * 0.35);
      const pShiftY = dir.y * (eyeRadius * 0.35);

      ctx.beginPath();
      ctx.arc(eye1X + pShiftX, eye1Y + pShiftY, eyeRadius * 0.48, 0, Math.PI * 2);
      ctx.arc(eye2X + pShiftX, eye2Y + pShiftY, eyeRadius * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // Specular dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eye1X + pShiftX - eyeRadius * 0.16, eye1Y + pShiftY - eyeRadius * 0.16, 1.3, 0, Math.PI * 2);
      ctx.arc(eye2X + pShiftX - eyeRadius * 0.16, eye2Y + pShiftY - eyeRadius * 0.16, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  drawEnergyTongue(ctx, cx, cy, dir, r, cellWidth) {
    const extLength = (cellWidth * 0.58) * this.tongueProgress;
    const startX = cx + dir.x * (r * 1.05);
    const startY = cy + dir.y * (r * 1.05);
    const endX = startX + dir.x * extLength;
    const endY = startY + dir.y * extLength;

    const forkLen = 4.5 * this.tongueProgress;
    const forkWidth = 4 * this.tongueProgress;
    const perpX = -dir.y;
    const perpY = dir.x;

    const tier = performanceMonitor.getTier();
    const tongueColor = this.colors.tongue || '#00f2fe';
    if (tier !== QUALITY_TIER.LOW) {
      ctx.shadowColor = tongueColor;
      ctx.shadowBlur = 6;
    }
    ctx.strokeStyle = tongueColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX + dir.x * forkLen + perpX * forkWidth, endY + dir.y * forkLen + perpY * forkWidth);
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + dir.x * forkLen - perpX * forkWidth, endY + dir.y * forkLen - perpY * forkWidth);
    ctx.stroke();
    ctx.shadowBlur = 0;
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

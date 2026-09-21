import { performanceMonitor, QUALITY_TIER } from '../systems/PerformanceMonitor.js';
import { assetLoader } from '../utils/AssetLoader.js';

/**
 * FoodRenderer renders Targets / Pellets / Ghosts as premium celestial planets from planet.png:
 * - 24 distinct celestial bodies (Earth-like, Saturn rings, Ice, Magma, Emerald, and Solar Star)
 * - Atmospheric rim glow and rotating celestial orbital data rings
 * - Soft elliptical drop shadow cast onto the space arena floor
 * - Pulsing solar corona flare for golden power targets
 */
export class FoodRenderer {
  constructor() {
    // Preload celestial planets sprite sheet
    assetLoader.load('planet', 'assets/images/planet.png');

    this.colorMap = {
      apple: {
        core: '#ff0844',
        mid: 'rgba(255, 71, 87, 0.75)',
        glow: '#00f2fe',
        ring: '#00f2fe',
        eye: '#ffffff'
      },
      banana: {
        core: '#ffd700',
        mid: 'rgba(255, 165, 2, 0.75)',
        glow: '#ffd700',
        ring: '#ffa502',
        eye: '#ffffff'
      },
      cherry: {
        core: '#ff0055',
        mid: 'rgba(232, 65, 24, 0.75)',
        glow: '#ff0055',
        ring: '#ff3366',
        eye: '#ffffff'
      },
      strawberry: {
        core: '#d946ef',
        mid: 'rgba(255, 107, 129, 0.75)',
        glow: '#d946ef',
        ring: '#f43f5e',
        eye: '#ffffff'
      },
      golden: {
        core: '#ffd700',
        mid: 'rgba(0, 242, 254, 0.85)',
        glow: '#00f2fe',
        ring: '#ffd700',
        eye: '#ffffff'
      }
    };
  }

  /**
   * Draw all active holographic digital entities
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
    const baseRadius = Math.min(cellWidth, cellHeight) * 0.38;

    const planetReady = assetLoader.isReady('planet');
    const planetImg = planetReady ? assetLoader.get('planet') : null;

    for (const food of foodItems) {
      const type = food.type || 'apple';
      const colors = this.colorMap[type] || this.colorMap.apple;

      // Unique hover oscillation phase based on grid coordinates
      const phase = (food.x * 17 + food.y * 31);
      const hoverOffset = Math.sin(now * 0.004 + phase) * 3.5;
      const pulseScale = 1.0 + Math.sin(now * 0.006 + phase) * 0.04;
      const rotAngle = (now * 0.0018 + phase * 0.1) % (Math.PI * 2);

      const centerX = offsetX + (food.x + 0.5) * cellWidth;
      const centerY = offsetY + (food.y + 0.5) * cellHeight + hoverOffset;
      const shadowY = offsetY + (food.y + 0.5) * cellHeight + cellHeight * 0.32;
      const r = baseRadius * pulseScale;

      ctx.save();

      // ============================================================
      // 1. SOFT FLOOR DROP SHADOW (Holographic Levitation)
      // ============================================================
      const shadowScale = 1.0 - (hoverOffset / 14);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(centerX, shadowY, cellWidth * 0.32 * shadowScale, cellHeight * 0.12 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      const tier = performanceMonitor.getTier();

      // Golden fruit expiration urgency
      if (food.isGolden) {
        if (food.timer < 1500) {
          const flash = Math.floor(now / 120) % 2 === 0;
          if (flash) ctx.globalAlpha = 0.4;
        }
      }

      // ============================================================
      // 2. CELESTIAL PLANET SPRITE (From planet.png)
      // ============================================================
      if (planetReady && planetImg) {
        const planetIndex = food.isGolden ? 18 : (food.planetIndex ?? 0);
        const col = planetIndex % 6;
        const row = Math.floor(planetIndex / 6);
        const sx = col * 256;
        const sy = row * 256;
        const planetDiameter = Math.min(cellWidth, cellHeight) * 0.94 * pulseScale;

        // Golden Solar Star: Pulsing golden corona flare
        if (food.isGolden) {
          const coronaGrad = ctx.createRadialGradient(
            centerX, centerY, planetDiameter * 0.2,
            centerX, centerY, planetDiameter * 0.78
          );
          coronaGrad.addColorStop(0, 'rgba(255, 220, 50, 0.55)');
          coronaGrad.addColorStop(0.4, 'rgba(255, 140, 0, 0.25)');
          coronaGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
          ctx.fillStyle = coronaGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, planetDiameter * 0.78, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw sliced celestial planet sprite
        ctx.drawImage(
          planetImg,
          sx, sy, 256, 256,
          centerX - planetDiameter / 2,
          centerY - planetDiameter / 2,
          planetDiameter,
          planetDiameter
        );

        // Orbiting celestial ring
        ctx.save();
        ctx.strokeStyle = food.isGolden ? 'rgba(255, 215, 0, 0.85)' : 'rgba(0, 242, 254, 0.65)';
        ctx.lineWidth = 1.3;
        if (tier === QUALITY_TIER.HIGH) {
          ctx.shadowColor = food.isGolden ? '#ffd700' : '#00f2fe';
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, planetDiameter * 0.68, planetDiameter * 0.22, rotAngle, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Countdown ring for golden target
        if (food.isGolden && food.duration > 0) {
          const progress = Math.max(0, food.timer / food.duration);
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, planetDiameter * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
          ctx.stroke();
        }

        // Orbiting stardust micro-particles
        const particleCount = food.isGolden ? 4 : 2;
        ctx.fillStyle = food.isGolden ? '#ffd700' : '#ffffff';
        for (let i = 0; i < particleCount; i++) {
          const pAngle = rotAngle + (i * Math.PI * 2 / particleCount);
          const px = centerX + Math.cos(pAngle) * (planetDiameter * 0.68);
          const py = centerY + Math.sin(pAngle) * (planetDiameter * 0.22);
          ctx.beginPath();
          ctx.arc(px, py, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        continue;
      }

      // ============================================================
      // PROCEDURAL FALLBACK (When planet.png is loading or in headless tests)
      // ============================================================
      // Countdown holographic ring timer for golden fruit
      if (food.isGolden && food.duration > 0) {
        const progress = Math.max(0, food.timer / food.duration);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        if (tier !== QUALITY_TIER.LOW) {
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Orbital holographic data ring
      ctx.strokeStyle = colors.ring;
      ctx.lineWidth = 1.4;
      if (tier === QUALITY_TIER.HIGH) {
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, r * 1.32, r * 0.45, rotAngle, 0, Math.PI * 2);
      ctx.stroke();
      if (tier === QUALITY_TIER.HIGH) {
        ctx.shadowBlur = 0;
      }

      // Translucent / glossy plasma core
      const coreGrad = ctx.createRadialGradient(
        centerX - r * 0.3, centerY - r * 0.3, r * 0.05,
        centerX, centerY, r
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, colors.core);
      coreGrad.addColorStop(0.75, colors.mid);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      // Spherical rim lighting
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * 0.96, Math.PI * 0.75, Math.PI * 1.75);
      ctx.stroke();

      // Cybernetic eyes
      const eyeR = r * 0.22;
      const eyeOffset = r * 0.36;
      const eyeY = centerY - r * 0.08;

      if (tier !== QUALITY_TIER.LOW) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
      }
      ctx.fillStyle = colors.eye;
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.core;
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset + 0.8, eyeY + 0.8, eyeR * 0.5, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset + 0.8, eyeY + 0.8, eyeR * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting micro-particles
      const particleCount = food.isGolden ? 4 : 2;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < particleCount; i++) {
        const pAngle = rotAngle + (i * Math.PI * 2 / particleCount);
        const px = centerX + Math.cos(pAngle) * (r * 1.3);
        const py = centerY + Math.sin(pAngle) * (r * 0.45);
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

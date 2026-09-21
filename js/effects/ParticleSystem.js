import { Particle } from './Particle.js';
import { performanceMonitor, QUALITY_TIER } from '../systems/PerformanceMonitor.js';
import { bus } from '../core/EventBus.js';

/**
 * ParticleSystem manages juicy fruit bursts and floating score indicators.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.motes = [];
    this.maxParticles = 60; // Cap to prevent memory bloat
    this.syncQualityTier(performanceMonitor.getTier());

    bus.on('quality:changed', ({ tier }) => {
      this.syncQualityTier(tier);
    });
  }

  syncQualityTier(tier) {
    if (tier === QUALITY_TIER.LOW) {
      this.motes = [];
    } else if (tier === QUALITY_TIER.MEDIUM) {
      if (this.motes.length !== 8) {
        this.initMotes(8);
      }
    } else {
      if (this.motes.length !== 20) {
        this.initMotes(20);
      }
    }
  }

  initMotes(count = 20) {
    this.motes = [];
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: Math.random() * 660,
        y: Math.random() * 592,
        vx: (Math.random() - 0.5) * 8,
        vy: -8 - Math.random() * 12, // Gentle upward drift
        size: 1.0 + Math.random() * 1.2,
        baseAlpha: 0.06 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Spawn soft fruit burst when food is eaten
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} count
   */
  spawnFruitBurst(x, y, color = '#ff4757', count = 12) {
    const tier = performanceMonitor.getTier();
    let actualCount = count;
    if (tier === QUALITY_TIER.LOW) {
      actualCount = Math.min(count, 6);
    } else if (tier === QUALITY_TIER.MEDIUM) {
      actualCount = Math.min(count, 10);
    }

    for (let i = 0; i < actualCount; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 2.5;
      const life = 0.35 + Math.random() * 0.25;

      const p = new Particle(x, y, vx, vy, color, size, life, 'drop');
      this.particles.push(p);
    }
  }

  /**
   * Spawn gentle floating score
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   */
  spawnFloatingScore(text, x, y, color = '#ffffff') {
    const p = new Particle(x, y, 0, -45, color, 14, 0.7, 'text');
    p.text = text;
    this.particles.push(p);
  }

  /**
   * Update particles
   * @param {number} deltaSec
   */
  update(deltaSec = 0.016) {
    // 1. Update event particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(deltaSec);
      if (p.isDead) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Update atmospheric ambient motes
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      m.y += m.vy * deltaSec;
      m.x += (m.vx + Math.sin(m.phase) * 3) * deltaSec;
      m.phase += deltaSec * 1.5;

      // Wrap around arena bounds
      if (m.y < 26) m.y = 592 - 26;
      if (m.y > 592 - 26) m.y = 26;
      if (m.x < 24) m.x = 660 - 24;
      if (m.x > 660 - 24) m.x = 24;
    }
  }

  /**
   * Render particles and atmospheric motes
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // 1. Draw subtle atmospheric motes
    ctx.save();
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      const pulseAlpha = m.baseAlpha * (0.8 + Math.sin(m.phase) * 0.2);
      ctx.fillStyle = `rgba(0, 242, 254, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Draw event particles (bursts and floating scores)
    if (this.particles.length > 0) {
      for (const p of this.particles) {
        p.draw(ctx);
      }
    }
  }

  reset() {
    this.particles = [];
  }
}

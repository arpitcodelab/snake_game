import { Particle, FloatingText } from './Particle.js';

/**
 * ParticleSystem coordinates particle bursts and floating score text
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  /**
   * Spawn a radial explosion of particles when fruit is eaten
   * @param {number} x - Pixel center x
   * @param {number} y - Pixel center y
   * @param {string} color - Primary color of fruit
   * @param {number} count - Number of particles
   */
  spawnFruitBurst(x, y, color = '#ff4757', count = 16) {
    const palette = [color, '#ffffff', '#ffd700'];

    for (let i = 0; i < count; i++) {
      const pColor = palette[Math.floor(Math.random() * palette.length)];
      const speed = Math.random() * 120 + 40;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3.5 + 1.5;
      const decay = Math.random() * 1.6 + 1.2;

      this.particles.push(
        new Particle(x, y, pColor, {
          speed,
          angle,
          radius,
          decay,
          gravity: 80
        })
      );
    }
  }

  /**
   * Spawn floating score popup
   * @param {string} text - E.g. "+1", "+3", "+10"
   * @param {number} x - Pixel center x
   * @param {number} y - Pixel center y
   * @param {string} color - Text color
   */
  spawnFloatingScore(text, x, y, color = '#ffd700') {
    this.floatingTexts.push(new FloatingText(text, x, y, color));
  }

  /**
   * Update all active particles and floating texts
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    let remaining = dt;
    while (remaining > 0) {
      const step = Math.min(remaining, 0.05);
      this.step(step);
      remaining -= step;
      if (this.particles.length === 0 && this.floatingTexts.length === 0) break;
    }
  }

  step(stepDt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(stepDt);
      if (!p.isAlive()) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update(stepDt);
      if (!ft.isAlive()) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles and floating texts
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }

    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTexts[i].draw(ctx);
    }
  }

  /**
   * Clear all active visual effects
   */
  reset() {
    this.particles.length = 0;
    this.floatingTexts.length = 0;
  }
}

import { bus } from '../core/EventBus.js';

export const QUALITY_TIER = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * PerformanceMonitor tracks frame rate in real-time,
 * detects frame drops, and manages adaptive visual quality tiers.
 */
export class PerformanceMonitor {
  constructor() {
    this.isAuto = true;
    this.currentTier = QUALITY_TIER.HIGH;
    this.userPreference = 'auto'; // 'auto' | 'high' | 'medium' | 'low'

    // FPS tracking buffers
    this.frameTimes = [];
    this.sampleWindow = 60; // Calculate over 60 frames (~1 sec at 60fps)
    this.fps = 60;
    this.lastTierChangeTime = -10000;
    this.cooldownMs = 4000; // Minimum 4s between auto-tier transitions

    // Consecutive drop / recovery counters
    this.lowFpsCount = 0;
    this.highFpsCount = 0;

    this.loadPreference();
  }

  loadPreference() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('snake_quality');
      if (saved && ['auto', 'high', 'medium', 'low'].includes(saved)) {
        this.userPreference = saved;
        if (saved === 'auto') {
          this.isAuto = true;
          this.currentTier = QUALITY_TIER.HIGH;
        } else {
          this.isAuto = false;
          this.currentTier = saved;
        }
      }
    }
  }

  setPreference(preference) {
    if (!['auto', 'high', 'medium', 'low'].includes(preference)) return;

    this.userPreference = preference;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snake_quality', preference);
    }

    if (preference === 'auto') {
      this.isAuto = true;
      // In auto mode, start at High and let frame rate dictate adjustments
      this.setTier(QUALITY_TIER.HIGH, true);
    } else {
      this.isAuto = false;
      this.setTier(preference, true);
    }
  }

  setTier(tier, force = false) {
    if (!force && this.currentTier === tier) return;
    this.currentTier = tier;
    this.lastTierChangeTime = performance.now();
    bus.emit('quality:changed', { tier, isAuto: this.isAuto });
    console.log(`⚡ Performance Quality Tier set to: [${tier.toUpperCase()}] (Auto: ${this.isAuto})`);
  }

  /**
   * Record frame duration from requestAnimationFrame
   * @param {number} deltaMs
   */
  recordFrame(deltaMs) {
    if (deltaMs <= 0) return;

    this.frameTimes.push(deltaMs);
    if (this.frameTimes.length > this.sampleWindow) {
      this.frameTimes.shift();
    }

    // Calculate rolling average FPS
    const totalMs = this.frameTimes.reduce((acc, t) => acc + t, 0);
    const avgMs = totalMs / this.frameTimes.length;
    this.fps = avgMs > 0 ? Math.round(1000 / avgMs) : 60;

    if (!this.isAuto) return;

    const now = performance.now();
    if (now - this.lastTierChangeTime < this.cooldownMs) return;

    // Check for frame rate drops
    if (this.fps < 45) {
      this.lowFpsCount++;
      this.highFpsCount = 0;

      // After 2 consecutive low-FPS intervals (~2 seconds of struggle)
      if (this.lowFpsCount >= 2) {
        this.lowFpsCount = 0;
        if (this.currentTier === QUALITY_TIER.HIGH) {
          this.setTier(QUALITY_TIER.MEDIUM);
        } else if (this.currentTier === QUALITY_TIER.MEDIUM) {
          this.setTier(QUALITY_TIER.LOW);
        }
      }
    } else if (this.fps >= 58) {
      this.highFpsCount++;
      this.lowFpsCount = 0;

      // After sustained high FPS (~5 seconds of flawless 60fps)
      if (this.highFpsCount >= 5) {
        this.highFpsCount = 0;
        if (this.currentTier === QUALITY_TIER.LOW) {
          this.setTier(QUALITY_TIER.MEDIUM);
        } else if (this.currentTier === QUALITY_TIER.MEDIUM) {
          this.setTier(QUALITY_TIER.HIGH);
        }
      }
    } else {
      this.lowFpsCount = 0;
      this.highFpsCount = 0;
    }
  }

  getTier() {
    return this.currentTier;
  }

  getFps() {
    return this.fps;
  }
}

export const performanceMonitor = new PerformanceMonitor();

import { performanceMonitor } from '../systems/PerformanceMonitor.js';

const safeRaf = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame
  : (cb) => setTimeout(() => cb(performance.now()), 16);

const safeCaf = typeof cancelAnimationFrame !== 'undefined'
  ? cancelAnimationFrame
  : (id) => clearTimeout(id);

/**
 * GameLoop provides a robust 60fps requestAnimationFrame loop
 * with fixed-step updates for deterministic snake mechanics.
 */
export class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.update = updateCallback;
    this.render = renderCallback;
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.tickInterval = 190; // ms per game step (comfortable pace)
    this.rafId = null;

    this.loop = this.loop.bind(this);
  }

  /**
   * Set game speed interval (milliseconds per tick)
   * @param {number} ms
   */
  setSpeed(ms) {
    this.tickInterval = Math.max(30, ms);
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    if (!this.rafId) {
      this.rafId = safeRaf(this.loop);
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId) {
      safeCaf(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = Math.min(currentTime - this.lastTime, 250); // Cap frame hitching
    this.lastTime = currentTime;

    performanceMonitor.recordFrame(deltaTime);

    if (!this.isPaused) {
      this.accumulator += deltaTime;
      while (this.accumulator >= this.tickInterval) {
        this.update(this.tickInterval);
        this.accumulator -= this.tickInterval;
      }
    }

    // Always render so animations or overlays continue smoothly
    const interpolation = this.isPaused ? 0 : this.accumulator / this.tickInterval;
    this.render(interpolation);

    this.rafId = safeRaf(this.loop);
  }
}


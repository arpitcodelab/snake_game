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
    this.tickInterval = 150; // ms per game step (dynamic with snake speed)
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
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
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

    this.rafId = requestAnimationFrame(this.loop);
  }
}

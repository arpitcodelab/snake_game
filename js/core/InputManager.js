import { DIR, OPPOSITE_DIR } from '../utils/Constants.js';
import { bus } from './EventBus.js';

/**
 * InputManager handles keyboard controls with a 2-step FIFO queue
 * to eliminate 180-degree self-turn bugs.
 */
export class InputManager {
  constructor() {
    this.inputQueue = [];
    this.lastPolledDir = DIR.RIGHT;
    this.maxQueueSize = 2;

    this.keyMap = {
      'ArrowUp': DIR.UP,
      'KeyW': DIR.UP,
      'ArrowDown': DIR.DOWN,
      'KeyS': DIR.DOWN,
      'ArrowLeft': DIR.LEFT,
      'KeyA': DIR.LEFT,
      'ArrowRight': DIR.RIGHT,
      'KeyD': DIR.RIGHT
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleDpadButton = this.handleDpadButton.bind(this);

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchMoved = false;

    this.bindEvents();
    this.bindDpadEvents();
  }

  bindEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }
  }

  bindDpadEvents() {
    if (typeof document === 'undefined') return;

    const dpadMap = [
      { id: 'touch-up', dir: DIR.UP },
      { id: 'touch-down', dir: DIR.DOWN },
      { id: 'touch-left', dir: DIR.LEFT },
      { id: 'touch-right', dir: DIR.RIGHT }
    ];

    dpadMap.forEach(({ id, dir }) => {
      const btn = document.getElementById(id);
      if (btn) {
        const trigger = (e) => {
          e.preventDefault();
          this.triggerHaptic();
          this.queueDirection(dir);
        };
        btn.addEventListener('touchstart', trigger, { passive: false });
        btn.addEventListener('pointerdown', trigger);
      }
    });

    const pauseBtn = document.getElementById('touch-pause');
    if (pauseBtn) {
      const triggerPause = (e) => {
        e.preventDefault();
        this.triggerHaptic();
        bus.emit('input:pause');
      };
      pauseBtn.addEventListener('touchstart', triggerPause, { passive: false });
      pauseBtn.addEventListener('pointerdown', triggerPause);
    }
  }

  triggerHaptic() {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (_) {}
  }

  unbindEvents() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchMoved = false;
    }
  }

  handleTouchMove(e) {
    // Prevent mobile pull-to-refresh, zooming, and bouncing
    if (e.cancelable) {
      e.preventDefault();
    }

    if (e.touches.length === 0) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - this.touchStartX;
    const dy = currentY - this.touchStartY;
    const minDistance = 20; // 20px threshold for instant continuous responsiveness

    if (Math.abs(dx) >= minDistance || Math.abs(dy) >= minDistance) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.queueDirection(dx > 0 ? DIR.RIGHT : DIR.LEFT);
      } else {
        this.queueDirection(dy > 0 ? DIR.DOWN : DIR.UP);
      }
      this.triggerHaptic();

      // Reset anchor position to allow continuous chaining without lifting finger
      this.touchStartX = currentX;
      this.touchStartY = currentY;
      this.touchMoved = true;
    }
  }

  handleTouchEnd(e) {
    // Fallback for very quick flick taps that weren't captured during move
    if (!this.touchMoved && e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const minDistance = 15;

      if (Math.abs(dx) >= minDistance || Math.abs(dy) >= minDistance) {
        if (e.cancelable) {
          e.preventDefault();
        }
        if (Math.abs(dx) > Math.abs(dy)) {
          this.queueDirection(dx > 0 ? DIR.RIGHT : DIR.LEFT);
        } else {
          this.queueDirection(dy > 0 ? DIR.DOWN : DIR.UP);
        }
        this.triggerHaptic();
      }
    }
  }

  handleDpadButton(dir) {
    this.triggerHaptic();
    this.queueDirection(dir);
  }

  queueDirection(requestedDir) {
    if (!requestedDir) return;

    // Check against the last queued direction or the last polled direction
    const referenceDir = this.inputQueue.length > 0 
      ? this.inputQueue[this.inputQueue.length - 1] 
      : this.lastPolledDir;

    // Reject if opposite to reference direction or identical
    if (
      requestedDir.name !== referenceDir.name &&
      OPPOSITE_DIR[requestedDir.name] !== referenceDir.name
    ) {
      if (this.inputQueue.length < this.maxQueueSize) {
        this.inputQueue.push(requestedDir);
      }
    }

    bus.emit('input:direction', requestedDir);
  }

  handleKeyDown(e) {
    // Handle pause
    if (e.code === 'Space' || e.code === 'KeyP') {
      e.preventDefault();
      bus.emit('input:pause');
      return;
    }

    // Handle restart
    if (e.code === 'KeyR') {
      e.preventDefault();
      bus.emit('input:restart');
      return;
    }

    const requestedDir = this.keyMap[e.code];
    if (requestedDir) {
      e.preventDefault(); // Stop browser scrolling
      this.queueDirection(requestedDir);
    }
  }

  /**
   * Poll next buffered direction for the current tick
   * @param {object} currentSnakeDir
   * @returns {object|null}
   */
  pollDirection(currentSnakeDir) {
    if (currentSnakeDir) {
      this.lastPolledDir = currentSnakeDir;
    }

    if (this.inputQueue.length > 0) {
      const nextDir = this.inputQueue.shift();
      this.lastPolledDir = nextDir;
      return nextDir;
    }
    return null;
  }

  /**
   * Clear the input queue
   * @param {object} resetDir
   */
  reset(resetDir = DIR.RIGHT) {
    this.inputQueue = [];
    this.lastPolledDir = resetDir;
  }
}


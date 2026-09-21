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
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.touchStartX = 0;
    this.touchStartY = 0;

    this.bindEvents();
    this.setupDPad();
  }

  bindEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);

      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      }
    }
  }

  unbindEvents() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        canvas.removeEventListener('touchstart', this.handleTouchStart);
        canvas.removeEventListener('touchend', this.handleTouchEnd);
      }
    }
  }

  setupDPad() {
    if (typeof document === 'undefined') return;

    const dpadButtons = document.querySelectorAll('[data-dir]');
    const dirMap = {
      up: DIR.UP,
      down: DIR.DOWN,
      left: DIR.LEFT,
      right: DIR.RIGHT
    };

    dpadButtons.forEach(btn => {
      const trigger = (e) => {
        e.preventDefault();
        const dir = dirMap[btn.dataset.dir];
        if (dir) this.queueDirection(dir);
      };

      btn.addEventListener('touchstart', trigger, { passive: false });
      btn.addEventListener('click', trigger);
    });
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  handleTouchEnd(e) {
    if (e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const minDistance = 25; // Minimum px swipe threshold

      if (Math.abs(dx) > minDistance || Math.abs(dy) > minDistance) {
        e.preventDefault();
        if (Math.abs(dx) > Math.abs(dy)) {
          this.queueDirection(dx > 0 ? DIR.RIGHT : DIR.LEFT);
        } else {
          this.queueDirection(dy > 0 ? DIR.DOWN : DIR.UP);
        }
      }
    }
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


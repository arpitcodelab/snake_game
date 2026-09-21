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
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
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


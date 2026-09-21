import { DIR, OPPOSITE_DIR } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * Snake entity managing body coordinates, heading, and movement
 */
export class Snake {
  constructor(startPos = { x: 10, y: 10 }, initialLength = 3, initialDir = DIR.RIGHT) {
    this.startPos = { ...startPos };
    this.initialLength = initialLength;
    this.initialDir = initialDir;

    this.body = [];
    this.direction = { ...initialDir };
    this.lastDirection = { ...initialDir };
    this.growthPending = 0;
    this.isDead = false;

    this.reset();
  }

  /**
   * Reset snake to initial position and length
   * @param {object} [pos]
   * @param {number} [length]
   * @param {object} [dir]
   */
  reset(pos = this.startPos, length = this.initialLength, dir = this.initialDir) {
    this.body = [];
    this.direction = { ...dir };
    this.lastDirection = { ...dir };
    this.growthPending = 0;
    this.isDead = false;

    // Build initial body segments extending behind the head
    for (let i = 0; i < length; i++) {
      this.body.push({
        x: pos.x - dir.x * i,
        y: pos.y - dir.y * i
      });
    }
  }

  get head() {
    return this.body[0];
  }

  get tail() {
    return this.body[this.body.length - 1];
  }

  get length() {
    return this.body.length;
  }

  /**
   * Queue a new direction, validating it is not directly opposite
   * @param {object} newDir
   */
  setDirection(newDir) {
    if (!newDir) return;
    // Disallow 180-degree instant reversal against the last committed direction
    if (OPPOSITE_DIR[newDir.name] === this.lastDirection.name) {
      return;
    }
    this.direction = newDir;
  }

  /**
   * Grow snake by N segments on subsequent moves
   * @param {number} count
   */
  grow(count = 1) {
    this.growthPending += count;
  }

  /**
   * Advance snake by one grid step in the current direction
   * Returns the new head position
   */
  move() {
    if (this.isDead) return this.head;

    this.lastDirection = { ...this.direction };

    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };

    // Unshift new head
    this.body.unshift(newHead);

    // If growing, consume one pending growth unit; otherwise pop tail
    if (this.growthPending > 0) {
      this.growthPending--;
    } else {
      this.body.pop();
    }

    return newHead;
  }
}


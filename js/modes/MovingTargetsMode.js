import { GameMode } from './GameMode.js';

/**
 * Moving Targets Mode: Fruits periodically shift to adjacent open tiles.
 */
export class MovingTargetsMode extends GameMode {
  constructor() {
    super('moving_targets', 'Moving Targets', 'Fruits randomly crawl across the board');
    this.moveInterval = 2000; // ms between fruit steps
    this.accumulator = 0;
  }

  onUpdate(deltaTime, snake, food, grid) {
    if (!food || !food.items || food.items.length === 0) return;

    this.accumulator += deltaTime;
    if (this.accumulator >= this.moveInterval) {
      this.accumulator = 0;
      this.moveFruits(snake, food, grid);
    }
  }

  moveFruits(snake, food, grid) {
    const occupied = new Set();
    for (const seg of snake.body) {
      occupied.add(`${seg.x},${seg.y}`);
    }
    for (const f of food.items) {
      occupied.add(`${f.x},${f.y}`);
    }

    const deltas = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    for (const item of food.items) {
      // Golden fruit stays fixed
      if (item.isGolden) continue;

      // Pick a random valid neighbor
      const shuffledDeltas = [...deltas].sort(() => Math.random() - 0.5);
      for (const d of shuffledDeltas) {
        const nx = item.x + d.x;
        const ny = item.y + d.y;
        if (nx >= 0 && nx < grid.cols && ny >= 0 && ny < grid.rows && !occupied.has(`${nx},${ny}`)) {
          // Free previous spot, take new spot
          occupied.delete(`${item.x},${item.y}`);
          item.x = nx;
          item.y = ny;
          occupied.add(`${nx},${ny}`);
          break;
        }
      }
    }
  }
}

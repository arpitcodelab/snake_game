import { GameMode } from './GameMode.js';

/**
 * No Walls Mode: Snake passes through walls and emerges on the opposite side.
 */
export class NoWallsMode extends GameMode {
  constructor() {
    super('no_walls', 'No Walls', 'Pass through walls and emerge on the other side');
  }

  onWallCollision(head, grid, snake) {
    // Wrap coordinates across board edges
    if (head.x < 0) {
      head.x = grid.cols - 1;
    } else if (head.x >= grid.cols) {
      head.x = 0;
    }

    if (head.y < 0) {
      head.y = grid.rows - 1;
    } else if (head.y >= grid.rows) {
      head.y = 0;
    }

    // Handled without death
    return { handled: true, collided: false };
  }
}


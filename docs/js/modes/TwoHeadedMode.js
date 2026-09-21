import { GameMode } from './GameMode.js';

/**
 * Two-Headed Mode: Snake has an active head on both ends.
 * Both heads must avoid walls and body obstacles!
 */
export class TwoHeadedMode extends GameMode {
  constructor() {
    super('two_headed', 'Two-Headed', 'Both ends are active heads — neither can hit obstacles');
  }

  hasSecondaryHead() {
    return true;
  }

  /**
   * Check collisions for both heads
   */
  onWallCollision(head, grid, snake) {
    const head1 = head;
    const head2 = snake.body[snake.body.length - 1];

    const h1Out = head1.x < 0 || head1.x >= grid.cols || head1.y < 0 || head1.y >= grid.rows;
    const h2Out = head2.x < 0 || head2.x >= grid.cols || head2.y < 0 || head2.y >= grid.rows;

    return { handled: true, collided: h1Out || h2Out };
  }

  onSelfCollision(head, body, snake) {
    const head1 = head;
    const head2 = body[body.length - 1];

    // Check head1 against body (excluding head1 and head2)
    for (let i = 1; i < body.length - 1; i++) {
      if (head1.x === body[i].x && head1.y === body[i].y) {
        return { handled: true, collided: true };
      }
    }

    // Check head2 against body (excluding head1 and head2)
    for (let i = 1; i < body.length - 1; i++) {
      if (head2.x === body[i].x && head2.y === body[i].y) {
        return { handled: true, collided: true };
      }
    }

    return { handled: true, collided: false };
  }
}


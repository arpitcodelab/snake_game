/**
 * CollisionSystem checks wall boundaries and self-body collisions
 */
export class CollisionSystem {
  /**
   * Check if a position collides with the arena boundaries
   * @param {object} pos - { x, y }
   * @param {object} grid - { cols, rows }
   * @returns {boolean}
   */
  checkWall(pos, grid) {
    return pos.x < 0 || pos.x >= grid.cols || pos.y < 0 || pos.y >= grid.rows;
  }

  /**
   * Check if head position collides with any body segment
   * @param {object} head - { x, y }
   * @param {Array<object>} body - Array of { x, y }
   * @returns {boolean}
   */
  checkSelf(head, body) {
    // Skip checking head against itself (index 0)
    for (let i = 1; i < body.length; i++) {
      if (head.x === body[i].x && head.y === body[i].y) {
        return true;
      }
    }
    return false;
  }

  /**
   * Full collision check for current snake position
   * @param {Snake} snake
   * @param {object} grid
   * @returns {{ collided: boolean, type: 'WALL'|'SELF'|null }}
   */
  check(snake, grid) {
    const head = snake.head;

    if (this.checkWall(head, grid)) {
      return { collided: true, type: 'WALL' };
    }

    if (this.checkSelf(head, snake.body)) {
      return { collided: true, type: 'SELF' };
    }

    return { collided: false, type: null };
  }
}

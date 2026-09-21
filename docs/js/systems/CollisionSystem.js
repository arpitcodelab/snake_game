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
   * Check if snake head collides with any active food item
   * @param {object} head - { x, y }
   * @param {Array<object>} foodItems
   * @returns {object|null} - Collided food item or null
   */
  checkFood(head, foodItems) {
    if (!foodItems || foodItems.length === 0) return null;
    for (let i = 0; i < foodItems.length; i++) {
      const food = foodItems[i];
      if (head.x === food.x && head.y === food.y) {
        return food;
      }
    }
    return null;
  }

  /**
   * Full collision check for current snake position
   * @param {Snake} snake
   * @param {object} grid
   * @param {GameMode} [mode]
   * @returns {{ collided: boolean, type: 'WALL'|'SELF'|null }}
   */
  check(snake, grid, mode = null) {
    const head = snake.head;

    // 1. Wall check (with mode override)
    if (mode && typeof mode.onWallCollision === 'function') {
      const wallResult = mode.onWallCollision(head, grid, snake);
      if (wallResult.handled) {
        if (wallResult.collided) return { collided: true, type: 'WALL' };
      } else if (this.checkWall(head, grid)) {
        return { collided: true, type: 'WALL' };
      }
    } else if (this.checkWall(head, grid)) {
      return { collided: true, type: 'WALL' };
    }

    // 2. Self check (with mode override)
    if (mode && typeof mode.onSelfCollision === 'function') {
      const selfResult = mode.onSelfCollision(head, snake.body, snake);
      if (selfResult.handled) {
        if (selfResult.collided) return { collided: true, type: 'SELF' };
      } else if (this.checkSelf(head, snake.body)) {
        return { collided: true, type: 'SELF' };
      }
    } else if (this.checkSelf(head, snake.body)) {
      return { collided: true, type: 'SELF' };
    }

    return { collided: false, type: null };
  }
}


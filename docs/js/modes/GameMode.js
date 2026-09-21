/**
 * Base GameMode class defining strategy pattern hooks
 */
export class GameMode {
  constructor(id = 'base', name = 'Base Mode', description = '') {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Called when snake moves beyond arena boundaries
   * @param {object} head - { x, y }
   * @param {object} grid - { cols, rows }
   * @param {Snake} snake
   * @returns {{ handled: boolean, collided: boolean }}
   */
  onWallCollision(head, grid, snake) {
    const isOut = head.x < 0 || head.x >= grid.cols || head.y < 0 || head.y >= grid.rows;
    return { handled: false, collided: isOut };
  }

  /**
   * Called when snake head hits its own body
   * @param {object} head
   * @param {Array<object>} body
   * @param {Snake} snake
   * @returns {{ handled: boolean, collided: boolean }}
   */
  onSelfCollision(head, body, snake) {
    for (let i = 1; i < body.length; i++) {
      if (head.x === body[i].x && head.y === body[i].y) {
        return { handled: true, collided: true };
      }
    }
    return { handled: true, collided: false };
  }

  /**
   * Hook called when fruit is eaten
   * @param {object} food
   * @param {ScoreSystem} scoreSystem
   * @param {Snake} snake
   */
  onFoodEaten(food, scoreSystem, snake) {
    // Default: no-op
  }

  /**
   * Per-frame tick update for mode-specific logic
   * @param {number} deltaTime
   * @param {Snake} snake
   * @param {Food} food
   * @param {object} grid
   */
  onUpdate(deltaTime, snake, food, grid) {
    // Default: no-op
  }

  /**
   * Multiplier applied to speed (higher = faster tick rate)
   * @returns {number}
   */
  getSpeedModifier() {
    return 1.0;
  }

  /**
   * Multiplier applied to fruit point values
   * @returns {number}
   */
  getScoreMultiplier() {
    return 1;
  }

  /**
   * Controls whether a specific body segment should be rendered
   * @param {number} index
   * @param {number} totalLength
   * @returns {boolean}
   */
  shouldRenderSegment(index, totalLength) {
    return true;
  }

  /**
   * Indicates if the mode features an active secondary head (e.g. Two-Headed)
   * @returns {boolean}
   */
  hasSecondaryHead() {
    return false;
  }
}


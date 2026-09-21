/**
 * ScoreSystem manages score calculation, fruit counters, and speed scaling
 */
export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.highScore = typeof localStorage !== 'undefined' 
      ? parseInt(localStorage.getItem('snake_highscore') || '0', 10) 
      : 0;
    this.fruitsEaten = 0;
  }

  /**
   * Add points for fruit eaten
   * @param {number} points
   */
  add(points = 1) {
    this.score += points;
    this.fruitsEaten++;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('snake_highscore', this.highScore.toString());
      }
    }
  }

  /**
   * Calculate current speed interval in milliseconds
   * @param {number} baseMs - Initial tick interval (e.g. 150)
   * @param {number} minMs - Fastest allowed tick interval (e.g. 60)
   * @param {number} stepDown - Ms decrease per fruit eaten (e.g. 2)
   * @returns {number}
   */
  getSpeedMs(baseMs = 150, minMs = 60, stepDown = 2) {
    return Math.max(minMs, baseMs - (this.fruitsEaten * stepDown));
  }

  /**
   * Reset score and fruit count for a new game
   */
  reset() {
    this.score = 0;
    this.fruitsEaten = 0;
  }
}

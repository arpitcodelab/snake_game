import { bus } from '../core/EventBus.js';

/**
 * LeaderboardSystem manages local Top 10 high scores with arcade initials
 */
export class LeaderboardSystem {
  constructor() {
    this.scores = {};
    this.maxEntries = 10;
    this.load();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('snake_leaderboard');
        if (data) {
          this.scores = JSON.parse(data);
        }
      }
    } catch (e) {
      console.warn('Could not load leaderboard:', e);
      this.scores = {};
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('snake_leaderboard', JSON.stringify(this.scores));
      }
    } catch (e) {
      console.warn('Could not save leaderboard:', e);
    }
  }

  /**
   * Check if a score qualifies for the top 10 in a given mode
   * @param {number} score
   * @param {string} mode
   * @returns {boolean}
   */
  isTopScore(score, mode = 'classic') {
    if (score <= 0) return false;
    const modeScores = this.scores[mode] || [];
    if (modeScores.length < this.maxEntries) return true;
    return score > modeScores[modeScores.length - 1].score;
  }

  /**
   * Add a new high score entry
   * @param {string} initials - 3 letters
   * @param {number} score
   * @param {string} mode
   */
  addScore(initials, score, mode = 'classic') {
    if (!this.scores[mode]) {
      this.scores[mode] = [];
    }

    const cleanInitials = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
    const entry = {
      initials: cleanInitials,
      score: Math.max(0, score),
      mode,
      date: new Date().toISOString().split('T')[0]
    };

    this.scores[mode].push(entry);
    this.scores[mode].sort((a, b) => b.score - a.score);
    this.scores[mode] = this.scores[mode].slice(0, this.maxEntries);

    this.save();
    bus.emit('leaderboard:updated', { mode, scores: this.scores[mode] });
    return entry;
  }

  /**
   * Get top scores for a mode
   * @param {string} mode
   * @returns {Array<object>}
   */
  getScores(mode = 'classic') {
    return this.scores[mode] || [];
  }
}

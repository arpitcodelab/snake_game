import { bus } from '../core/EventBus.js';

/**
 * GameOverScreen displays final achievements and replay options
 */
export class GameOverScreen {
  constructor(screenManager, game, leaderboardSystem) {
    this.screenManager = screenManager;
    this.game = game;
    this.leaderboard = leaderboardSystem;

    this.scoreEl = document.getElementById('go-score');
    this.bestEl = document.getElementById('go-best');
    this.newHighBadge = document.getElementById('go-new-high-badge');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnMenu = document.getElementById('btn-menu');
    this.btnViewLeaderboard = document.getElementById('btn-go-leaderboard');

    // Initials input
    this.initialsContainer = document.getElementById('go-initials-container');
    this.inputInitials = document.getElementById('go-input-initials');
    this.btnSaveInitials = document.getElementById('btn-save-initials');

    this.bindEvents();
  }

  bindEvents() {
    bus.on('game:over', ({ score }) => {
      this.show(score);
    });

    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        this.screenManager.showScreen('game');
        this.game.restart();
      });
    }

    if (this.btnMenu) {
      this.btnMenu.addEventListener('click', () => {
        this.screenManager.showScreen('start');
      });
    }

    if (this.btnViewLeaderboard) {
      this.btnViewLeaderboard.addEventListener('click', () => {
        bus.emit('leaderboard:open', { mode: this.game.mode.id });
      });
    }

    if (this.btnSaveInitials && this.inputInitials) {
      this.btnSaveInitials.addEventListener('click', () => {
        const initials = this.inputInitials.value || 'AAA';
        if (this.leaderboard) {
          this.leaderboard.addScore(initials, this.currentScore, this.game.mode.id);
        }
        if (this.initialsContainer) {
          this.initialsContainer.style.display = 'none';
        }
        bus.emit('leaderboard:open', { mode: this.game.mode.id });
      });
    }
  }

  show(score) {
    this.currentScore = score;
    const highScore = this.game.scoreSystem.highScore;
    const isNewHigh = score > 0 && score >= highScore;

    if (this.scoreEl) this.scoreEl.textContent = score.toString();
    if (this.bestEl) this.bestEl.textContent = highScore.toString();

    if (this.newHighBadge) {
      this.newHighBadge.style.display = isNewHigh ? 'inline-block' : 'none';
    }

    // Check if score qualifies for leaderboard
    if (this.initialsContainer && this.leaderboard) {
      const qualifies = this.leaderboard.isTopScore(score, this.game.mode.id);
      this.initialsContainer.style.display = qualifies ? 'flex' : 'none';
      if (qualifies && this.inputInitials) {
        this.inputInitials.value = '';
        setTimeout(() => this.inputInitials.focus(), 100);
      }
    }

    this.screenManager.showScreen('gameover');
  }
}


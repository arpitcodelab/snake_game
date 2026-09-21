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
    this.trophyBadge = document.getElementById('go-trophy-badge');
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
      this.show(score, false);
    });

    bus.on('game:win', ({ score }) => {
      this.show(score, true);
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
      const saveHandler = () => {
        const initials = (this.inputInitials.value || 'AAA').trim().toUpperCase().slice(0, 3);
        if (this.leaderboard) {
          this.leaderboard.addScore(initials, this.currentScore, this.game.mode.id);
        }
        if (this.initialsContainer) {
          this.initialsContainer.style.display = 'none';
        }
        bus.emit('leaderboard:open', { mode: this.game.mode.id });
      };

      this.btnSaveInitials.addEventListener('click', saveHandler);
      this.inputInitials.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveHandler();
      });
    }
  }

  show(score, isWin = false) {
    this.currentScore = score;
    const highScore = this.game.scoreSystem.highScore;
    const isNewHigh = score > 0 && score >= highScore;

    const headingEl = document.querySelector('.gameover-heading');
    const cardEl = document.querySelector('.gameover-card');
    if (headingEl) {
      headingEl.textContent = isWin ? 'VICTORY' : 'SNAKE GAME';
    }
    if (cardEl) {
      if (isWin) {
        cardEl.classList.add('victory');
      } else {
        cardEl.classList.remove('victory');
      }
    }

    if (this.scoreEl) this.scoreEl.textContent = score.toString();
    if (this.bestEl) this.bestEl.textContent = highScore.toString();

    if (this.newHighBadge) {
      this.newHighBadge.textContent = isWin ? 'ARENA CLEARED! 🏆' : 'NEW HIGH SCORE! 🎉';
      this.newHighBadge.style.display = (isWin || isNewHigh) ? 'inline-block' : 'none';
    }

    if (this.trophyBadge) {
      if (isWin || isNewHigh) {
        this.trophyBadge.className = 'trophy-large gold';
        this.trophyBadge.style.display = 'inline-block';
      } else if (score >= highScore * 0.75 && score > 0) {
        this.trophyBadge.className = 'trophy-large silver';
        this.trophyBadge.style.display = 'inline-block';
      } else if (score >= highScore * 0.5 && score > 0) {
        this.trophyBadge.className = 'trophy-large bronze';
        this.trophyBadge.style.display = 'inline-block';
      } else {
        this.trophyBadge.style.display = 'none';
      }
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


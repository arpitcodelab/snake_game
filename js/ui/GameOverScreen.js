import { bus } from '../core/EventBus.js';

/**
 * GameOverScreen displays final achievements and replay options
 */
export class GameOverScreen {
  constructor(screenManager, game) {
    this.screenManager = screenManager;
    this.game = game;

    this.scoreEl = document.getElementById('go-score');
    this.bestEl = document.getElementById('go-best');
    this.newHighBadge = document.getElementById('go-new-high-badge');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnMenu = document.getElementById('btn-menu');

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
  }

  show(score) {
    const highScore = this.game.scoreSystem.highScore;
    const isNewHigh = score > 0 && score >= highScore;

    if (this.scoreEl) this.scoreEl.textContent = score.toString();
    if (this.bestEl) this.bestEl.textContent = highScore.toString();

    if (this.newHighBadge) {
      this.newHighBadge.style.display = isNewHigh ? 'inline-block' : 'none';
    }

    this.screenManager.showScreen('gameover');
  }
}

import { bus } from '../core/EventBus.js';

/**
 * StartScreen handles main menu interactions
 */
export class StartScreen {
  constructor(screenManager, game) {
    this.screenManager = screenManager;
    this.game = game;

    this.btnPlay = document.getElementById('btn-play');
    this.btnSettings = document.getElementById('btn-settings-start');
    this.btnLeaderboard = document.getElementById('btn-leaderboard-start');
    this.highScoreDisplay = document.getElementById('start-highscore');

    this.bindEvents();
    this.update();

    bus.on('screen:change', ({ screen }) => {
      if (screen === 'start') {
        this.update();
      }
    });
  }

  bindEvents() {
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => {
        this.screenManager.showScreen('game');
        this.game.start();
      });
    }

    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => {
        this.screenManager.openPanel('settings');
      });
    }

    if (this.btnLeaderboard) {
      this.btnLeaderboard.addEventListener('click', () => {
        bus.emit('leaderboard:open', { mode: this.game.mode.id });
      });
    }
  }

  update() {
    if (this.highScoreDisplay) {
      const hs = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('snake_highscore') || '0'
        : '0';
      this.highScoreDisplay.textContent = hs;
    }
  }
}


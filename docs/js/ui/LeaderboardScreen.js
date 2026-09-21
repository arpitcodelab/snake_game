import { modeManager } from '../modes/ModeManager.js';
import { bus } from '../core/EventBus.js';

/**
 * LeaderboardScreen renders ranked arcade Top 10 scores
 */
export class LeaderboardScreen {
  constructor(screenManager, leaderboardSystem) {
    this.screenManager = screenManager;
    this.leaderboard = leaderboardSystem;

    this.screen = document.getElementById('screen-leaderboard');
    this.listEl = document.getElementById('leaderboard-list');
    this.modeSelect = document.getElementById('leaderboard-mode-select');
    this.btnBack = document.getElementById('btn-leaderboard-back');

    this.activeMode = 'classic';
    this.initModes();
    this.bindEvents();
  }

  initModes() {
    if (this.modeSelect) {
      this.modeSelect.innerHTML = '';
      const modes = modeManager.getAll();
      for (const m of modes) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        this.modeSelect.appendChild(opt);
      }
    }
  }

  bindEvents() {
    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => {
        this.screenManager.showScreen('start');
      });
    }

    if (this.modeSelect) {
      this.modeSelect.addEventListener('change', (e) => {
        this.activeMode = e.target.value;
        this.render();
      });
    }

    bus.on('leaderboard:open', (data) => {
      if (data && data.mode) {
        this.activeMode = data.mode;
        if (this.modeSelect) this.modeSelect.value = data.mode;
      }
      this.render();
      this.screenManager.showScreen('leaderboard');
    });
  }

  render() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    const scores = this.leaderboard.getScores(this.activeMode);

    if (scores.length === 0) {
      this.listEl.innerHTML = `
        <li class="leaderboard-empty">
          <span>No scores recorded yet! Play a game to set the first record.</span>
        </li>
      `;
      return;
    }

    const trophies = ['trophy-gold', 'trophy-silver', 'trophy-bronze'];

    scores.forEach((entry, idx) => {
      const li = document.createElement('li');
      li.className = 'leaderboard-row';
      const rankBadge = idx < 3
        ? `<span class="trophy-sprite ${trophies[idx]}"></span>`
        : `<span class="rank-badge">#${idx + 1}</span>`;

      li.innerHTML = `
        <div class="rank-col">
          ${rankBadge}
          <span class="initials">${entry.initials}</span>
        </div>
        <div class="score-col">
          <span class="score-val">${entry.score}</span>
          <span class="date-val">${entry.date || ''}</span>
        </div>
      `;
      this.listEl.appendChild(li);
    });
  }
}


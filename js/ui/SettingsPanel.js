import { modeManager } from '../modes/ModeManager.js';
import { GRID } from '../utils/Constants.js';
import { bus } from '../core/EventBus.js';

/**
 * SettingsPanel handles pre-game and in-game configuration
 */
export class SettingsPanel {
  constructor(screenManager, game) {
    this.screenManager = screenManager;
    this.game = game;

    this.panel = document.getElementById('panel-settings');
    this.btnClose = document.getElementById('btn-close-settings');
    this.selectMode = document.getElementById('setting-game-mode');
    this.selectBoard = document.getElementById('setting-board-size');
    this.selectFruits = document.getElementById('setting-fruits-count');

    this.initOptions();
    this.loadSettings();
    this.bindEvents();
  }

  initOptions() {
    // Populate modes dropdown
    if (this.selectMode) {
      this.selectMode.innerHTML = '';
      const modes = modeManager.getAll();
      for (const m of modes) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        this.selectMode.appendChild(opt);
      }
    }

    // Populate board size dropdown
    if (this.selectBoard) {
      this.selectBoard.innerHTML = `
        <option value="SMALL">Small (20×20)</option>
        <option value="MEDIUM" selected>Medium (30×30)</option>
        <option value="LARGE">Large (40×40)</option>
      `;
    }

    // Populate fruit count dropdown
    if (this.selectFruits) {
      this.selectFruits.innerHTML = `
        <option value="1" selected>1 Fruit</option>
        <option value="3">3 Fruits</option>
        <option value="5">5 Fruits</option>
      `;
    }
  }

  loadSettings() {
    let settings = {
      mode: 'classic',
      boardSize: 'MEDIUM',
      fruits: 1
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('snake_settings');
        if (saved) settings = { ...settings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not parse settings from storage:', e);
    }

    if (this.selectMode) this.selectMode.value = settings.mode;
    if (this.selectBoard) this.selectBoard.value = settings.boardSize;
    if (this.selectFruits) this.selectFruits.value = settings.fruits.toString();

    this.applySettings(settings);
  }

  saveSettings() {
    const settings = {
      mode: this.selectMode ? this.selectMode.value : 'classic',
      boardSize: this.selectBoard ? this.selectBoard.value : 'MEDIUM',
      fruits: this.selectFruits ? parseInt(this.selectFruits.value, 10) : 1
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snake_settings', JSON.stringify(settings));
    }

    this.applySettings(settings);
  }

  applySettings(settings) {
    if (settings.mode && this.game) {
      this.game.setMode(settings.mode);
    }
    if (settings.boardSize && GRID[settings.boardSize] && this.game) {
      this.game.setGrid(GRID[settings.boardSize]);
    }
    if (settings.fruits && this.game) {
      this.game.setFruitCount(settings.fruits);
    }
    bus.emit('settings:applied', settings);
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        this.saveSettings();
        this.screenManager.closePanel('settings');
      });
    }

    if (this.selectMode) {
      this.selectMode.addEventListener('change', () => this.saveSettings());
    }
    if (this.selectBoard) {
      this.selectBoard.addEventListener('change', () => this.saveSettings());
    }
    if (this.selectFruits) {
      this.selectFruits.addEventListener('change', () => this.saveSettings());
    }
  }
}

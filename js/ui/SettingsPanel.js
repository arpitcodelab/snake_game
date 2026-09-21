import { modeManager } from '../modes/ModeManager.js';
import { GRID } from '../utils/Constants.js';
import { bus } from '../core/EventBus.js';

/**
 * SettingsPanel handles pre-game and in-game configuration
 */
export class SettingsPanel {
  constructor(screenManager, game, themeSystem, skinSystem) {
    this.screenManager = screenManager;
    this.game = game;
    this.themeSystem = themeSystem;
    this.skinSystem = skinSystem;

    this.panel = document.getElementById('panel-settings');
    this.btnClose = document.getElementById('btn-close-settings');
    this.selectMode = document.getElementById('setting-game-mode');
    this.selectBoard = document.getElementById('setting-board-size');
    this.selectFruits = document.getElementById('setting-fruits-count');
    this.selectTheme = document.getElementById('setting-theme');
    this.selectSkin = document.getElementById('setting-skin');

    this.initOptions();
    this.loadSettings();
    this.bindEvents();

    bus.on('skin:unlocked', () => this.populateSkins());
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

    // Populate themes dropdown
    if (this.selectTheme && this.themeSystem) {
      this.selectTheme.innerHTML = '';
      const themes = this.themeSystem.getAll();
      for (const t of themes) {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        this.selectTheme.appendChild(opt);
      }
    }

    this.populateSkins();
  }

  populateSkins() {
    if (this.selectSkin && this.skinSystem) {
      this.selectSkin.innerHTML = '';
      const skins = this.skinSystem.getAll();
      for (const s of skins) {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.isUnlocked ? s.name : `🔒 ${s.name} (${s.milestone} fruits)`;
        opt.disabled = !s.isUnlocked;
        this.selectSkin.appendChild(opt);
      }
      this.selectSkin.value = this.skinSystem.activeSkinId;
    }
  }

  loadSettings() {
    let settings = {
      mode: 'classic',
      boardSize: 'MEDIUM',
      fruits: 1,
      theme: 'classic',
      skin: 'classic'
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
    if (this.selectTheme && settings.theme) this.selectTheme.value = settings.theme;
    if (this.selectSkin && settings.skin) this.selectSkin.value = settings.skin;

    this.applySettings(settings);
  }

  saveSettings() {
    const settings = {
      mode: this.selectMode ? this.selectMode.value : 'classic',
      boardSize: this.selectBoard ? this.selectBoard.value : 'MEDIUM',
      fruits: this.selectFruits ? parseInt(this.selectFruits.value, 10) : 1,
      theme: this.selectTheme ? this.selectTheme.value : 'classic',
      skin: this.selectSkin ? this.selectSkin.value : 'classic'
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
    if (settings.theme && this.themeSystem) {
      this.themeSystem.applyTheme(settings.theme);
    }
    if (settings.skin && this.skinSystem) {
      this.skinSystem.selectSkin(settings.skin);
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
    if (this.selectTheme) {
      this.selectTheme.addEventListener('change', () => this.saveSettings());
    }
    if (this.selectSkin) {
      this.selectSkin.addEventListener('change', () => this.saveSettings());
    }
  }
}


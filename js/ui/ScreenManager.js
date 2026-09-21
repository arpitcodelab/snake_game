import { bus } from '../core/EventBus.js';

/**
 * ScreenManager controls UI screens and overlays
 */
export class ScreenManager {
  constructor() {
    this.screens = {
      start: document.getElementById('screen-start'),
      game: document.getElementById('screen-game'),
      gameover: document.getElementById('screen-gameover'),
      leaderboard: document.getElementById('screen-leaderboard')
    };
    this.panels = {
      settings: document.getElementById('panel-settings')
    };

    this.currentScreen = 'start';
  }

  showScreen(screenId) {
    for (const [id, el] of Object.entries(this.screens)) {
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.remove('active');
          el.classList.add('hidden');
        }
      }
    }

    // Toggle in-game HUD overlay visibility
    const hud = document.getElementById('hud-overlay');
    if (hud) {
      hud.style.display = screenId === 'game' ? 'flex' : 'none';
    }

    this.currentScreen = screenId;
    bus.emit('screen:change', { screen: screenId });
  }

  openPanel(panelId) {
    const panel = this.panels[panelId];
    if (panel) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    }
  }

  closePanel(panelId) {
    const panel = this.panels[panelId];
    if (panel) {
      panel.classList.remove('active');
      panel.classList.add('hidden');
    }
  }

  togglePanel(panelId) {
    const panel = this.panels[panelId];
    if (panel) {
      if (panel.classList.contains('active')) {
        this.closePanel(panelId);
      } else {
        this.openPanel(panelId);
      }
    }
  }
}

import { Game } from './core/Game.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { StartScreen } from './ui/StartScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { SettingsPanel } from './ui/SettingsPanel.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Failed to find #game-canvas element');
    return;
  }

  // Initialize Game engine
  const game = new Game(canvas);

  // Initialize UI systems
  const screenManager = new ScreenManager();
  const startScreen = new StartScreen(screenManager, game);
  const gameOverScreen = new GameOverScreen(screenManager, game);
  const settingsPanel = new SettingsPanel(screenManager, game);

  // Show start screen initially
  screenManager.showScreen('start');

  // Expose to window for testing / debugging
  window.__SNAKE_GAME__ = game;
  window.__SCREEN_MGR__ = screenManager;
});

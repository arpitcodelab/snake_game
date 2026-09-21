import { Game } from './core/Game.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { StartScreen } from './ui/StartScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { LeaderboardScreen } from './ui/LeaderboardScreen.js';
import { ThemeSystem } from './systems/ThemeSystem.js';
import { SkinSystem } from './systems/SkinSystem.js';
import { LeaderboardSystem } from './systems/LeaderboardSystem.js';
import { bus } from './core/EventBus.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Failed to find #game-canvas element');
    return;
  }

  // Initialize Game engine
  const game = new Game(canvas);

  // Initialize Systems
  const themeSystem = new ThemeSystem(game.renderer);
  const skinSystem = new SkinSystem();
  const leaderboardSystem = new LeaderboardSystem();

  // Apply initial skin to snake renderer
  game.renderer.snakeRenderer.setSkin(skinSystem.getActiveSkin());
  bus.on('skin:changed', (skin) => {
    game.renderer.snakeRenderer.setSkin(skin);
  });

  // Initialize UI systems
  const screenManager = new ScreenManager();
  const startScreen = new StartScreen(screenManager, game);
  const gameOverScreen = new GameOverScreen(screenManager, game, leaderboardSystem);
  const settingsPanel = new SettingsPanel(screenManager, game, themeSystem, skinSystem);
  const leaderboardScreen = new LeaderboardScreen(screenManager, leaderboardSystem);

  // Show start screen initially
  screenManager.showScreen('start');

  // Expose to window for testing / debugging
  window.__SNAKE_GAME__ = game;
  window.__SCREEN_MGR__ = screenManager;
  window.__THEME_SYSTEM__ = themeSystem;
  window.__SKIN_SYSTEM__ = skinSystem;
  window.__LEADERBOARD_SYSTEM__ = leaderboardSystem;
});


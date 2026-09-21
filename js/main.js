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

  // Wire up HUD mute button
  const muteHudBtn = document.getElementById('btn-mute-hud');
  if (muteHudBtn) {
    const updateMuteIcon = (isMuted) => {
      muteHudBtn.textContent = isMuted ? '🔇' : '🔊';
    };
    updateMuteIcon(game.audioManager.isMuted);

    muteHudBtn.addEventListener('click', () => {
      const isMuted = game.audioManager.toggleMute();
      updateMuteIcon(isMuted);
    });

    bus.on('audio:mute_changed', ({ isMuted }) => {
      updateMuteIcon(isMuted);
    });
  }

  // Show start screen initially
  screenManager.showScreen('start');

  // Expose to window for testing / debugging
  window.__SNAKE_GAME__ = game;
  window.__SCREEN_MGR__ = screenManager;
  window.__THEME_SYSTEM__ = themeSystem;
  window.__SKIN_SYSTEM__ = skinSystem;
  window.__LEADERBOARD_SYSTEM__ = leaderboardSystem;
  window.__AUDIO_MGR__ = game.audioManager;
  window.__PARTICLE_SYS__ = game.particleSystem;
});


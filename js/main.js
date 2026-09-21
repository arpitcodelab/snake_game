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

  // Wire up header sound toggle with authentic icons
  const muteBtn = document.getElementById('btn-mute-hud');
  const soundIconImg = document.getElementById('sound-icon-img');

  const updateMuteIcon = (isMuted) => {
    if (soundIconImg) {
      soundIconImg.src = isMuted
        ? 'assets/images/not_interested_white_24dp.png'
        : 'assets/images/volume_up_white_24dp.png';
      soundIconImg.alt = isMuted ? 'Muted' : 'Sound On';
    }
  };

  if (muteBtn) {
    updateMuteIcon(game.audioManager.isMuted);

    muteBtn.addEventListener('click', () => {
      const isMuted = game.audioManager.toggleMute();
      updateMuteIcon(isMuted);
    });

    bus.on('audio:mute_changed', ({ isMuted }) => {
      updateMuteIcon(isMuted);
    });
  }

  // Wire up header settings button
  const btnSettingsHeader = document.getElementById('btn-settings-header');
  if (btnSettingsHeader) {
    btnSettingsHeader.addEventListener('click', () => {
      screenManager.openPanel('settings');
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


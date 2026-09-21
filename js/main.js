import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Failed to find #game-canvas element');
    return;
  }

  const game = new Game(canvas);
  // Auto-start for Phase 1 testing
  game.start();

  // Expose to window for debugging in developer console
  window.__SNAKE_GAME__ = game;
});

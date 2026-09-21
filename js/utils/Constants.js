/**
 * Game constants and configurations matching Google Snake standard
 */

export const GRID = {
  SMALL: { cols: 11, rows: 9, label: 'Small (11x9)' },
  MEDIUM: { cols: 17, rows: 15, label: 'Standard (17x15)' },
  LARGE: { cols: 23, rows: 19, label: 'Large (23x19)' }
};

export const SPEED = {
  BASE_MS: 230,   // Milliseconds per tick at start (relaxed, smooth pace)
  MIN_MS: 110,    // Maximum speed limit
  STEP_DOWN: 1.2  // Reduction in ms per fruit eaten
};

export const CANVAS = {
  LOGICAL_WIDTH: 660,
  LOGICAL_HEIGHT: 592,
  BORDER_X: 24,
  BORDER_Y: 26
};

export const DIR = {
  UP: { x: 0, y: -1, name: 'UP' },
  DOWN: { x: 0, y: 1, name: 'DOWN' },
  LEFT: { x: -1, y: 0, name: 'LEFT' },
  RIGHT: { x: 1, y: 0, name: 'RIGHT' }
};

export const OPPOSITE_DIR = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

export const GAME_STATE = {
  LOADING: 'LOADING',
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEADERBOARD: 'LEADERBOARD',
  WIN: 'WIN'
};

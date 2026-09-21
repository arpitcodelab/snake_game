/**
 * Game constants and configurations
 */

export const GRID = {
  SMALL: { cols: 20, rows: 20, label: 'Small (20x20)' },
  MEDIUM: { cols: 30, rows: 30, label: 'Medium (30x30)' },
  LARGE: { cols: 40, rows: 40, label: 'Large (40x40)' }
};

export const SPEED = {
  BASE_MS: 150,   // Milliseconds per tick at start
  MIN_MS: 60,     // Maximum speed limit
  STEP_DOWN: 2    // Reduction in ms per fruit eaten
};

export const CANVAS = {
  LOGICAL_SIZE: 600 // Internal canvas pixel resolution (600x600)
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
  LEADERBOARD: 'LEADERBOARD'
};

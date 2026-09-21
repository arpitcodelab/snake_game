import { GameMode } from './GameMode.js';

/**
 * Speed Demon Mode: Snake starts at 2x base speed and awards 2x point rewards.
 */
export class SpeedDemonMode extends GameMode {
  constructor() {
    super('speed_demon', 'Speed Demon', 'Starts at 2x speed with 2x point multipliers');
  }

  getSpeedModifier() {
    return 2.0; // Halves the tick ms interval
  }

  getScoreMultiplier() {
    return 2; // Doubles fruit points
  }
}

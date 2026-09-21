import { GameMode } from './GameMode.js';

/**
 * Classic Mode: Standard snake gameplay where walls and self collisions are fatal.
 */
export class ClassicMode extends GameMode {
  constructor() {
    super('classic', 'Classic', 'Standard snake — walls and self-collision are fatal');
  }
}

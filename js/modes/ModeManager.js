import { ClassicMode } from './ClassicMode.js';
import { NoWallsMode } from './NoWallsMode.js';
import { TwoHeadedMode } from './TwoHeadedMode.js';
import { MovingTargetsMode } from './MovingTargetsMode.js';
import { BrokenSnakeMode } from './BrokenSnakeMode.js';
import { SpeedDemonMode } from './SpeedDemonMode.js';

/**
 * ModeManager serves as a registry and factory for all game modes
 */
export class ModeManager {
  constructor() {
    this.modes = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register(new ClassicMode());
    this.register(new NoWallsMode());
    this.register(new TwoHeadedMode());
    this.register(new MovingTargetsMode());
    this.register(new BrokenSnakeMode());
    this.register(new SpeedDemonMode());
  }

  register(modeInstance) {
    this.modes.set(modeInstance.id, modeInstance);
  }

  /**
   * Retrieve mode by ID
   * @param {string} id
   * @returns {GameMode}
   */
  get(id) {
    return this.modes.get(id) || this.modes.get('classic');
  }

  /**
   * Get all registered modes for settings/menu selection
   * @returns {Array<{ id: string, name: string, description: string }>}
   */
  getAll() {
    return Array.from(this.modes.values()).map(m => ({
      id: m.id,
      name: m.name,
      description: m.description
    }));
  }
}

export const modeManager = new ModeManager();

import { GameMode } from './GameMode.js';

/**
 * Broken Snake Mode: Periodic gaps in the body create optical challenges
 * while preserving full collision physics.
 */
export class BrokenSnakeMode extends GameMode {
  constructor() {
    super('broken_snake', 'Broken Snake', 'Snake body has optical gaps — watch your step!');
  }

  /**
   * Hide every 3rd body segment (keeping head at 0 and tail at length-1 visible)
   */
  shouldRenderSegment(index, totalLength) {
    if (index === 0 || index === totalLength - 1) {
      return true;
    }
    // Skip rendering segment at every index divisible by 3
    return index % 3 !== 0;
  }
}


/**
 * Food Entity managing spawning, types, points, and timers
 */

export const FRUIT_TYPES = {
  APPLE: { id: 'apple', name: 'Terran Planet', points: 1, spriteIndex: 0, planetIndex: 0, weight: 60 },
  BANANA: { id: 'banana', name: 'Golden Ring Planet', points: 3, spriteIndex: 1, planetIndex: 3, weight: 15 },
  CHERRY: { id: 'cherry', name: 'Magma World', points: 3, spriteIndex: 6, planetIndex: 1, weight: 15 },
  STRAWBERRY: { id: 'strawberry', name: 'Nebula Giant', points: 3, spriteIndex: 7, planetIndex: 4, weight: 10 },
  GOLDEN: { id: 'golden', name: 'Solar Flare Star', points: 10, spriteIndex: 13, planetIndex: 18, duration: 5000 }
};

export class Food {
  constructor() {
    this.items = [];
    this.targetCount = 1;
    this.goldenSpawnCooldown = 15000; // Min ms between golden fruits
    this.lastGoldenSpawnTime = 0;
    this.goldenChance = 0.20; // 20% chance on standard fruit consumption
  }

  setTargetCount(count) {
    this.targetCount = Math.max(1, Math.min(5, count));
  }

  /**
   * Reset all food items and spawn initial set
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  reset(snakeBody, grid) {
    this.items = [];
    this.lastGoldenSpawnTime = performance.now();
    this.ensurePopulation(snakeBody, grid);
  }

  /**
   * Select a weighted random standard fruit
   */
  getRandomStandardFruit() {
    const pool = [
      FRUIT_TYPES.APPLE,
      FRUIT_TYPES.BANANA,
      FRUIT_TYPES.CHERRY,
      FRUIT_TYPES.STRAWBERRY
    ];
    const totalWeight = pool.reduce((acc, f) => acc + f.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const fruit of pool) {
      if (rand < fruit.weight) {
        return fruit;
      }
      rand -= fruit.weight;
    }
    return FRUIT_TYPES.APPLE;
  }

  /**
   * Find an unoccupied grid cell
   * @param {Array<object>} snakeBody
   * @param {object} grid
   * @returns {{x: number, y: number}|null}
   */
  findOpenCell(snakeBody, grid) {
    const occupied = new Set();
    
    // Mark snake body positions
    for (let i = 0; i < snakeBody.length; i++) {
      occupied.add(`${snakeBody[i].x},${snakeBody[i].y}`);
    }

    // Mark current food positions
    for (let i = 0; i < this.items.length; i++) {
      occupied.add(`${this.items[i].x},${this.items[i].y}`);
    }

    const totalCells = grid.cols * grid.rows;
    if (occupied.size >= totalCells) {
      return null; // Arena is completely full
    }

    // Try random sampling first (fast when board is mostly empty)
    for (let attempts = 0; attempts < 100; attempts++) {
      const rx = Math.floor(Math.random() * grid.cols);
      const ry = Math.floor(Math.random() * grid.rows);
      if (!occupied.has(`${rx},${ry}`)) {
        return { x: rx, y: ry };
      }
    }

    // Fallback: full grid scan if board is packed
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        if (!occupied.has(`${c},${r}`)) {
          return { x: c, y: r };
        }
      }
    }

    return null;
  }

  /**
   * Spawn a single standard fruit
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  spawnStandard(snakeBody, grid) {
    const pos = this.findOpenCell(snakeBody, grid);
    if (!pos) return;

    const fruit = this.getRandomStandardFruit();
    this.items.push({
      x: pos.x,
      y: pos.y,
      type: fruit.id,
      name: fruit.name,
      points: fruit.points,
      spriteIndex: fruit.spriteIndex,
      planetIndex: fruit.planetIndex ?? 0,
      isGolden: false,
      timer: 0,
      duration: 0
    });
  }

  /**
   * Spawn a timed golden fruit
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  spawnGolden(snakeBody, grid) {
    // Only one golden fruit at a time
    if (this.items.some(f => f.isGolden)) return;

    const pos = this.findOpenCell(snakeBody, grid);
    if (!pos) return;

    const fruit = FRUIT_TYPES.GOLDEN;
    this.items.push({
      x: pos.x,
      y: pos.y,
      type: fruit.id,
      name: fruit.name,
      points: fruit.points,
      spriteIndex: fruit.spriteIndex,
      planetIndex: fruit.planetIndex ?? 18,
      isGolden: true,
      timer: fruit.duration,
      duration: fruit.duration
    });
    this.lastGoldenSpawnTime = performance.now();
  }

  /**
   * Maintain the required standard fruit count on the board
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  ensurePopulation(snakeBody, grid) {
    const currentStandardCount = this.items.filter(f => !f.isGolden).length;
    const needed = this.targetCount - currentStandardCount;

    for (let i = 0; i < needed; i++) {
      this.spawnStandard(snakeBody, grid);
    }
  }

  /**
   * Handle food consumption
   * @param {object} foodItem
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  consume(foodItem, snakeBody, grid) {
    const index = this.items.indexOf(foodItem);
    if (index !== -1) {
      this.items.splice(index, 1);
    }

    // Opportunity to spawn golden fruit on consumption
    const now = performance.now();
    const canSpawnGolden = 
      !this.items.some(f => f.isGolden) && 
      (now - this.lastGoldenSpawnTime >= this.goldenSpawnCooldown) &&
      Math.random() < this.goldenChance;

    if (canSpawnGolden) {
      this.spawnGolden(snakeBody, grid);
    }

    // Ensure standard fruits remain at targetCount
    this.ensurePopulation(snakeBody, grid);
  }

  /**
   * Tick update for timed fruits
   * @param {number} deltaTime
   * @param {Array<object>} snakeBody
   * @param {object} grid
   */
  update(deltaTime, snakeBody, grid) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.isGolden) {
        item.timer -= deltaTime;
        if (item.timer <= 0) {
          // Expired, remove golden fruit
          this.items.splice(i, 1);
        }
      }
    }
    this.ensurePopulation(snakeBody, grid);
  }
}


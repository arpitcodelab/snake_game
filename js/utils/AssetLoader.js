/**
 * AssetLoader - Centralized image asset manager with caching and async preloading.
 * Safe for both browser and headless/test environments.
 */
class AssetLoader {
  constructor() {
    this.images = new Map();
    this.loaded = new Map();
    this.callbacks = [];
  }

  /**
   * Preload an image asset
   * @param {string} key - Unique identifier
   * @param {string} src - Path to image file
   * @returns {Promise<HTMLImageElement|null>}
   */
  load(key, src) {
    if (this.images.has(key)) {
      return Promise.resolve(this.images.get(key));
    }

    if (typeof Image === 'undefined') {
      // Headless / Node.js test environment
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loaded.set(key, true);
        this.notifyCallbacks(key, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn(`[AssetLoader] Failed to load asset: ${src}`, err);
        this.loaded.set(key, false);
        resolve(null);
      };
      img.src = src;
    });
  }

  /**
   * Preload standard game assets
   */
  preloadAll() {
    return Promise.all([
      this.load('board', 'assets/images/boaa.png'),
      this.load('planet', 'assets/images/planet.png')
    ]);
  }

  /**
   * Get loaded image instance
   * @param {string} key
   * @returns {HTMLImageElement|null}
   */
  get(key) {
    return this.images.get(key) || null;
  }

  /**
   * Check if asset is loaded and ready to draw
   * @param {string} key
   * @returns {boolean}
   */
  isReady(key) {
    const img = this.images.get(key);
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  /**
   * Register a callback when an asset is loaded
   * @param {Function} cb - (key, img) => void
   */
  onLoad(cb) {
    if (typeof cb === 'function') {
      this.callbacks.push(cb);
    }
  }

  notifyCallbacks(key, img) {
    for (const cb of this.callbacks) {
      try {
        cb(key, img);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const assetLoader = new AssetLoader();


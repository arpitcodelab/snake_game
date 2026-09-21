/**
 * Lightweight Pub/Sub EventBus for decoupled cross-system communication
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit an event with data
   * @param {string} event
   * @param {any} data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i](data);
      } catch (err) {
        console.error(`Error in event handler for "${event}":`, err);
      }
    }
  }
}

export const bus = new EventBus();


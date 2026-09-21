import { bus } from '../core/EventBus.js';

/**
 * Procedural Web Audio API sound generator for authentic retro / arcade sound effects.
 * Requires zero external audio assets, works instantly with zero network latency.
 */
export class AudioManager {
  constructor() {
    this._isMuted = false;
    this.ctx = null;

    if (typeof localStorage !== 'undefined') {
      this._isMuted = localStorage.getItem('snake_muted') === 'true';
    }
  }

  get isMuted() {
    return this._isMuted;
  }

  set isMuted(value) {
    this._isMuted = Boolean(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snake_muted', this._isMuted.toString());
    }
    bus.emit('audio:mute_changed', { isMuted: this._isMuted });
  }

  /**
   * Lazily initialize AudioContext on user interaction
   */
  initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;

    if (AudioContextClass) {
      try {
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio API not supported or blocked:', e);
      }
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Play fruit eating sound effect
   * @param {boolean} [isSpecial=false]
   * @param {boolean} [isGolden=false]
   */
  playEat(isSpecial = false, isGolden = false) {
    if (this._isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (isGolden) {
      // Golden fruit: 3-note sparkle chime
      const notes = [587.33, 783.99, 1046.50]; // D5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.13);
      });
      return;
    }

    if (isSpecial) {
      // Special fruit (banana, cherry, strawberry): 2-note ascending chime
      const notes = [523.25, 659.25]; // C5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.1);
      });
      return;
    }

    // Standard fruit: short pleasant blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Play game over death sound
   */
  playDie() {
    if (this._isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * Play celebratory high score fanfare
   */
  playHighScore() {
    if (this._isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.23);
    });
  }
}


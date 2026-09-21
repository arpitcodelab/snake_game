import { bus } from '../core/EventBus.js';

/**
 * AudioManager handles sound synthesis via Web Audio API
 * and manages mute/volume state with localStorage persistence.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.hasUnlocked = false;

    this.loadMuteState();
    this.setupUnlockListeners();
  }

  /**
   * Safe AudioContext getter (initializes on demand)
   */
  getAudioContext() {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Unlock AudioContext on first user gesture to satisfy browser autoplay policy
   */
  setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.hasUnlocked) return;
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        this.hasUnlocked = true;
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  loadMuteState() {
    try {
      if (typeof localStorage !== 'undefined') {
        this.isMuted = localStorage.getItem('snake_audio_muted') === 'true';
      }
    } catch (e) {
      console.warn('Could not load audio mute state:', e);
    }
  }

  saveMuteState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('snake_audio_muted', this.isMuted.toString());
      }
    } catch (e) {
      console.warn('Could not save audio mute state:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMuteState();
    bus.emit('audio:mute_changed', { isMuted: this.isMuted });
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    this.saveMuteState();
    bus.emit('audio:mute_changed', { isMuted: this.isMuted });
  }

  // ==========================================
  // PROCEDURAL SOUND SYNTHESIS
  // ==========================================

  /**
   * Play fruit eating sound
   * @param {boolean} isSpecial - If fruit is a 3pt special fruit
   * @param {boolean} isGolden - If fruit is the 10pt timed golden fruit
   */
  playEat(isSpecial = false, isGolden = false) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (isGolden) {
      // Golden fruit: celebratory 4-note sparkle arpeggio (C6 -> E6 -> G6 -> C7)
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
      return;
    }

    if (isSpecial) {
      // Special fruit: two-tone rising chime (520Hz -> 780Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(780, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
      return;
    }

    // Normal fruit: cheerful quick chirp sweep (380Hz -> 680Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Play death crash sound (descending sawtooth + noise crunch)
   */
  playDie() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Descending tone (220Hz -> 40Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);

    // 2. White noise burst for impact crunch
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.15);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.16);
    } catch (e) {
      // Noise buffer optional fallback
    }
  }

  /**
   * Play celebratory fanfare on new high score
   */
  playHighScore() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant fanfare notes: G4, C5, E5, G5
    const notes = [392.0, 523.25, 659.25, 783.99];
    const times = [0, 0.1, 0.2, 0.32];
    const durations = [0.08, 0.08, 0.1, 0.35];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + times[idx]);

      const startTime = now + times[idx];
      const dur = durations[idx];

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
    });
  }

  /**
   * Play subtle UI click
   */
  playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.03);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

import Phaser from 'phaser';
import { timePhase, musicVolume, sfxVolume, get, gameEvents } from '$lib/stores/gameStore';

/**
 * AudioSystem — generates synthetic farm ambient sounds using WebAudio.
 * Uses layered bird chirps, crickets, and wind instead of droning tones.
 */
export class AudioSystem {
  private scene: Phaser.Scene;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lastPhase = '';
  private muted = false;
  private ambientTimers: number[] = [];
  private volumeMultiplier = 0.5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }

    musicVolume.subscribe(v => {
      this.volumeMultiplier = v;
      if (this.masterGain) this.masterGain.gain.value = v;
    });

    // Wire events to SFX
    gameEvents.on('weather-change', () => this.playSFX('ambient'));
    gameEvents.on('rooster-crow', () => this.playSFX('crow'));

    // Start ambient after user interaction (autoplay policy)
    scene.input.once('pointerdown', () => {
      this.ctx?.resume();
      this.startAmbient();
    });
  }

  update() {
    const phase = get(timePhase);
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.updateAmbient(phase);
    }
  }

  // ─── SFX ─────────────────────────────────────────────────

  playSFX(type: 'crow' | 'egg_pop' | 'door_latch' | 'cluck' | 'clean' | 'ambient') {
    if (!this.ctx || this.muted) return;

    const vol = get(sfxVolume);
    if (vol <= 0) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.connect(this.ctx.destination);
      osc.connect(gain);

      const now = this.ctx.currentTime;

      switch (type) {
        case 'crow':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.2);
          osc.frequency.linearRampToValueAtTime(400, now + 0.5);
          gain.gain.setValueAtTime(0.15 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'egg_pop':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.05);
          gain.gain.setValueAtTime(0.2 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'door_latch':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.05);
          gain.gain.setValueAtTime(0.12 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'cluck':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + Math.random() * 100, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.08);
          gain.gain.setValueAtTime(0.08 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;

        case 'clean':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.15);
          osc.frequency.linearRampToValueAtTime(200, now + 0.3);
          gain.gain.setValueAtTime(0.1 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'ambient':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(0.03 * vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
      }
    } catch {
      // Silently fail
    }
  }

  // ─── Farm Ambient Sounds ────────────────────────────────

  private startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    this.updateAmbient(get(timePhase));
  }

  private updateAmbient(phase: string) {
    // Clear existing ambient loops
    for (const timer of this.ambientTimers) {
      clearTimeout(timer);
    }
    this.ambientTimers = [];

    if (!this.ctx || !this.masterGain) return;

    switch (phase) {
      case 'dawn':
        // Gentle bird chirps starting up, light breeze
        this.scheduleLoop(() => this.playBirdChirp(0.04), 2000, 5000);
        this.scheduleLoop(() => this.playBreeze(0.02), 4000, 8000);
        break;
      case 'morning':
        // Active birds, occasional breeze
        this.scheduleLoop(() => this.playBirdChirp(0.06), 1200, 3500);
        this.scheduleLoop(() => this.playBirdTrill(0.04), 3000, 7000);
        this.scheduleLoop(() => this.playBreeze(0.015), 5000, 12000);
        break;
      case 'afternoon':
        // Fewer birds, warm breeze, occasional insect buzz
        this.scheduleLoop(() => this.playBirdChirp(0.04), 3000, 6000);
        this.scheduleLoop(() => this.playBreeze(0.02), 4000, 9000);
        this.scheduleLoop(() => this.playInsectBuzz(0.02), 4000, 8000);
        break;
      case 'evening':
        // Crickets starting, occasional bird
        this.scheduleLoop(() => this.playCrickets(0.05), 1500, 3500);
        this.scheduleLoop(() => this.playBirdChirp(0.025), 5000, 10000);
        this.scheduleLoop(() => this.playBreeze(0.015), 6000, 12000);
        break;
      case 'night':
        // Crickets, soft breeze, occasional owl
        this.scheduleLoop(() => this.playCrickets(0.04), 1200, 3000);
        this.scheduleLoop(() => this.playBreeze(0.01), 5000, 10000);
        this.scheduleLoop(() => this.playOwlHoot(0.03), 8000, 20000);
        break;
    }
  }

  /** Schedule a sound to play at random intervals */
  private scheduleLoop(fn: () => void, minMs: number, maxMs: number) {
    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      const timer = window.setTimeout(() => {
        if (!this.muted && this.volumeMultiplier > 0) {
          fn();
        }
        schedule();
      }, delay);
      this.ambientTimers.push(timer);
    };
    // Start with a short random initial delay
    const initialDelay = Math.random() * minMs;
    const timer = window.setTimeout(() => {
      if (!this.muted && this.volumeMultiplier > 0) {
        fn();
      }
      schedule();
    }, initialDelay);
    this.ambientTimers.push(timer);
  }

  // ─── Individual Ambient Sound Generators ────────────────

  /** Short bird chirp — two quick rising tones */
  private playBirdChirp(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const baseFreq = 1800 + Math.random() * 1200; // Vary between birds
      const now = this.ctx.currentTime;

      // First chirp
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.linearRampToValueAtTime(baseFreq * 1.3, now + 0.06);
      gain1.gain.setValueAtTime(volume, now);
      gain1.gain.linearRampToValueAtTime(0, now + 0.08);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Second chirp (slightly higher, after tiny gap)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.1, now + 0.12);
      osc2.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.18);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(volume * 0.8, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0, now + 0.2);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.2);
    } catch { /* fail silently */ }
  }

  /** Warbling bird trill — rapid frequency modulation */
  private playBirdTrill(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 2200 + Math.random() * 800;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      lfo.frequency.setValueAtTime(25 + Math.random() * 15, now); // Trill speed
      lfoGain.gain.setValueAtTime(200, now); // Trill depth

      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.2);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.35);
      lfo.stop(now + 0.35);
    } catch { /* fail silently */ }
  }

  /** Gentle breeze — filtered noise */
  private playBreeze(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const duration = 1.5 + Math.random() * 2;

      // White noise via buffer
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + Math.random() * 200, now);
      filter.Q.setValueAtTime(0.5, now);

      const gain = this.ctx.createGain();
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // Gentle swell and fade
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + duration * 0.3);
      gain.gain.linearRampToValueAtTime(volume * 0.6, now + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      source.start(now);
      source.stop(now + duration);
    } catch { /* fail silently */ }
  }

  /** Cricket chirps — rapid high-pitched clicks */
  private playCrickets(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const chirpCount = 3 + Math.floor(Math.random() * 4);
      const baseFreq = 4000 + Math.random() * 1000;

      for (let i = 0; i < chirpCount; i++) {
        const t = now + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        gain.gain.setValueAtTime(volume * 0.6, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch { /* fail silently */ }
  }

  /** Insect buzz — low wobbling tone */
  private playInsectBuzz(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 + Math.random() * 60, now);
      lfo.frequency.setValueAtTime(40, now);
      lfoGain.gain.setValueAtTime(30, now);

      const duration = 0.3 + Math.random() * 0.4;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + duration);
      lfo.stop(now + duration);
    } catch { /* fail silently */ }
  }

  /** Owl hoot — two low, soft tones */
  private playOwlHoot(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;

      // First hoot (higher)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(420, now);
      osc1.frequency.linearRampToValueAtTime(380, now + 0.3);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(volume, now + 0.05);
      gain1.gain.linearRampToValueAtTime(volume * 0.8, now + 0.2);
      gain1.gain.linearRampToValueAtTime(0, now + 0.35);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second hoot (lower, after pause)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(340, now + 0.5);
      osc2.frequency.linearRampToValueAtTime(300, now + 0.9);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(volume * 0.9, now + 0.5);
      gain2.gain.linearRampToValueAtTime(0, now + 0.95);
      osc2.start(now + 0.5);
      osc2.stop(now + 0.95);
    } catch { /* fail silently */ }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volumeMultiplier;
    }
    // Clear ambient sounds when muting
    if (this.muted) {
      for (const timer of this.ambientTimers) {
        clearTimeout(timer);
      }
      this.ambientTimers = [];
    } else {
      this.startAmbient();
    }
  }
}

import Phaser from 'phaser';
import { timePhase, musicVolume, sfxVolume, get, gameEvents } from '$lib/stores/gameStore';

/**
 * AudioSystem — generates synthetic placeholder sounds using WebAudio.
 * Real audio assets can replace these later by loading actual files.
 */
export class AudioSystem {
  private scene: Phaser.Scene;
  private ctx: AudioContext | null = null;
  private currentMusic: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private lastPhase = '';
  private muted = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    try {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.08;
      this.musicGain.connect(this.ctx.destination);
    } catch {
      // WebAudio not available
      this.ctx = null;
    }

    // Subscribe to volume changes
    musicVolume.subscribe(v => {
      if (this.musicGain) this.musicGain.gain.value = v * 0.08;
    });

    // Wire events to SFX
    gameEvents.on('weather-change', () => this.playSFX('ambient'));
    gameEvents.on('rooster-crow', () => this.playSFX('crow'));

    // Start music after user interaction (autoplay policy)
    scene.input.once('pointerdown', () => {
      this.ctx?.resume();
      this.startMusic();
    });
  }

  update() {
    const phase = get(timePhase);
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.updateMusic(phase);
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
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'egg_pop':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.05);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'door_latch':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.05);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'cluck':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + Math.random() * 100, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;

        case 'clean':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.15);
          osc.frequency.linearRampToValueAtTime(200, now + 0.3);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'ambient':
          // Short ambient note on weather change
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
      }
    } catch {
      // Silently fail
    }
  }

  // ─── Music ───────────────────────────────────────────────

  private startMusic() {
    if (!this.ctx || !this.musicGain) return;
    this.updateMusic(get(timePhase));
  }

  private updateMusic(phase: string) {
    if (!this.ctx || !this.musicGain) return;

    // Stop current music
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch { /* already stopped */ }
      this.currentMusic = null;
    }

    try {
      const osc = this.ctx.createOscillator();
      osc.connect(this.musicGain);

      // Different ambient tone per phase
      switch (phase) {
        case 'dawn':
          osc.type = 'sine';
          osc.frequency.value = 220; // A3
          this.musicGain.gain.value = 0.04;
          break;
        case 'morning':
        case 'afternoon':
          osc.type = 'sine';
          osc.frequency.value = 262; // C4
          this.musicGain.gain.value = 0.03;
          break;
        case 'evening':
          osc.type = 'sine';
          osc.frequency.value = 196; // G3
          this.musicGain.gain.value = 0.04;
          break;
        case 'night':
          osc.type = 'sine';
          osc.frequency.value = 165; // E3
          this.musicGain.gain.value = 0.02;
          break;
      }

      osc.start();
      this.currentMusic = osc;
    } catch {
      // Silently fail
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.musicGain) {
      this.musicGain.gain.value = this.muted ? 0 : 0.03;
    }
  }
}

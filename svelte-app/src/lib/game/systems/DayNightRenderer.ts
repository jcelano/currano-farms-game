import Phaser from 'phaser';
import { CONFIG, type DayPhase, type Season } from '../config';
import { gameTime, timePhase, get } from '$lib/stores/gameStore';

// Phase darkness levels (0 = full light, 1 = full dark)
const PHASE_DARKNESS: Record<DayPhase, { start: number; end: number }> = {
  dawn:      { start: 0.55, end: 0.0 },
  morning:   { start: 0.0,  end: 0.0 },
  afternoon: { start: 0.0,  end: 0.0 },
  evening:   { start: 0.0,  end: 0.45 },
  night:     { start: 0.55, end: 0.55 },
};

// Phase tint colors (blended with darkness)
const PHASE_TINTS: Record<DayPhase, number> = {
  dawn:      0xff9944, // Warm orange sunrise
  morning:   0x000000, // No tint
  afternoon: 0x000000, // No tint
  evening:   0xff6622, // Sunset orange-red
  night:     0x1a1a4e, // Deep blue
};

// Season ambient tint (subtle)
const SEASON_TINTS: Record<Season, { color: number; alpha: number }> = {
  spring:  { color: 0x88ff88, alpha: 0.03 },
  summer:  { color: 0xffff44, alpha: 0.05 },
  fall:    { color: 0xff9933, alpha: 0.06 },
  winter:  { color: 0x8888cc, alpha: 0.08 },
};

export class DayNightRenderer {
  private darkOverlay: Phaser.GameObjects.Rectangle;
  private tintOverlay: Phaser.GameObjects.Rectangle;
  private seasonOverlay: Phaser.GameObjects.Rectangle;

  constructor(private scene: Phaser.Scene) {
    const cam = scene.cameras.main;
    const w = CONFIG.display.baseWidth * 3;  // Oversized to cover camera movement
    const h = CONFIG.display.baseHeight * 3;

    // Dark overlay (black, controls brightness)
    this.darkOverlay = scene.add.rectangle(0, 0, w, h, 0x000000, 0);
    this.darkOverlay.setScrollFactor(0);
    this.darkOverlay.setDepth(90);
    this.darkOverlay.setOrigin(0, 0);
    this.darkOverlay.setPosition(-w / 4, -h / 4);

    // Color tint overlay (dawn/sunset/night color)
    this.tintOverlay = scene.add.rectangle(0, 0, w, h, 0x000000, 0);
    this.tintOverlay.setScrollFactor(0);
    this.tintOverlay.setDepth(89);
    this.tintOverlay.setOrigin(0, 0);
    this.tintOverlay.setPosition(-w / 4, -h / 4);

    // Season ambient overlay (very subtle)
    this.seasonOverlay = scene.add.rectangle(0, 0, w, h, 0x000000, 0);
    this.seasonOverlay.setScrollFactor(0);
    this.seasonOverlay.setDepth(88);
    this.seasonOverlay.setOrigin(0, 0);
    this.seasonOverlay.setPosition(-w / 4, -h / 4);
  }

  update() {
    const state = get(gameTime);
    const phase = get(timePhase);

    // Calculate phase progress (0-1)
    const progress = this.getPhaseProgress(state.hour, state.minute, phase);

    // Darkness
    const darkness = PHASE_DARKNESS[phase];
    const alpha = Phaser.Math.Linear(darkness.start, darkness.end, progress);
    this.darkOverlay.setAlpha(alpha);

    // Color tint
    const tintColor = PHASE_TINTS[phase];
    this.tintOverlay.setFillStyle(tintColor, alpha * 0.4);

    // Season tint
    const seasonTint = SEASON_TINTS[state.season];
    this.seasonOverlay.setFillStyle(seasonTint.color, seasonTint.alpha);
  }

  private getPhaseProgress(hour: number, minute: number, phase: DayPhase): number {
    const range = CONFIG.time.phases[phase];
    const currentMinutes = hour * 60 + minute;
    let startMinutes = range.start * 60;
    let endMinutes = range.end * 60;

    if (range.start > range.end) {
      endMinutes += 24 * 60;
      const adjusted = currentMinutes < range.start
        ? currentMinutes + 24 * 60
        : currentMinutes;
      return Math.max(0, Math.min(1, (adjusted - startMinutes) / (endMinutes - startMinutes)));
    }

    return Math.max(0, Math.min(1, (currentMinutes - startMinutes) / (endMinutes - startMinutes)));
  }
}

import Phaser from 'phaser';
import { CONFIG } from '../config';
import type { Chicken } from '../entities/Chicken';
import { coopCleanliness, gameTime, get, addNotification } from '$lib/stores/gameStore';

export class CoopCleaningSystem {
  private lastHour = -1;
  private dirtyOverlay: Phaser.GameObjects.Rectangle;

  constructor(private scene: Phaser.Scene, private chickens: Chicken[]) {
    const tileSize = CONFIG.map.tileSize;
    // Dark overlay on coop floor (visible when dirty)
    this.dirtyOverlay = scene.add.rectangle(
      (4 + 5) * tileSize, (44 + 5) * tileSize, // Center of coop
      10 * tileSize, 10 * tileSize,
      0x3d2b1f, 0,
    );
    this.dirtyOverlay.setDepth(0.8);
  }

  update() {
    const { hour, season } = get(gameTime);
    if (hour === this.lastHour) return;
    this.lastHour = hour;

    // Decay cleanliness
    const decay = CONFIG.chickens.coop.cleanlinessDecayPerHour;
    coopCleanliness.update(v => Math.max(0, v - decay));

    const cleanliness = get(coopCleanliness);

    // Health penalty when critical
    if (cleanliness <= CONFIG.chickens.coop.criticalThreshold) {
      for (const chicken of this.chickens) {
        chicken.health = Math.max(0, chicken.health - CONFIG.chickens.coop.healthPenaltyPerHour);
        chicken.syncToStore();
      }
    }

    // Update dirty visual
    if (cleanliness <= CONFIG.chickens.coop.dirtyThreshold) {
      const alpha = Math.min(0.5, (CONFIG.chickens.coop.dirtyThreshold - cleanliness) / CONFIG.chickens.coop.dirtyThreshold * 0.5);
      this.dirtyOverlay.setAlpha(alpha);
    } else {
      this.dirtyOverlay.setAlpha(0);
    }

    // Warning notifications
    if (cleanliness === CONFIG.chickens.coop.dirtyThreshold) {
      addNotification('The coop is getting dirty. Time to clean!', 'warning');
    }
    if (cleanliness === CONFIG.chickens.coop.criticalThreshold) {
      addNotification('Coop is filthy! Chickens are losing health!', 'danger');
    }
  }

  clean() {
    coopCleanliness.set(100);
    this.dirtyOverlay.setAlpha(0);
    addNotification('Coop cleaned! Sparkly fresh.', 'positive');
  }
}

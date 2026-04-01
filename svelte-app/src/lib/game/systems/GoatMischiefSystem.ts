import Phaser from 'phaser';
import { CONFIG } from '../config';
import type { Goat } from '../entities/Goat';
import { fenceSections, gameTime, get, addNotification } from '$lib/stores/gameStore';
import { ZONE_DEFS } from './ZoneManager';

const TILE = 32;

const PEN_BOUNDS = (() => {
  const z = ZONE_DEFS.find(z => z.name === 'goat_pen')!;
  return { minX: z.x * TILE + 10, maxX: (z.x + z.width) * TILE - 10, minY: z.y * TILE + 10, maxY: (z.y + z.height) * TILE - 10 };
})();

// When escaped, goats roam freely in a wide area around the pen
const ROAM_BOUNDS = {
  minX: 10 * TILE,
  maxX: 60 * TILE,
  minY: 20 * TILE,
  maxY: 50 * TILE,
};

export class GoatMischiefSystem {
  private lastHour = -1;
  private escapeCheckTimer = 0;

  constructor(private goatEntities: Goat[]) {}

  update(delta: number) {
    const { hour } = get(gameTime);

    // Mischief grows hourly
    if (hour !== this.lastHour) {
      this.lastHour = hour;
      for (const goat of this.goatEntities) {
        const growth = goat.personality === 'troublemaker'
          ? CONFIG.goats.mischief.growthPerHour * CONFIG.goats.mischief.troublemakerGrowthMultiplier
          : CONFIG.goats.mischief.growthPerHour;
        goat.mischief = Math.min(100, goat.mischief + growth);
        goat.syncToStore();
      }
    }

    // Check escape attempts every 10 seconds (game time)
    this.escapeCheckTimer += delta;
    if (this.escapeCheckTimer < 10000) return;
    this.escapeCheckTimer = 0;

    for (const goat of this.goatEntities) {
      if (goat.escaped) {
        addNotification(`${goat.goatName} is wandering the farm!`, 'warning');
        continue;
      }

      if (goat.mischief < CONFIG.goats.mischief.escapeAttemptThreshold) continue;

      this.attemptEscape(goat);
    }
  }

  private attemptEscape(goat: Goat) {
    const sections = get(fenceSections);
    const penFences = [7, 8, 9, 10].map(i => ({ index: i, health: sections[i - 1] ?? 100 }));
    const weakest = penFences.reduce((a, b) => a.health < b.health ? a : b);

    let chance: number;
    if (weakest.health <= CONFIG.fences.brokenThreshold) {
      chance = CONFIG.goats.mischief.escapeSuccessChance.brokenFence;
    } else if (weakest.health <= CONFIG.fences.weakThreshold) {
      chance = CONFIG.goats.mischief.escapeSuccessChance.damagedFence;
    } else {
      chance = CONFIG.goats.mischief.escapeSuccessChance.goodFence;
    }

    if (goat.personality === 'escape-artist') {
      chance += CONFIG.goats.mischief.spikeEscapeBonus;
    }

    fenceSections.update(s => {
      s[weakest.index - 1] = Math.max(0, s[weakest.index - 1] - CONFIG.fences.goatTestDamage);
      return [...s];
    });

    if (Math.random() < chance) {
      goat.escaped = true;
      goat.setBounds(ROAM_BOUNDS);
      goat.setPosition(
        ROAM_BOUNDS.minX + Phaser.Math.Between(50, 200),
        ROAM_BOUNDS.minY + Phaser.Math.Between(50, 200),
      );
      addNotification(`${goat.goatName} escaped from the pen!`, 'danger');
    } else {
      addNotification(`${goat.goatName} is testing the fences...`, 'warning');
    }
  }

  /** Return escaped goat to pen */
  returnGoat(goat: Goat) {
    goat.escaped = false;
    goat.mischief = Math.max(0, goat.mischief - 20);
    goat.setBounds(PEN_BOUNDS);
    goat.setPosition(
      PEN_BOUNDS.minX + Phaser.Math.Between(20, 100),
      PEN_BOUNDS.minY + Phaser.Math.Between(20, 100),
    );
    goat.syncToStore();
    addNotification(`${goat.goatName} has been returned to the pen.`, 'positive');
  }
}

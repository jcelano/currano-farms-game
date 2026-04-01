import Phaser from 'phaser';
import { CONFIG } from '../config';
import type { Goat } from '../entities/Goat';
import { fenceSections, gameTime, get, addNotification } from '$lib/stores/gameStore';
import { ZONE_DEFS } from './ZoneManager';

const TILE = 32;
const GARDEN_BOUNDS = (() => {
  const z = ZONE_DEFS.find(z => z.name === 'veg_garden')!;
  return { minX: z.x * TILE, maxX: (z.x + z.width) * TILE, minY: z.y * TILE, maxY: (z.y + z.height) * TILE };
})();

const PEN_BOUNDS = (() => {
  const z = ZONE_DEFS.find(z => z.name === 'goat_pen')!;
  return { minX: z.x * TILE + 10, maxX: (z.x + z.width) * TILE - 10, minY: z.y * TILE + 10, maxY: (z.y + z.height) * TILE - 10 };
})();

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
        // Goat is loose — check if in garden zone (raids crops)
        if (this.isInGarden(goat)) {
          addNotification(`${goat.goatName} is eating your vegetables!`, 'danger');
        }
        continue;
      }

      if (goat.mischief < CONFIG.goats.mischief.escapeAttemptThreshold) continue;

      // Try to escape
      this.attemptEscape(goat);
    }
  }

  private attemptEscape(goat: Goat) {
    const sections = get(fenceSections);
    // Goat pen uses fence sections 7-10
    const penFences = [7, 8, 9, 10].map(i => ({ index: i, health: sections[i - 1] ?? 100 }));

    // Find weakest fence
    const weakest = penFences.reduce((a, b) => a.health < b.health ? a : b);

    let chance: number;
    if (weakest.health <= CONFIG.fences.brokenThreshold) {
      chance = CONFIG.goats.mischief.escapeSuccessChance.brokenFence;
    } else if (weakest.health <= CONFIG.fences.weakThreshold) {
      chance = CONFIG.goats.mischief.escapeSuccessChance.damagedFence;
    } else {
      chance = CONFIG.goats.mischief.escapeSuccessChance.goodFence;
    }

    // Spike gets escape bonus
    if (goat.personality === 'escape-artist') {
      chance += CONFIG.goats.mischief.spikeEscapeBonus;
    }

    // Damage the fence from testing
    fenceSections.update(s => {
      s[weakest.index - 1] = Math.max(0, s[weakest.index - 1] - CONFIG.fences.goatTestDamage);
      return [...s];
    });

    if (Math.random() < chance) {
      goat.escaped = true;
      // Move goat toward garden
      goat.setBounds({
        minX: GARDEN_BOUNDS.minX - 100,
        maxX: GARDEN_BOUNDS.maxX + 100,
        minY: GARDEN_BOUNDS.minY - 100,
        maxY: GARDEN_BOUNDS.maxY + 100,
      });
      goat.setPosition(GARDEN_BOUNDS.minX + 50, GARDEN_BOUNDS.minY + 50);
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

  private isInGarden(goat: Goat): boolean {
    return goat.x >= GARDEN_BOUNDS.minX && goat.x <= GARDEN_BOUNDS.maxX &&
           goat.y >= GARDEN_BOUNDS.minY && goat.y <= GARDEN_BOUNDS.maxY;
  }
}

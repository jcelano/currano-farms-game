import { CONFIG } from '../config';
import type { Chicken } from '../entities/Chicken';
import type { Goat } from '../entities/Goat';
import type { Horse } from '../entities/Horse';
import type { Cat } from '../entities/Cat';
import { waterLevels, gameTime, get, addNotification } from '$lib/stores/gameStore';

/**
 * WaterSystem — drains waterer levels over time and auto-waters animals
 * when waterer has enough water.
 */
export class WaterSystem {
  private lastHour = -1;
  private chickens: Chicken[] = [];
  private goats: Goat[] = [];
  private horses: Horse[] = [];
  private cats: Cat[] = [];

  // Map waterer IDs to which animals they serve
  private watererAnimals: Record<string, { animals: () => any[]; waterFill: number }> = {};

  constructor(
    chickens: Chicken[], goats: Goat[], horses: Horse[], cats: Cat[],
  ) {
    this.chickens = chickens;
    this.goats = goats;
    this.horses = horses;
    this.cats = cats;

    this.watererAnimals = {
      'chicken-waterer': { animals: () => this.chickens, waterFill: CONFIG.chickens.thirst.watererFill },
      'goat-waterer': { animals: () => this.goats, waterFill: CONFIG.goats.thirst.waterFill },
      'horse-water': { animals: () => this.horses, waterFill: CONFIG.horses.thirst.waterFill },
      'cat-water': { animals: () => this.cats, waterFill: CONFIG.cats.thirst.waterFill },
    };
  }

  update() {
    const { hour } = get(gameTime);
    if (hour === this.lastHour) return;
    this.lastHour = hour;

    const levels = get(waterLevels);
    const threshold = CONFIG.water.animalDrinkThreshold;

    for (const [watererId, config] of Object.entries(this.watererAnimals)) {
      let level = levels[watererId] ?? 0;

      // Drain over time
      level = Math.max(0, level - CONFIG.water.drainPerHour);

      // Animals drink if water available
      if (level > threshold) {
        const animals = config.animals();
        for (const animal of animals) {
          if (animal.thirst < 80) { // Only drink if thirsty
            const drinkAmount = Math.min(CONFIG.water.animalDrinkRate, level - threshold);
            animal.water(drinkAmount);
            animal.syncToStore?.();
            level = Math.max(threshold, level - 2); // Each animal drains a bit
          }
        }
      }

      levels[watererId] = Math.max(0, level);
    }

    waterLevels.set({ ...levels });

    // Warn if any waterer is critically low
    for (const [id, level] of Object.entries(levels)) {
      if (level <= threshold && level > 0) {
        const name = id.replace(/-/g, ' ').replace('water', 'waterer');
        addNotification(`${name} is almost empty!`, 'warning');
      }
    }
  }
}

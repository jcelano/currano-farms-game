import { CONFIG } from '../config';
import type { Cat } from '../entities/Cat';
import { gameTime, get, addNotification } from '$lib/stores/gameStore';

export class CatAttentionSystem {
  private lastHour = -1;
  private lastDay = -1;
  private meowedThisHour = false;

  constructor(private catEntities: Cat[]) {}

  update() {
    const { hour, day, season } = get(gameTime);

    // Hourly ticks
    if (hour !== this.lastHour) {
      this.lastHour = hour;
      this.meowedThisHour = false;

      const isWinter = season === 'winter';

      for (const cat of this.catEntities) {
        // Attention decay (cats are very needy)
        cat.attention = Math.max(0, cat.attention - CONFIG.cats.attention.decayPerHour);

        // Winter heated bed check
        if (isWinter) {
          cat.happiness = Math.max(0, cat.happiness - CONFIG.cats.heatedBed.happinessDropWithoutPerHour);
        }

        // Loud meowing when attention is low
        if (cat.attention < CONFIG.cats.attention.loudMeowThreshold && !this.meowedThisHour) {
          addNotification(`${cat.catName} is meowing loudly for attention!`, 'warning');
          this.meowedThisHour = true;
        }

        // Scratching furniture when very low
        if (cat.attention < CONFIG.cats.attention.scratchFurnitureThreshold) {
          addNotification(`${cat.catName} is scratching the furniture!`, 'danger');
        }

        cat.syncToStore();
      }
    }

    // Daily ticks
    if (day !== this.lastDay) {
      this.lastDay = day;

      for (const cat of this.catEntities) {
        // Flea collar decay
        cat.fleaCollar = Math.max(0, cat.fleaCollar - CONFIG.cats.fleaCollar.decayPerDay);

        // Health risk when flea collar is very low
        if (cat.fleaCollar <= CONFIG.cats.fleaCollar.healthRiskThreshold) {
          cat.health = Math.max(0, cat.health - 1);
          addNotification(`${cat.catName} needs a new flea collar!`, 'danger');
        } else if (cat.fleaCollar <= CONFIG.cats.fleaCollar.itchingThreshold) {
          addNotification(`${cat.catName} is scratching — flea collar wearing off`, 'warning');
        }

        cat.syncToStore();
      }
    }
  }
}

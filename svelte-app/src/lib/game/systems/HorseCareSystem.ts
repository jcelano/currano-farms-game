import { CONFIG } from '../config';
import type { Horse } from '../entities/Horse';
import { gameTime, get, addNotification } from '$lib/stores/gameStore';

export class HorseCareSystem {
  private lastHour = -1;
  private lastDay = -1;

  constructor(private horses: Horse[]) {}

  update() {
    const { hour, day, season } = get(gameTime);

    // Hourly ticks
    if (hour !== this.lastHour) {
      this.lastHour = hour;
      const isSpring = season === 'spring';

      for (const horse of this.horses) {
        // Coat decay (faster in spring)
        const coatRate = isSpring ? CONFIG.horses.coat.decayPerHour.spring : CONFIG.horses.coat.decayPerHour.normal;
        horse.coat = Math.max(0, horse.coat - coatRate);

        // Grazing happiness boost if in paddock
        horse.happiness = Math.min(100, horse.happiness + CONFIG.horses.grazing.happinessBoostPerHour / 2);

        horse.syncToStore();
      }
    }

    // Daily ticks
    if (day !== this.lastDay) {
      this.lastDay = day;

      for (const horse of this.horses) {
        // Hoof decay
        horse.hoofCondition = Math.max(0, horse.hoofCondition - CONFIG.horses.hoof.decayPerDay);

        // Training decay
        horse.training = Math.max(0, horse.training - CONFIG.horses.training.decayPerDay);

        // Warn about limping
        if (horse.hoofCondition <= CONFIG.horses.hoof.limpThreshold && horse.hoofCondition > CONFIG.horses.hoof.limpThreshold - 2) {
          addNotification(`${horse.horseName} is limping! Schedule a farrier visit.`, 'warning');
        }

        horse.syncToStore();
      }
    }
  }
}

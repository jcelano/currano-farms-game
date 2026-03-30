import { CONFIG } from '../config';
import { fenceSections, gameTime, gameEvents, get, addNotification } from '$lib/stores/gameStore';

export class FenceSystem {
  private lastDay = -1;

  constructor() {
    // Storm damage
    gameEvents.on('weather-change', (detail) => {
      const { condition } = detail as { condition: string };
      if (condition === 'thunderstorm') {
        this.applyStormDamage();
      }
    });
  }

  update() {
    const { day } = get(gameTime);
    if (day === this.lastDay) return;
    this.lastDay = day;

    // Daily natural decay
    fenceSections.update(sections => {
      return sections.map(h => Math.max(0, h - CONFIG.fences.decayPerDay));
    });

    // Check for any critically weak sections
    const sections = get(fenceSections);
    const broken = sections.filter(h => h <= CONFIG.fences.brokenThreshold).length;
    if (broken > 0) {
      addNotification(`${broken} fence section${broken > 1 ? 's are' : ' is'} broken! Repair immediately.`, 'warning');
    }
  }

  private applyStormDamage() {
    const { min, max } = CONFIG.fences.stormDamage;
    fenceSections.update(sections => {
      return sections.map(h => {
        if (Math.random() < 0.3) { // 30% chance per section
          const damage = Math.floor(Math.random() * (max - min + 1)) + min;
          return Math.max(0, h - damage);
        }
        return h;
      });
    });
    addNotification('Storm damaged some fence sections!', 'danger');
  }

  repairSection(index: number) {
    fenceSections.update(sections => {
      sections[index] = CONFIG.fences.maxHealth;
      return [...sections];
    });
  }
}

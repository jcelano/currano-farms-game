import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Chick } from '../entities/Chick';
import type { Chicken } from '../entities/Chicken';
import type { Egg } from '../entities/Egg';
import { gameTime, gameEvents, eggs as eggsStore, get, addNotification } from '$lib/stores/gameStore';

interface BroodyEntry {
  hen: Chicken;
  startDay: number;
  egg: Egg | null;
}

export class HatchingSystem {
  private broodyHens: BroodyEntry[] = [];
  private chicks: Chick[] = [];
  private checkedToday = false;

  constructor(
    private scene: Phaser.Scene,
    private chickens: Chicken[],
    private getEggs: () => Egg[],
  ) {
    gameEvents.on('new-day', () => {
      this.checkedToday = false;
      this.checkBroody();
      this.checkHatching();
    });
  }

  update() {
    // Update chicks
    for (let i = this.chicks.length - 1; i >= 0; i--) {
      const chick = this.chicks[i];
      chick.update();
      if (chick.grown) {
        this.chicks.splice(i, 1);
      }
    }
  }

  private checkBroody() {
    if (this.broodyHens.length >= CONFIG.chickens.eggs.maxBroody) return;

    const eggs = this.getEggs();
    if (eggs.length === 0) return;

    const hens = this.chickens.filter(
      c => c.role === 'hen' && c.health > 0 && !c.isBroody,
    );

    for (const hen of hens) {
      if (Math.random() < CONFIG.chickens.eggs.broodyChance) {
        hen.isBroody = true;
        this.broodyHens.push({
          hen,
          startDay: get(gameTime).totalDays,
          egg: eggs[0] || null,
        });
        addNotification(`${hen.chickenName} has gone broody and is sitting on an egg!`, 'info');

        if (this.broodyHens.length >= CONFIG.chickens.eggs.maxBroody) break;
      }
    }
  }

  private checkHatching() {
    const { totalDays } = get(gameTime);

    for (let i = this.broodyHens.length - 1; i >= 0; i--) {
      const entry = this.broodyHens[i];
      const daysElapsed = totalDays - entry.startDay;

      if (daysElapsed >= CONFIG.chickens.eggs.hatchTimeDays) {
        // Hatch!
        const chick = new Chick(this.scene, entry.hen);
        this.chicks.push(chick);

        // Remove the egg entity if it still exists
        if (entry.egg && !entry.egg.scene) {
          // Already destroyed
        } else if (entry.egg) {
          entry.egg.destroy();
        }

        // Un-broody the hen
        entry.hen.isBroody = false;
        this.broodyHens.splice(i, 1);
      }
    }
  }

  getChicks(): Chick[] {
    return this.chicks;
  }
}

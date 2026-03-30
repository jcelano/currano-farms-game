import { CONFIG } from '../config';
import type { Chicken } from '../entities/Chicken';
import type { Goat } from '../entities/Goat';
import type { Horse } from '../entities/Horse';
import type { Cat } from '../entities/Cat';
import { gameTime, gameEvents, get } from '$lib/stores/gameStore';

export class AnimalStatSystem {
  private lastHour = -1;
  private goatEntities: Goat[] = [];
  private horseEntities: Horse[] = [];
  private catEntities: Cat[] = [];

  constructor(private chickens: Chicken[]) {
    gameEvents.on('new-day', () => {
      this.lastHour = CONFIG.time.playerWakeHour;
    });
  }

  setGoats(goats: Goat[]) { this.goatEntities = goats; }
  setHorses(horses: Horse[]) { this.horseEntities = horses; }
  setCats(cats: Cat[]) { this.catEntities = cats; }

  update() {
    const { hour } = get(gameTime);
    if (hour === this.lastHour) return;
    this.lastHour = hour;

    this.tickChickens();
    this.tickGoats();
    this.tickHorses();
    this.tickCats();
  }

  private tickChickens() {
    const season = get(gameTime).season;
    const isSummer = season === 'summer';
    const stats = CONFIG.animalStats;

    for (const chicken of this.chickens) {
      chicken.hunger = Math.max(0, chicken.hunger - CONFIG.chickens.hunger.decayPerHour);
      const thirstRate = isSummer ? CONFIG.chickens.thirst.decayPerHour.summer : CONFIG.chickens.thirst.decayPerHour.normal;
      chicken.thirst = Math.max(0, chicken.thirst - thirstRate);
      chicken.happiness = Math.max(0, chicken.happiness - stats.happinessDecayBase);
      chicken.cleanliness = Math.max(0, chicken.cleanliness - stats.cleanlinessDecayBase);
      if (chicken.hunger <= stats.criticalThreshold || chicken.thirst <= stats.criticalThreshold) {
        chicken.health = Math.max(0, chicken.health - stats.healthDecayWhenCritical);
      }
      chicken.syncToStore();
    }
  }

  private tickGoats() {
    const season = get(gameTime).season;
    const isSummer = season === 'summer';
    const stats = CONFIG.animalStats;

    for (const goat of this.goatEntities) {
      goat.hunger = Math.max(0, goat.hunger - CONFIG.goats.hunger.decayPerHour);
      const thirstRate = isSummer ? CONFIG.goats.thirst.decayPerHour.summer : CONFIG.goats.thirst.decayPerHour.normal;
      goat.thirst = Math.max(0, goat.thirst - thirstRate);
      goat.happiness = Math.max(0, goat.happiness - stats.happinessDecayBase);
      goat.cleanliness = Math.max(0, goat.cleanliness - stats.cleanlinessDecayBase);
      if (goat.hunger <= stats.criticalThreshold || goat.thirst <= stats.criticalThreshold) {
        goat.health = Math.max(0, goat.health - stats.healthDecayWhenCritical);
      }
      goat.syncToStore();
    }
  }

  private tickHorses() {
    const season = get(gameTime).season;
    const isSummer = season === 'summer';
    const stats = CONFIG.animalStats;

    for (const horse of this.horseEntities) {
      horse.hunger = Math.max(0, horse.hunger - CONFIG.horses.hunger.decayPerHour);
      const thirstKey = isSummer ? 'summer' : 'normal';
      horse.thirst = Math.max(0, horse.thirst - CONFIG.horses.thirst.decayPerHour[thirstKey]);
      horse.happiness = Math.max(0, horse.happiness - stats.happinessDecayBase);
      horse.cleanliness = Math.max(0, horse.cleanliness - stats.cleanlinessDecayBase);
      if (horse.hunger <= stats.criticalThreshold || horse.thirst <= stats.criticalThreshold) {
        horse.health = Math.max(0, horse.health - stats.healthDecayWhenCritical);
      }
      horse.syncToStore();
    }
  }

  private tickCats() {
    const stats = CONFIG.animalStats;

    for (const cat of this.catEntities) {
      cat.hunger = Math.max(0, cat.hunger - CONFIG.cats.hunger.decayPerHour);
      cat.thirst = Math.max(0, cat.thirst - CONFIG.cats.thirst.decayPerHour);
      cat.happiness = Math.max(0, cat.happiness - stats.happinessDecayBase);
      if (cat.hunger <= stats.criticalThreshold || cat.thirst <= stats.criticalThreshold) {
        cat.health = Math.max(0, cat.health - stats.healthDecayWhenCritical);
      }
      cat.syncToStore();
    }
  }
}

import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Egg } from '../entities/Egg';
import type { Chicken } from '../entities/Chicken';
import {
  eggs, collectedEggs, playerMoney, gameTime, gameEvents, get,
  addNotification, type EggState,
} from '$lib/stores/gameStore';

export class EggSystem {
  private eggEntities: Egg[] = [];
  private eggIdCounter = 0;
  private henTimers: Map<number, number> = new Map(); // chickenId -> game minutes until next egg
  private nestingArea = { x: 5 * 32, y: 45 * 32, w: 8 * 32, h: 3 * 32 }; // Inside coop

  constructor(
    private scene: Phaser.Scene,
    private chickens: Chicken[],
  ) {
    // Initialize egg timers for each hen
    for (const chicken of chickens) {
      if (chicken.role === 'hen') {
        this.resetTimer(chicken.chickenId);
      }
    }

    // Check spoilage on new day
    gameEvents.on('new-day', () => this.checkSpoilage());
  }

  update() {
    const { hour, minute } = get(gameTime);

    // Only tick once per game minute (TimeSystem already handles this via store)
    for (const chicken of this.chickens) {
      if (chicken.role !== 'hen') continue;

      const timer = this.henTimers.get(chicken.chickenId);
      if (timer === undefined) continue;

      // Decrease timer (1 per game minute, modified by happiness)
      const happinessBonus = chicken.happiness > 50 ? CONFIG.chickens.eggs.happinessLayBonus : 1.0;
      const newTimer = timer - happinessBonus;

      if (newTimer <= 0) {
        this.layEgg(chicken);
        this.resetTimer(chicken.chickenId);
      } else {
        this.henTimers.set(chicken.chickenId, newTimer);
      }
    }
  }

  private resetTimer(chickenId: number) {
    const { min, max } = CONFIG.chickens.eggs.layIntervalDays;
    const days = min + Math.random() * (max - min);
    const minutes = days * 24 * 60; // Convert days to game minutes
    this.henTimers.set(chickenId, minutes);
  }

  private layEgg(chicken: Chicken) {
    const isBlue = CONFIG.chickens.eggs.blueEggBreeds.includes(chicken.breed);
    const { totalDays } = get(gameTime);

    // Position randomly in nesting area
    const x = this.nestingArea.x + Phaser.Math.Between(10, this.nestingArea.w - 10);
    const y = this.nestingArea.y + Phaser.Math.Between(10, this.nestingArea.h - 10);

    const id = this.eggIdCounter++;
    const egg = new Egg(this.scene, id, chicken.chickenName, totalDays, isBlue, x, y);
    this.eggEntities.push(egg);

    // Update store
    this.syncToStore();

    addNotification(`${chicken.chickenName} laid ${isBlue ? 'a blue' : 'an'} egg!`, 'positive');
  }

  private checkSpoilage() {
    const { totalDays } = get(gameTime);
    for (const egg of this.eggEntities) {
      if (!egg.spoiled && totalDays - egg.layDay >= CONFIG.chickens.eggs.spoilTimeDays) {
        egg.markSpoiled();
      }
    }
    this.syncToStore();
  }

  /** Gather all eggs (called from nesting box interactable) */
  gatherEggs() {
    let white = 0;
    let blue = 0;
    let spoiledCount = 0;

    for (const egg of this.eggEntities) {
      if (egg.spoiled) {
        spoiledCount++;
      } else if (egg.isBlue) {
        blue++;
      } else {
        white++;
      }
      egg.destroy();
    }

    this.eggEntities = [];

    if (white > 0 || blue > 0) {
      collectedEggs.update(c => ({
        white: c.white + white,
        blue: c.blue + blue,
      }));
      addNotification(`Gathered ${white + blue} egg${white + blue > 1 ? 's' : ''}!`, 'positive');
    }

    if (spoiledCount > 0) {
      const penalty = spoiledCount * CONFIG.economy.spoiledEggPenalty;
      playerMoney.update(m => Math.max(0, m - penalty));
      addNotification(`${spoiledCount} spoiled egg${spoiledCount > 1 ? 's' : ''} (-$${penalty})`, 'warning');
    }

    this.syncToStore();
  }

  hasEggs(): boolean {
    return this.eggEntities.length > 0;
  }

  private syncToStore() {
    const { totalDays } = get(gameTime);
    const eggStates: EggState[] = this.eggEntities.map(e => ({
      id: e.eggId,
      henName: e.henName,
      layDay: e.layDay,
      isBlue: e.isBlue,
      spoiled: e.spoiled,
      x: e.x,
      y: e.y,
    }));
    eggs.set(eggStates);
  }
}

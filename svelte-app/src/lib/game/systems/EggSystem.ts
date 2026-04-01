import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Egg } from '../entities/Egg';
import type { Chicken } from '../entities/Chicken';
import {
  eggs, collectedEggs, playerMoney, playerPosition, gameTime, gameEvents, get,
  addNotification, type EggState,
} from '$lib/stores/gameStore';

const PICKUP_RADIUS = 24; // pixels — walk over to collect

export class EggSystem {
  private eggEntities: Egg[] = [];
  private eggIdCounter = 0;
  private henTimers: Map<number, number> = new Map();
  private nestingArea = { x: 5 * 32, y: 45 * 32, w: 8 * 32, h: 3 * 32 }; // Inside coop
  private pickupCooldown = 0;
  private audioSystem: { playSFX: (type: 'crow' | 'egg_pop' | 'door_latch' | 'cluck' | 'clean' | 'ambient') => void } | null = null;

  constructor(
    private scene: Phaser.Scene,
    private chickens: Chicken[],
  ) {
    for (const chicken of chickens) {
      if (chicken.role === 'hen') {
        this.resetTimer(chicken.chickenId);
      }
    }
    gameEvents.on('new-day', () => this.checkSpoilage());
  }

  setAudioSystem(audio: { playSFX: (type: 'crow' | 'egg_pop' | 'door_latch' | 'cluck' | 'clean' | 'ambient') => void }) {
    this.audioSystem = audio;
  }

  update() {
    const { hour, minute } = get(gameTime);

    // Tick egg-laying timers
    for (const chicken of this.chickens) {
      if (chicken.role !== 'hen') continue;
      const timer = this.henTimers.get(chicken.chickenId);
      if (timer === undefined) continue;

      const happinessBonus = chicken.happiness > 50 ? CONFIG.chickens.eggs.happinessLayBonus : 1.0;
      const newTimer = timer - happinessBonus;

      if (newTimer <= 0) {
        this.layEgg(chicken);
        this.resetTimer(chicken.chickenId);
      } else {
        this.henTimers.set(chicken.chickenId, newTimer);
      }
    }

    // Walk-over egg collection
    if (this.pickupCooldown > 0) {
      this.pickupCooldown -= this.scene.game.loop.delta;
    }
    if (this.eggEntities.length > 0 && this.pickupCooldown <= 0) {
      this.checkWalkOverPickup();
    }
  }

  private checkWalkOverPickup() {
    const pos = get(playerPosition);
    const toRemove: Egg[] = [];

    for (const egg of this.eggEntities) {
      const dist = Phaser.Math.Distance.Between(pos.x, pos.y, egg.x, egg.y);
      if (dist < PICKUP_RADIUS) {
        toRemove.push(egg);
      }
    }

    for (const egg of toRemove) {
      this.collectSingleEgg(egg);
      this.pickupCooldown = 150; // Brief cooldown for staggered feel
    }
  }

  private collectSingleEgg(egg: Egg) {
    if (egg.spoiled) {
      const penalty = CONFIG.economy.spoiledEggPenalty;
      playerMoney.update(m => Math.max(0, m - penalty));
      addNotification(`Picked up a spoiled egg (-$${penalty})`, 'warning');
    } else {
      const type = egg.isBlue ? 'blue' : 'white';
      collectedEggs.update(c => ({
        white: c.white + (egg.isBlue ? 0 : 1),
        blue: c.blue + (egg.isBlue ? 1 : 0),
      }));
      addNotification(`Picked up ${egg.isBlue ? 'a blue' : 'an'} egg!`, 'positive');
    }

    // Play pop sound
    this.audioSystem?.playSFX('egg_pop');

    // Remove egg
    egg.destroy();
    this.eggEntities = this.eggEntities.filter(e => e !== egg);
    this.syncToStore();
  }

  private resetTimer(chickenId: number) {
    const { min, max } = CONFIG.chickens.eggs.layIntervalDays;
    const days = min + Math.random() * (max - min);
    const minutes = days * 24 * 60;
    this.henTimers.set(chickenId, minutes);
  }

  private layEgg(chicken: Chicken) {
    const isBlue = CONFIG.chickens.eggs.blueEggBreeds.includes(chicken.breed);
    const { totalDays } = get(gameTime);

    const x = this.nestingArea.x + Phaser.Math.Between(10, this.nestingArea.w - 10);
    const y = this.nestingArea.y + Phaser.Math.Between(10, this.nestingArea.h - 10);

    const id = this.eggIdCounter++;
    const egg = new Egg(this.scene, id, chicken.chickenName, totalDays, isBlue, x, y);
    this.eggEntities.push(egg);
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

  /** Gather all eggs (legacy method, kept for compatibility) */
  gatherEggs() {
    let white = 0;
    let blue = 0;
    let spoiledCount = 0;

    for (const egg of this.eggEntities) {
      if (egg.spoiled) { spoiledCount++; }
      else if (egg.isBlue) { blue++; }
      else { white++; }
      egg.destroy();
    }
    this.eggEntities = [];

    if (white > 0 || blue > 0) {
      collectedEggs.update(c => ({ white: c.white + white, blue: c.blue + blue }));
      addNotification(`Gathered ${white + blue} egg${white + blue > 1 ? 's' : ''}!`, 'positive');
    }
    if (spoiledCount > 0) {
      const penalty = spoiledCount * CONFIG.economy.spoiledEggPenalty;
      playerMoney.update(m => Math.max(0, m - penalty));
      addNotification(`${spoiledCount} spoiled egg${spoiledCount > 1 ? 's' : ''} (-$${penalty})`, 'warning');
    }
    if (white === 0 && blue === 0 && spoiledCount === 0) {
      addNotification('No eggs to gather yet.', 'info');
    }
    this.syncToStore();
  }

  hasEggs(): boolean {
    return this.eggEntities.length > 0;
  }

  private syncToStore() {
    const eggStates: EggState[] = this.eggEntities.map(e => ({
      id: e.eggId, henName: e.henName, layDay: e.layDay,
      isBlue: e.isBlue, spoiled: e.spoiled, x: e.x, y: e.y,
    }));
    eggs.set(eggStates);
  }
}

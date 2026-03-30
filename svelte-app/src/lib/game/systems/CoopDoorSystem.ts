import { CONFIG } from '../config';
import type { Chicken } from '../entities/Chicken';
import { coopDoorOpen, gameTime, timePhase, get, addNotification } from '$lib/stores/gameStore';

const TILE = 32;

// Bounds when door is closed (coop interior only)
const COOP_BOUNDS = {
  minX: 4 * TILE + 10,
  maxX: (4 + 10) * TILE - 10,
  minY: 44 * TILE + 10,
  maxY: (44 + 10) * TILE - 10,
};

// Bounds when door is open (coop + yard)
const YARD_BOUNDS = {
  minX: 4 * TILE + 10,
  maxX: (4 + 14) * TILE - 10,
  minY: 36 * TILE + 10,
  maxY: (44 + 10) * TILE - 10,
};

export class CoopDoorSystem {
  private isOpen = false;
  private lastPhase = '';

  constructor(private chickens: Chicken[]) {
    coopDoorOpen.subscribe(v => {
      this.isOpen = v;
      this.updateChickenBounds();
    });
  }

  toggle() {
    const newState = !this.isOpen;
    coopDoorOpen.set(newState);
    addNotification(
      newState ? 'Coop door opened - chickens can free range' : 'Coop door closed - chickens secured',
      'info',
    );
  }

  update() {
    const phase = get(timePhase);

    // Warn player if door is still open at evening
    if (phase === 'evening' && this.lastPhase !== 'evening' && this.isOpen) {
      addNotification('The coop door is still open! Close it before night to protect your chickens.', 'warning');
    }

    // Apply free-range happiness boost hourly (handled by AnimalStatSystem via store check)
    this.lastPhase = phase;
  }

  /** Check if chickens are free-ranging (door open) */
  isFreeRanging(): boolean {
    return this.isOpen;
  }

  /** Get the predator multiplier based on door state and time */
  getPredatorMultiplier(): number {
    const phase = get(timePhase);
    if (this.isOpen && (phase === 'night' || phase === 'evening')) {
      return CONFIG.chickens.coop.unlockedPredatorMultiplier;
    }
    if (this.isOpen) {
      return CONFIG.chickens.freeRange.vulnerabilityMultiplier;
    }
    return 1.0; // Door closed = normal (low) risk
  }

  private updateChickenBounds() {
    const bounds = this.isOpen ? YARD_BOUNDS : COOP_BOUNDS;
    for (const chicken of this.chickens) {
      chicken.setBounds(bounds);
    }
  }
}

import Phaser from 'phaser';
import { CONFIG } from '../config';
import type { Chicken } from '../entities/Chicken';
import {
  dailyCrowCount, playerMoney, gameTime, gameEvents, get,
  addNotification,
} from '$lib/stores/gameStore';

export class RoosterSystem {
  private crowTimer = 0;
  private nextCrowInterval = 0;
  private complained = false;

  constructor(private rooster: Chicken | undefined) {
    this.resetCrowTimer();

    // Reset daily counter
    gameEvents.on('new-day', () => {
      dailyCrowCount.set(0);
      this.complained = false;
    });
  }

  update(deltaMs: number) {
    if (!this.rooster || this.rooster.health <= 0) return;

    // Convert delta to game minutes (at current speed)
    const gameMinutes = deltaMs / CONFIG.time.msPerGameMinute;

    this.crowTimer -= gameMinutes;
    if (this.crowTimer <= 0) {
      this.crow();
      this.resetCrowTimer();
    }
  }

  private crow() {
    const count = get(dailyCrowCount) + 1;
    dailyCrowCount.set(count);
    gameEvents.emit('rooster-crow');

    const threshold = CONFIG.chickens.rooster.neighborComplaintThreshold;

    if (count >= threshold && !this.complained) {
      this.complained = true;
      const fine = CONFIG.chickens.rooster.complaintPenalty;
      playerMoney.update(m => Math.max(0, m - fine));
      addNotification(`Neighbor complaint! Rooster crowed ${count} times today. (-$${fine})`, 'danger');
    }
  }

  private resetCrowTimer() {
    const { min, max } = CONFIG.chickens.rooster.crowIntervalMinutes;
    let interval = Phaser.Math.Between(min, max);

    // Happy rooster crows more often
    if (this.rooster && this.rooster.happiness > 50) {
      interval = Math.round(interval / CONFIG.chickens.rooster.crowHappinessMultiplier);
    }

    this.nextCrowInterval = interval;
    this.crowTimer = interval;
  }
}

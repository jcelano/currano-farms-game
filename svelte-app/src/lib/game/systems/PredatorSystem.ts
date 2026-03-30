import Phaser from 'phaser';
import { CONFIG, type Season } from '../config';
import { PredatorEntity, type PredatorType } from '../entities/Predator';
import type { Chicken } from '../entities/Chicken';
import type { CoopDoorSystem } from './CoopDoorSystem';
import {
  gameTime, timePhase, currentWeather, playerPosition, get,
  addNotification,
} from '$lib/stores/gameStore';

export class PredatorSystem {
  private activePredator: PredatorEntity | null = null;
  private checkTimer = 0;
  private checkInterval = 60000; // Check every 60 real seconds (= 1 game hour at 1x)
  private attackedTonight = false;
  private attackedToday = false;

  constructor(
    private scene: Phaser.Scene,
    private chickens: Chicken[],
    private coopDoor: CoopDoorSystem,
  ) {
    // Attack flags reset handled in trySpawnPredator at dawn
  }

  update(delta: number) {
    // Update active predator
    if (this.activePredator) {
      const pos = get(playerPosition);
      const status = this.activePredator.update(delta, pos.x, pos.y);

      if (status === 'arrived') {
        this.executeAttack();
        this.removePredator();
      } else if (status === 'fled') {
        addNotification('You scared off the predator!', 'positive');
        this.removePredator();
      } else if (status === 'expired') {
        this.removePredator();
      }
      return;
    }

    // Check for new predator spawn
    this.checkTimer += delta;
    if (this.checkTimer < this.checkInterval) return;
    this.checkTimer = 0;

    this.trySpawnPredator();
  }

  private trySpawnPredator() {
    const phase = get(timePhase);
    const { season } = get(gameTime);
    const weather = get(currentWeather);

    // Fox: active at evening/night
    if ((phase === 'evening' || phase === 'night') && !this.attackedTonight) {
      const foxCfg = CONFIG.predators.fox;
      let chance = foxCfg.baseAttackChance;
      chance *= foxCfg.seasonMultiplier[season] ?? 1.0;
      chance *= this.coopDoor.getPredatorMultiplier();

      // If coop door is closed, fox is prevented
      if (!this.coopDoor.isFreeRanging() && phase === 'night') {
        chance = 0; // Locked coop prevents fox
      }

      if (Math.random() < chance) {
        this.spawnPredator('fox');
        this.attackedTonight = true;
        return;
      }
    }

    // Hawk: active during daytime, only if chickens free-ranging
    if ((phase === 'morning' || phase === 'afternoon') && !this.attackedToday) {
      if (!this.coopDoor.isFreeRanging()) return; // Chickens in coop = safe
      if (weather.condition === 'thunderstorm') return; // Suppressed

      const hawkCfg = CONFIG.predators.hawk;
      let chance = hawkCfg.baseAttackChance;
      chance *= hawkCfg.seasonMultiplier[season] ?? 1.0;

      if (Math.random() < chance) {
        this.spawnPredator('hawk');
        this.attackedToday = true;
        return;
      }
    }

    // Reset flags at dawn
    if (phase === 'dawn') {
      this.attackedTonight = false;
      this.attackedToday = false;
    }
  }

  private spawnPredator(type: PredatorType) {
    const tileSize = CONFIG.map.tileSize;

    // Pick a random chicken as target
    const aliveChickens = this.chickens.filter(c => c.health > 0);
    if (aliveChickens.length === 0) return;
    const target = Phaser.Utils.Array.GetRandom(aliveChickens);

    // Spawn from woods edge
    let startX: number, startY: number;
    if (type === 'fox') {
      // From left or right woods edge
      const fromLeft = Math.random() > 0.5;
      startX = fromLeft ? 2 * tileSize : (CONFIG.map.widthTiles - 2) * tileSize;
      startY = target.y;
      addNotification('Something is rustling at the fence line...', 'warning');
    } else {
      // Hawk from sky (above target)
      startX = target.x + Phaser.Math.Between(-200, 200);
      startY = target.y - 300;
      addNotification('A shadow passes over the yard...', 'warning');
    }

    this.activePredator = new PredatorEntity(
      this.scene, type, startX, startY, target.x, target.y,
    );
  }

  private executeAttack() {
    const aliveChickens = this.chickens.filter(c => c.health > 0);
    if (aliveChickens.length === 0) return;

    const victim = Phaser.Utils.Array.GetRandom(aliveChickens);
    const damage = this.activePredator!.predatorType === 'fox'
      ? CONFIG.predators.fox.healthDamage
      : CONFIG.predators.hawk.healthDamage;

    victim.health = Math.max(0, victim.health - damage);
    victim.syncToStore();

    const predName = this.activePredator!.predatorType === 'fox' ? 'A fox' : 'A hawk';

    if (victim.health <= 0) {
      addNotification(`${predName} killed ${victim.chickenName}!`, 'danger');
    } else {
      addNotification(`${predName} attacked ${victim.chickenName}! (-${damage} health)`, 'danger');
    }
  }

  private removePredator() {
    if (this.activePredator) {
      this.activePredator.destroy();
      this.activePredator = null;
    }
  }
}

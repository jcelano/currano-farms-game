import Phaser from 'phaser';
import { CONFIG } from '../config';

export type PredatorType = 'fox' | 'hawk';

export class PredatorEntity extends Phaser.GameObjects.Ellipse {
  public predatorType: PredatorType;
  public fleeing = false;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private lifespan = 0;
  private maxLifespan: number;

  constructor(
    scene: Phaser.Scene,
    type: PredatorType,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
  ) {
    const size = type === 'fox' ? 14 : 20;
    const color = type === 'fox' ? 0xcc4400 : 0x333333;
    const alpha = type === 'hawk' ? 0.4 : 0.9; // Hawk is a shadow

    super(scene, startX, startY, size, size * (type === 'fox' ? 0.7 : 1), color, alpha);

    this.predatorType = type;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = type === 'fox' ? CONFIG.predators.fox.speed : CONFIG.predators.hawk.speed;
    this.maxLifespan = 15000; // 15 seconds max before despawn

    scene.add.existing(this);
    this.setDepth(type === 'hawk' ? 2 : 4); // Hawk shadow is below chickens
  }

  update(delta: number, playerX: number, playerY: number): 'approaching' | 'arrived' | 'fled' | 'expired' {
    this.lifespan += delta;

    if (this.lifespan > this.maxLifespan) {
      return 'expired';
    }

    const scareRadius = this.predatorType === 'fox'
      ? CONFIG.predators.fox.scareRadius
      : CONFIG.predators.hawk.scareRadius;

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    // Player scares predator
    if (distToPlayer < scareRadius) {
      this.fleeing = true;
    }

    if (this.fleeing) {
      // Run away from player
      const angle = Phaser.Math.Angle.Between(playerX, playerY, this.x, this.y);
      this.x += Math.cos(angle) * this.speed * 2 * (delta / 1000);
      this.y += Math.sin(angle) * this.speed * 2 * (delta / 1000);
      this.setAlpha(Math.max(0, this.alpha - delta * 0.001)); // Fade out
      if (this.alpha <= 0.05) return 'fled';
      return 'approaching'; // Still fleeing
    }

    // Move toward target
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
    if (dist < 20) {
      return 'arrived'; // Ready to attack
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
    this.x += Math.cos(angle) * this.speed * (delta / 1000);
    this.y += Math.sin(angle) * this.speed * (delta / 1000);

    return 'approaching';
  }
}

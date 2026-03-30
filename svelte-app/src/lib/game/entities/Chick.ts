import Phaser from 'phaser';
import type { Chicken } from './Chicken';
import { chickCount, gameTime, get, addNotification } from '$lib/stores/gameStore';

export class Chick extends Phaser.GameObjects.Arc {
  public birthDay: number;
  public parentHen: Chicken;
  public grown = false;
  private followOffset = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, parentHen: Chicken) {
    super(scene, parentHen.x + 10, parentHen.y + 10, 4, 0, 360, false, 0xffdd00, 1);

    this.parentHen = parentHen;
    this.birthDay = get(gameTime).totalDays;

    scene.add.existing(this);
    this.setDepth(4);

    // Random follow offset so chicks don't stack
    this.followOffset = {
      x: Phaser.Math.Between(-15, 15),
      y: Phaser.Math.Between(5, 15),
    };

    chickCount.update(n => n + 1);
    addNotification(`A chick hatched from ${parentHen.chickenName}'s egg!`, 'positive');
  }

  update() {
    if (this.grown) return;

    const { totalDays } = get(gameTime);
    const age = totalDays - this.birthDay;

    // Growth check
    if (age >= 14) {
      this.grown = true;
      addNotification('A chick has grown into an adult chicken!', 'positive');
      this.destroy();
      return;
    }

    // Grow size slightly over time
    const growthFactor = 1 + (age / 14) * 0.8;
    this.setRadius(4 * growthFactor);

    // Follow parent hen
    const targetX = this.parentHen.x + this.followOffset.x;
    const targetY = this.parentHen.y + this.followOffset.y;
    this.x += (targetX - this.x) * 0.05;
    this.y += (targetY - this.y) * 0.05;
  }
}

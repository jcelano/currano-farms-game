import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SpriteFactory } from '../art/SpriteFactory';
import { horses, get, type HorseState } from '$lib/stores/gameStore';

export class Horse extends Phaser.Physics.Arcade.Sprite {
  public horseId: number;
  public horseName: string;
  public breed: string;
  public horseColor: number;

  public hunger = 75;
  public thirst = 75;
  public happiness = 70;
  public health = 100;
  public cleanliness = 80;
  public coat = 85;
  public hoofCondition = 90;
  public training = 30;

  private bounds: { minX: number; maxX: number; minY: number; maxY: number };
  private wanderTimer = 0;
  private statusDot: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene, id: number,
    config: { name: string; breed: string; color: number },
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
  ) {
    const key = `horse_${id}`;
    SpriteFactory.generateHorse(scene, id, config.color);

    const startX = Phaser.Math.Between(bounds.minX + 30, bounds.maxX - 30);
    const startY = Phaser.Math.Between(bounds.minY + 30, bounds.maxY - 30);

    super(scene, startX, startY, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.horseId = id;
    this.horseName = config.name;
    this.breed = config.breed;
    this.horseColor = config.color;
    this.bounds = bounds;

    this.setDepth(4);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(20, 12).setOffset(4, 8);

    this.statusDot = scene.add.circle(startX, startY - 16, 4, 0x00ff00).setDepth(6);
    this.nameLabel = scene.add.text(startX, startY - 24, config.name, {
      fontSize: '10px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this.wanderTimer = Phaser.Math.Between(2000, 5000);
  }

  update(playerX: number, playerY: number) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.nameLabel.setVisible(dist < 100);

    // Limping when hoof condition is low
    const isLimping = this.hoofCondition < CONFIG.horses.hoof.limpThreshold;
    const speed = isLimping ? 10 : Phaser.Math.Between(15, 35);

    this.wanderTimer -= this.scene.game.loop.delta;
    if (this.wanderTimer <= 0) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.wanderTimer = Phaser.Math.Between(2000, 5000); // Slower pace than chickens
    }

    this.constrainToBounds();
    this.statusDot.setPosition(this.x, this.y - 16);
    this.nameLabel.setPosition(this.x, this.y - 24);
    this.updateStatusDot();
  }

  private constrainToBounds() {
    const m = 15;
    if (this.x < this.bounds.minX + m) this.setVelocityX(Math.abs(this.body!.velocity.x));
    if (this.x > this.bounds.maxX - m) this.setVelocityX(-Math.abs(this.body!.velocity.x));
    if (this.y < this.bounds.minY + m) this.setVelocityY(Math.abs(this.body!.velocity.y));
    if (this.y > this.bounds.maxY - m) this.setVelocityY(-Math.abs(this.body!.velocity.y));
  }

  private updateStatusDot() {
    const worst = Math.min(this.hunger, this.thirst, this.happiness, this.health, this.coat, this.hoofCondition);
    if (worst <= CONFIG.animalStats.criticalThreshold) this.statusDot.setFillStyle(0xff0000);
    else if (worst <= CONFIG.animalStats.warningThreshold) this.statusDot.setFillStyle(0xffff00);
    else this.statusDot.setFillStyle(0x00ff00);
  }

  setBounds(b: { minX: number; maxX: number; minY: number; maxY: number }) { this.bounds = b; }
  feed(amount: number) { this.hunger = Math.min(100, this.hunger + amount); }
  water(amount: number) { this.thirst = Math.min(100, this.thirst + amount); }
  brush(amount: number) { this.coat = Math.min(100, this.coat + amount); }
  distanceTo(x: number, y: number) { return Phaser.Math.Distance.Between(this.x, this.y, x, y); }

  syncToStore() {
    horses.update(list => {
      const state: HorseState = {
        id: this.horseId, name: this.horseName, breed: this.breed, color: this.horseColor,
        hunger: Math.round(this.hunger), thirst: Math.round(this.thirst),
        happiness: Math.round(this.happiness), health: Math.round(this.health),
        cleanliness: Math.round(this.cleanliness), coat: Math.round(this.coat),
        hoofCondition: Math.round(this.hoofCondition), training: Math.round(this.training),
      };
      const idx = list.findIndex(h => h.id === this.horseId);
      if (idx >= 0) list[idx] = state; else list.push(state);
      return [...list];
    });
  }
}

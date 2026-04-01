import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SpriteFactory } from '../art/SpriteFactory';
import { goats, get, type GoatState } from '$lib/stores/gameStore';

export class Goat extends Phaser.Physics.Arcade.Sprite {
  public goatId: number;
  public goatName: string;
  public personality: string;
  public goatColor: number;

  public hunger = 80;
  public thirst = 80;
  public happiness = 70;
  public health = 100;
  public cleanliness = 80;
  public mischief = 20;
  public hoofCondition = 90;
  public escaped = false;

  private bounds: { minX: number; maxX: number; minY: number; maxY: number };
  private wanderTimer = 0;
  private statusDot: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene, id: number,
    config: { name: string; personality: string; color: number },
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
  ) {
    const key = `goat_${id}`;
    SpriteFactory.generateGoat(scene, id, config.color);

    const startX = Phaser.Math.Between(bounds.minX + 20, bounds.maxX - 20);
    const startY = Phaser.Math.Between(bounds.minY + 20, bounds.maxY - 20);

    super(scene, startX, startY, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.goatId = id;
    this.goatName = config.name;
    this.personality = config.personality;
    this.goatColor = config.color;
    this.bounds = bounds;

    // Troublemakers start with higher mischief
    if (config.personality === 'troublemaker') {
      this.mischief = 40;
    }

    this.setDepth(4);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(14, 10).setOffset(3, 6);

    this.statusDot = scene.add.circle(startX, startY - 12, 3, 0x00ff00).setDepth(6);
    this.nameLabel = scene.add.text(startX, startY - 20, config.name, {
      fontSize: '9px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this.wanderTimer = Phaser.Math.Between(1000, 3000);
  }

  update(playerX: number, playerY: number) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.nameLabel.setVisible(dist < 80);

    // Mischievous movement when mischief is high
    const speed = this.mischief > 50 ? Phaser.Math.Between(25, 60) : Phaser.Math.Between(10, 30);

    this.wanderTimer -= this.scene.game.loop.delta;
    if (this.wanderTimer <= 0) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.wanderTimer = Phaser.Math.Between(1000, 3000);
    }

    this.constrainToBounds();
    this.statusDot.setPosition(this.x, this.y - 12);
    this.nameLabel.setPosition(this.x, this.y - 20);
    this.updateStatusDot();
  }

  private constrainToBounds() {
    const m = 10;
    if (this.x < this.bounds.minX + m) this.setVelocityX(Math.abs(this.body!.velocity.x));
    if (this.x > this.bounds.maxX - m) this.setVelocityX(-Math.abs(this.body!.velocity.x));
    if (this.y < this.bounds.minY + m) this.setVelocityY(Math.abs(this.body!.velocity.y));
    if (this.y > this.bounds.maxY - m) this.setVelocityY(-Math.abs(this.body!.velocity.y));
  }

  private updateStatusDot() {
    const worst = Math.min(this.hunger, this.thirst, this.happiness, this.health);
    if (this.mischief > CONFIG.goats.mischief.escapeAttemptThreshold) {
      this.statusDot.setFillStyle(0xff8800); // Orange = mischievous
    } else if (worst <= CONFIG.animalStats.criticalThreshold) {
      this.statusDot.setFillStyle(0xff0000);
    } else if (worst <= CONFIG.animalStats.warningThreshold) {
      this.statusDot.setFillStyle(0xffff00);
    } else {
      this.statusDot.setFillStyle(0x00ff00);
    }
  }

  setBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }) {
    this.bounds = bounds;
  }

  feed(amount: number) { this.hunger = Math.min(100, this.hunger + amount); }
  water(amount: number) { this.thirst = Math.min(100, this.thirst + amount); }
  distanceTo(x: number, y: number) { return Phaser.Math.Distance.Between(this.x, this.y, x, y); }

  syncToStore() {
    goats.update(list => {
      const state: GoatState = {
        id: this.goatId, name: this.goatName, personality: this.personality, color: this.goatColor,
        hunger: Math.round(this.hunger), thirst: Math.round(this.thirst),
        happiness: Math.round(this.happiness), health: Math.round(this.health),
        cleanliness: Math.round(this.cleanliness), mischief: Math.round(this.mischief),
        hoofCondition: Math.round(this.hoofCondition), escaped: this.escaped,
      };
      const idx = list.findIndex(g => g.id === this.goatId);
      if (idx >= 0) list[idx] = state; else list.push(state);
      return [...list];
    });
  }
}

import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SpriteFactory } from '../art/SpriteFactory';
import { cats, get, type CatState } from '$lib/stores/gameStore';

export class Cat extends Phaser.Physics.Arcade.Sprite {
  public catId: number;
  public catName: string;
  public catColor: number;
  public pattern: string;

  public hunger = 80;
  public thirst = 80;
  public happiness = 70;
  public health = 100;
  public attention = 60;
  public fleaCollar = 100;

  private wanderTimer = 0;
  private followingPlayer = false;
  private statusDot: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;

  // Cats roam the entire farm - wide bounds
  private bounds = {
    minX: 4 * 32, maxX: 74 * 32,
    minY: 4 * 32, maxY: 56 * 32,
  };

  constructor(
    scene: Phaser.Scene, id: number,
    config: { name: string; color: number; pattern: string },
    startX: number, startY: number,
  ) {
    const key = `cat_${id}`;
    SpriteFactory.generateCat(scene, id, config.color, config.pattern);

    super(scene, startX, startY, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.catId = id;
    this.catName = config.name;
    this.catColor = config.color;
    this.pattern = config.pattern;

    this.setDepth(4);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(10, 8).setOffset(3, 4);

    this.statusDot = scene.add.circle(startX, startY - 10, 3, 0x00ff00).setDepth(6);
    this.nameLabel = scene.add.text(startX, startY - 18, config.name, {
      fontSize: '9px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this.wanderTimer = Phaser.Math.Between(2000, 6000);
  }

  update(playerX: number, playerY: number) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.nameLabel.setVisible(dist < 70);

    // Follow player when attention is low (needy cat behavior)
    if (this.attention < CONFIG.cats.attention.loudMeowThreshold && dist > 60) {
      this.followingPlayer = true;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
      const speed = 50;
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    } else {
      this.followingPlayer = false;

      this.wanderTimer -= this.scene.game.loop.delta;
      if (this.wanderTimer <= 0) {
        const speed = Phaser.Math.Between(20, 50);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.wanderTimer = Phaser.Math.Between(2000, 6000);
      }
    }

    this.constrainToBounds();
    this.statusDot.setPosition(this.x, this.y - 10);
    this.nameLabel.setPosition(this.x, this.y - 18);
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
    if (this.attention < CONFIG.cats.attention.scratchFurnitureThreshold) {
      this.statusDot.setFillStyle(0xff0000); // Very needy!
    } else if (this.attention < CONFIG.cats.attention.loudMeowThreshold) {
      this.statusDot.setFillStyle(0xff8800); // Needs attention
    } else if (Math.min(this.hunger, this.thirst, this.health) <= CONFIG.animalStats.warningThreshold) {
      this.statusDot.setFillStyle(0xffff00);
    } else {
      this.statusDot.setFillStyle(0x00ff00);
    }
  }

  pet(amount: number) { this.attention = Math.min(100, this.attention + amount); }
  feed(amount: number) { this.hunger = Math.min(100, this.hunger + amount); }
  water(amount: number) { this.thirst = Math.min(100, this.thirst + amount); }
  distanceTo(x: number, y: number) { return Phaser.Math.Distance.Between(this.x, this.y, x, y); }

  syncToStore() {
    cats.update(list => {
      const state: CatState = {
        id: this.catId, name: this.catName, color: this.catColor, pattern: this.pattern,
        hunger: Math.round(this.hunger), thirst: Math.round(this.thirst),
        happiness: Math.round(this.happiness), health: Math.round(this.health),
        attention: Math.round(this.attention), fleaCollar: Math.round(this.fleaCollar),
      };
      const idx = list.findIndex(c => c.id === this.catId);
      if (idx >= 0) list[idx] = state; else list.push(state);
      return [...list];
    });
  }
}

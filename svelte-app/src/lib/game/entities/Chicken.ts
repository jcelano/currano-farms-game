import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SpriteFactory } from '../art/SpriteFactory';
import { chickens, get, type ChickenState } from '$lib/stores/gameStore';

interface ChickenBounds {
  minX: number; maxX: number;
  minY: number; maxY: number;
}

export class Chicken extends Phaser.Physics.Arcade.Sprite {
  public chickenId: number;
  public chickenName: string;
  public role: 'rooster' | 'hen';
  public breed: string;
  public chickenColor: number;

  // Stats (0-100)
  public hunger = 80;
  public thirst = 80;
  public happiness = 70;
  public health = 100;
  public cleanliness = 80;
  public isBroody = false;

  // AI
  private bounds: ChickenBounds;
  private wanderTimer = 0;
  private wanderInterval = 0;
  private isPecking = false;
  private peckTimer = 0;
  private statusDot: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    id: number,
    config: { name: string; role: 'rooster' | 'hen'; breed: string; color: number },
    bounds: ChickenBounds,
  ) {
    // Generate detailed chicken texture via SpriteFactory
    const key = `chicken_${id}`;
    SpriteFactory.generateChicken(scene, id, config.color, config.role);

    // Random start position within bounds
    const startX = Phaser.Math.Between(bounds.minX + 20, bounds.maxX - 20);
    const startY = Phaser.Math.Between(bounds.minY + 20, bounds.maxY - 20);

    super(scene, startX, startY, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.chickenId = id;
    this.chickenName = config.name;
    this.role = config.role;
    this.breed = config.breed;
    this.chickenColor = config.color;
    this.bounds = bounds;

    this.setDepth(4);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(1, 4);

    // Status dot above chicken
    this.statusDot = scene.add.circle(startX, startY - 10, 3, 0x00ff00);
    this.statusDot.setDepth(6);

    // Name label (hidden by default, shown on proximity)
    this.nameLabel = scene.add.text(startX, startY - 18, config.name, {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 2, y: 1 },
    });
    this.nameLabel.setOrigin(0.5);
    this.nameLabel.setDepth(6);
    this.nameLabel.setVisible(false);

    // Initial wander
    this.setRandomWander();
  }

  update(playerX: number, playerY: number) {
    const dt = this.scene.game.loop.delta;

    // Show name when player is close
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.nameLabel.setVisible(distToPlayer < 80);

    // Broody hens sit still
    if (this.isBroody) {
      this.setVelocity(0, 0);
      this.statusDot.setFillStyle(0xff69b4); // Pink dot = broody
      this.statusDot.setPosition(this.x, this.y - 10);
      this.nameLabel.setPosition(this.x, this.y - 18);
      return;
    }

    // Pecking animation
    if (this.isPecking) {
      this.peckTimer -= dt;
      if (this.peckTimer <= 0) {
        this.isPecking = false;
        this.setRandomWander();
      } else {
        this.setVelocity(0, 0);
        // Bob animation (small y oscillation)
        this.y += Math.sin(Date.now() * 0.02) * 0.3;
      }
    } else {
      // Wandering
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        // Chance to peck
        if (Math.random() < 0.3) {
          this.isPecking = true;
          this.peckTimer = Phaser.Math.Between(800, 2000);
          this.setVelocity(0, 0);
        } else {
          this.setRandomWander();
        }
      }

      // Keep within bounds
      this.constrainToBounds();
    }

    // Update status dot position and color
    this.statusDot.setPosition(this.x, this.y - 10);
    this.nameLabel.setPosition(this.x, this.y - 18);
    this.updateStatusDot();
  }

  private setRandomWander() {
    const speed = Phaser.Math.Between(15, 40);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.wanderTimer = Phaser.Math.Between(1500, 4000);
    this.wanderInterval = this.wanderTimer;
  }

  private constrainToBounds() {
    const margin = 10;
    if (this.x < this.bounds.minX + margin) this.setVelocityX(Math.abs(this.body!.velocity.x));
    if (this.x > this.bounds.maxX - margin) this.setVelocityX(-Math.abs(this.body!.velocity.x));
    if (this.y < this.bounds.minY + margin) this.setVelocityY(Math.abs(this.body!.velocity.y));
    if (this.y > this.bounds.maxY - margin) this.setVelocityY(-Math.abs(this.body!.velocity.y));
  }

  private updateStatusDot() {
    const worstStat = Math.min(this.hunger, this.thirst, this.happiness, this.health);
    const threshold = CONFIG.animalStats;

    let color: number;
    if (worstStat <= threshold.criticalThreshold) {
      color = 0xff0000; // Red - critical
    } else if (worstStat <= threshold.warningThreshold) {
      color = 0xffff00; // Yellow - warning
    } else {
      color = 0x00ff00; // Green - ok
    }

    this.statusDot.setFillStyle(color);
  }

  /** Sync this chicken's stats to the store */
  syncToStore() {
    chickens.update(list => {
      const idx = list.findIndex(c => c.id === this.chickenId);
      const state: ChickenState = {
        id: this.chickenId,
        name: this.chickenName,
        role: this.role,
        breed: this.breed,
        color: this.chickenColor,
        hunger: Math.round(this.hunger),
        thirst: Math.round(this.thirst),
        happiness: Math.round(this.happiness),
        health: Math.round(this.health),
        cleanliness: Math.round(this.cleanliness),
      };
      if (idx >= 0) {
        list[idx] = state;
      } else {
        list.push(state);
      }
      return [...list];
    });
  }

  /** Feed this chicken */
  feed(amount: number) {
    this.hunger = Math.min(100, this.hunger + amount);
  }

  /** Water this chicken */
  water(amount: number) {
    this.thirst = Math.min(100, this.thirst + amount);
  }

  /** Update movement bounds (used when coop door opens/closes) */
  setBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }) {
    this.bounds = bounds;
  }

  /** Get distance to a point */
  distanceTo(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, x, y);
  }
}

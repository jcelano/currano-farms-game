import Phaser from 'phaser';
import { SpriteFactory } from '../art/SpriteFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Generate all procedural art textures
    SpriteFactory.generateAll(this);
    SpriteFactory.generateTerrainTiles(this);
    SpriteFactory.generateTree(this, 0);
    SpriteFactory.generateTree(this, 1);
    SpriteFactory.generateTree(this, 2);

    // Phase 2 animal sprites (generated on-demand in entity constructors via SpriteFactory)

    // Future: load real sprite sheets here
    // this.load.spritesheet('chicken_ruby', '/assets/chicken_ruby.png', { frameWidth: 16, frameHeight: 16 });
    // this.load.once('complete', () => this.scene.start('FarmScene'));
    // this.load.start();

    this.scene.start('FarmScene');
  }
}

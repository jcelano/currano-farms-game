import Phaser from 'phaser';

export class Egg extends Phaser.GameObjects.Ellipse {
  public eggId: number;
  public henName: string;
  public layDay: number;
  public isBlue: boolean;
  public spoiled = false;

  constructor(
    scene: Phaser.Scene,
    id: number,
    henName: string,
    layDay: number,
    isBlue: boolean,
    x: number,
    y: number,
  ) {
    const color = isBlue ? 0x88aacc : 0xf5f0e0;
    super(scene, x, y, 8, 10, color);

    this.eggId = id;
    this.henName = henName;
    this.layDay = layDay;
    this.isBlue = isBlue;

    scene.add.existing(this);
    this.setDepth(3);
  }

  markSpoiled() {
    this.spoiled = true;
    this.setFillStyle(0x8b7355, 0.7); // Darkened brown
  }
}

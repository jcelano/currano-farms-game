import Phaser from 'phaser';
import { CONFIG } from '../config';

export interface InteractableConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  staminaCost: number;
  color: number;
  size?: number;
  onInteract: () => void;
}

export class Interactable {
  public id: string;
  public label: string;
  public staminaCost: number;
  public onInteract: () => void;
  public sprite: Phaser.GameObjects.Rectangle;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, config: InteractableConfig) {
    this.id = config.id;
    this.label = config.label;
    this.staminaCost = config.staminaCost;
    this.onInteract = config.onInteract;
    this.x = config.x;
    this.y = config.y;

    const size = config.size ?? 20;
    this.sprite = scene.add.rectangle(config.x, config.y, size, size, config.color, 0.8);
    this.sprite.setDepth(3);
    this.sprite.setStrokeStyle(1, 0xffffff, 0.5);

    // Label
    const labelText = scene.add.text(config.x, config.y - size / 2 - 8, config.label, {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 2, y: 1 },
    });
    labelText.setOrigin(0.5);
    labelText.setDepth(6);
  }

  distanceTo(px: number, py: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, px, py);
  }
}

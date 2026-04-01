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
  spriteKey?: string;
  onInteract: () => void;
  /** If set, interacting picks up this item into inventory */
  givesItem?: { id: string; label: string; spriteKey: string };
  /** If set, player must be carrying this item ID to interact */
  requiresItem?: string;
  /** Label to show when player doesn't have required item */
  requiresItemHint?: string;
}

export class Interactable {
  public id: string;
  public label: string;
  public staminaCost: number;
  public onInteract: () => void;
  public sprite: Phaser.GameObjects.GameObject;
  public x: number;
  public y: number;
  public givesItem?: { id: string; label: string; spriteKey: string };
  public requiresItem?: string;
  public requiresItemHint?: string;

  constructor(scene: Phaser.Scene, config: InteractableConfig) {
    this.id = config.id;
    this.label = config.label;
    this.staminaCost = config.staminaCost;
    this.onInteract = config.onInteract;
    this.x = config.x;
    this.y = config.y;
    this.givesItem = config.givesItem;
    this.requiresItem = config.requiresItem;
    this.requiresItemHint = config.requiresItemHint;

    const size = config.size ?? 20;

    if (config.spriteKey && scene.textures.exists(config.spriteKey)) {
      const spr = scene.add.sprite(config.x, config.y, config.spriteKey);
      spr.setDepth(3);
      spr.setScale(2);
      this.sprite = spr;
    } else {
      const rect = scene.add.rectangle(config.x, config.y, size, size, config.color, 0.8);
      rect.setDepth(3);
      rect.setStrokeStyle(1, 0xffffff, 0.5);
      this.sprite = rect;
    }

    const labelText = scene.add.text(config.x, config.y - size / 2 - 10, config.label, {
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

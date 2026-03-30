import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { FarmScene } from './scenes/FarmScene';
import { CONFIG } from './config';

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: CONFIG.display.baseWidth,
    height: CONFIG.display.baseHeight,
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, FarmScene],
    input: {
      activePointers: 2, // Support multi-touch for mobile
    },
  };

  const game = new Phaser.Game(config);

  // Expose for dev tools debugging
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
  }

  return game;
}

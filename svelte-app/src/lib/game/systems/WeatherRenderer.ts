import Phaser from 'phaser';
import { CONFIG } from '../config';
import { currentWeather, get, type WeatherState } from '$lib/stores/gameStore';

export class WeatherRenderer {
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private fogOverlay: Phaser.GameObjects.Rectangle;
  private thunderTimer: Phaser.Time.TimerEvent | null = null;
  private flashOverlay: Phaser.GameObjects.Rectangle;
  private lastCondition = '';

  constructor(private scene: Phaser.Scene) {
    const w = CONFIG.display.baseWidth * 3;
    const h = CONFIG.display.baseHeight * 3;

    // Fog overlay
    this.fogOverlay = scene.add.rectangle(0, 0, w, h, 0xcccccc, 0);
    this.fogOverlay.setScrollFactor(0);
    this.fogOverlay.setDepth(85);
    this.fogOverlay.setOrigin(0, 0);
    this.fogOverlay.setPosition(-w / 4, -h / 4);

    // Thunder flash overlay
    this.flashOverlay = scene.add.rectangle(0, 0, w, h, 0xffffff, 0);
    this.flashOverlay.setScrollFactor(0);
    this.flashOverlay.setDepth(95);
    this.flashOverlay.setOrigin(0, 0);
    this.flashOverlay.setPosition(-w / 4, -h / 4);

    // Create particle textures
    this.createParticleTextures();
  }

  private createParticleTextures() {
    // Rain drop texture
    if (!this.scene.textures.exists('rain_drop')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0x6688cc, 0.7);
      gfx.fillRect(0, 0, 2, 8);
      gfx.generateTexture('rain_drop', 2, 8);
      gfx.destroy();
    }

    // Snow flake texture
    if (!this.scene.textures.exists('snow_flake')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xffffff, 0.9);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('snow_flake', 6, 6);
      gfx.destroy();
    }
  }

  update() {
    const state = get(currentWeather);

    if (state.condition !== this.lastCondition) {
      this.lastCondition = state.condition;
      this.applyWeather(state);
    }
  }

  private applyWeather(state: WeatherState) {
    // Clear all effects first
    this.stopRain();
    this.stopSnow();
    this.stopThunder();
    this.fogOverlay.setAlpha(0);

    switch (state.condition) {
      case 'rain':
        this.startRain();
        break;
      case 'thunderstorm':
        this.startRain();
        this.startThunder();
        break;
      case 'snow':
      case 'iceStorm':
        this.startSnow();
        break;
      case 'fog':
        this.fogOverlay.setAlpha(0.45);
        break;
    }
  }

  private startRain() {
    if (this.rainEmitter) return;

    this.rainEmitter = this.scene.add.particles(0, -20, 'rain_drop', {
      x: { min: -200, max: CONFIG.display.baseWidth + 200 },
      y: -20,
      lifespan: 800,
      speedY: { min: 400, max: 600 },
      speedX: { min: -50, max: -30 }, // Slight angle
      quantity: 3,
      frequency: 20,
      alpha: { start: 0.7, end: 0.2 },
      scale: { start: 1.0, end: 0.5 },
    });
    this.rainEmitter.setScrollFactor(0);
    this.rainEmitter.setDepth(86);
  }

  private stopRain() {
    if (this.rainEmitter) {
      this.rainEmitter.destroy();
      this.rainEmitter = null;
    }
  }

  private startSnow() {
    if (this.snowEmitter) return;

    this.snowEmitter = this.scene.add.particles(0, -20, 'snow_flake', {
      x: { min: -100, max: CONFIG.display.baseWidth + 100 },
      y: -20,
      lifespan: 3000,
      speedY: { min: 40, max: 100 },
      speedX: { min: -20, max: 20 },
      quantity: 1,
      frequency: 80,
      alpha: { start: 0.9, end: 0.3 },
      scale: { start: 0.8, end: 0.3 },
      rotate: { min: 0, max: 360 },
    });
    this.snowEmitter.setScrollFactor(0);
    this.snowEmitter.setDepth(86);
  }

  private stopSnow() {
    if (this.snowEmitter) {
      this.snowEmitter.destroy();
      this.snowEmitter = null;
    }
  }

  private startThunder() {
    // Random lightning flashes
    this.thunderTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(4000, 10000),
      callback: () => {
        this.flashOverlay.setAlpha(0.7);
        this.scene.time.delayedCall(100, () => {
          this.flashOverlay.setAlpha(0);
          // Sometimes double flash
          if (Math.random() > 0.5) {
            this.scene.time.delayedCall(150, () => {
              this.flashOverlay.setAlpha(0.4);
              this.scene.time.delayedCall(80, () => {
                this.flashOverlay.setAlpha(0);
              });
            });
          }
        });
        // Reschedule with random delay
        if (this.thunderTimer) {
          this.thunderTimer.reset({
            delay: Phaser.Math.Between(4000, 10000),
            callback: this.thunderTimer.callback,
            loop: true,
          });
        }
      },
      loop: true,
    });
  }

  private stopThunder() {
    if (this.thunderTimer) {
      this.thunderTimer.destroy();
      this.thunderTimer = null;
    }
    this.flashOverlay.setAlpha(0);
  }

  destroy() {
    this.stopRain();
    this.stopSnow();
    this.stopThunder();
  }
}

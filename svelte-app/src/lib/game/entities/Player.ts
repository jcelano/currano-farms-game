import Phaser from 'phaser';
import { CONFIG } from '../config';
import { playerPosition, playerStamina, currentWeather, joystickDirection, joystickInteract, get } from '$lib/stores/gameStore';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private spaceJustPressed = false;
  public onInteract: (() => void) | null = null;
  private touchActive = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchDirX = 0;
  private touchDirY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // SpriteFactory.generatePlayer() is called in BootScene
    const key = 'player_placeholder';

    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 16);
    body.setOffset(3, 16);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchActive = true;
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.touchActive) return;
      const dx = pointer.x - this.touchStartX;
      const dy = pointer.y - this.touchStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        this.touchDirX = dx / dist;
        this.touchDirY = dy / dist;
      }
    });
    scene.input.on('pointerup', () => {
      this.touchActive = false;
      this.touchDirX = 0;
      this.touchDirY = 0;
    });
  }

  update(paused = false) {
    if (paused) {
      this.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors) {
      const left = this.cursors.left.isDown || this.wasd.A.isDown;
      const right = this.cursors.right.isDown || this.wasd.D.isDown;
      const up = this.cursors.up.isDown || this.wasd.W.isDown;
      const down = this.cursors.down.isDown || this.wasd.S.isDown;

      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 1;
    }

    if (this.touchActive && (this.touchDirX !== 0 || this.touchDirY !== 0)) {
      vx = this.touchDirX;
      vy = this.touchDirY;
    }

    // Mobile virtual joystick input
    const joy = get(joystickDirection);
    if (Math.abs(joy.x) > 0.1 || Math.abs(joy.y) > 0.1) {
      vx = joy.x;
      vy = joy.y;
    }

    // Mobile interact button
    if (get(joystickInteract)) {
      this.onInteract?.();
    }

    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }

    // Spacebar interaction
    if (this.spaceKey?.isDown && !this.spaceJustPressed) {
      this.spaceJustPressed = true;
      this.onInteract?.();
    }
    if (this.spaceKey && !this.spaceKey.isDown) {
      this.spaceJustPressed = false;
    }

    const isRunning = this.shiftKey?.isDown ?? false;
    const baseSpeed = isRunning ? CONFIG.player.runSpeed : CONFIG.player.walkSpeed;

    // Apply weather speed modifier
    const weather = get(currentWeather);
    const weatherMod = weather.speedMultiplier * (weather.isMuddy ? 0.90 : 1.0);

    // Apply exhaustion speed penalty
    const stamina = get(playerStamina);
    const exhaustionMod = stamina <= 0 ? CONFIG.stamina.exhaustedSpeedMultiplier : 1.0;

    const speed = baseSpeed * weatherMod * exhaustionMod;

    this.setVelocity(vx * speed, vy * speed);
    playerPosition.set({ x: Math.round(this.x), y: Math.round(this.y) });
  }
}

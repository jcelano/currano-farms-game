import Phaser from 'phaser';

/**
 * SpriteFactory — Generates all procedural pixel art textures.
 *
 * To replace with real sprites later:
 * 1. Add your sprite sheet PNG to svelte-app/static/assets/
 * 2. Load it in BootScene: this.load.spritesheet('chicken_ruby', '/assets/chicken_ruby.png', { frameWidth: 16, frameHeight: 16 })
 * 3. Remove the generateXxx() call — the texture key will already exist
 *
 * All textures use a consistent naming convention:
 * - player_sprite
 * - chicken_{id}
 * - egg_white, egg_blue, egg_spoiled
 * - fox_sprite, hawk_shadow
 * - building_{name}
 * - tile_{type}
 */
export class SpriteFactory {
  static generateAll(scene: Phaser.Scene) {
    SpriteFactory.generatePlayer(scene);
    SpriteFactory.generatePlayerGirl(scene);
    SpriteFactory.generateEggs(scene);
    SpriteFactory.generatePredators(scene);
    SpriteFactory.generateInteractables(scene);
  }

  // ─── Player ─────────────────────────────────────────────

  static generatePlayer(scene: Phaser.Scene) {
    const key = 'player_placeholder';
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const w = 24, h = 32;

    // Boots
    gfx.fillStyle(0x5c3a1e, 1);
    gfx.fillRect(3, 26, 7, 6);
    gfx.fillRect(14, 26, 7, 6);

    // Jeans
    gfx.fillStyle(0x4a6fa5, 1);
    gfx.fillRect(4, 18, 7, 9);
    gfx.fillRect(13, 18, 7, 9);

    // Flannel shirt body
    gfx.fillStyle(0xcc4444, 1);
    gfx.fillRect(4, 10, 16, 9);
    // Flannel stripes
    gfx.fillStyle(0x993333, 1);
    gfx.fillRect(4, 12, 16, 2);
    gfx.fillRect(4, 16, 16, 2);

    // Arms
    gfx.fillStyle(0xcc4444, 1);
    gfx.fillRect(1, 11, 3, 7);
    gfx.fillRect(20, 11, 3, 7);

    // Hands
    gfx.fillStyle(0xf5cba7, 1);
    gfx.fillRect(1, 17, 3, 2);
    gfx.fillRect(20, 17, 3, 2);

    // Head
    gfx.fillStyle(0xf5cba7, 1);
    gfx.fillRect(6, 1, 12, 10);

    // Hair
    gfx.fillStyle(0x6b3a2a, 1);
    gfx.fillRect(5, 0, 14, 4);
    gfx.fillRect(5, 1, 2, 5);
    gfx.fillRect(17, 1, 2, 5);

    // Eyes
    gfx.fillStyle(0x2c3e50, 1);
    gfx.fillRect(8, 5, 2, 2);
    gfx.fillRect(14, 5, 2, 2);

    // Mouth
    gfx.fillStyle(0xc0825a, 1);
    gfx.fillRect(10, 8, 4, 1);

    // Hat brim
    gfx.fillStyle(0x8b6914, 1);
    gfx.fillRect(4, 0, 16, 2);
    // Hat top
    gfx.fillStyle(0xa07828, 1);
    gfx.fillRect(7, -2, 10, 3);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  static generatePlayerGirl(scene: Phaser.Scene) {
    const key = 'player_girl';
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const w = 24, h = 32;

    // Boots
    gfx.fillStyle(0x5c3a1e, 1);
    gfx.fillRect(3, 26, 7, 6);
    gfx.fillRect(14, 26, 7, 6);

    // Overall legs (denim blue)
    gfx.fillStyle(0x4a6fa5, 1);
    gfx.fillRect(4, 18, 7, 9);
    gfx.fillRect(13, 18, 7, 9);

    // White t-shirt (visible at top of overalls)
    gfx.fillStyle(0xeeeeee, 1);
    gfx.fillRect(4, 10, 16, 4);

    // Overall bib (denim blue over t-shirt)
    gfx.fillStyle(0x4a6fa5, 1);
    gfx.fillRect(6, 12, 12, 7);
    // Overall straps
    gfx.fillRect(7, 10, 3, 3);
    gfx.fillRect(14, 10, 3, 3);
    // Overall pocket
    gfx.fillStyle(0x3d5e8c, 1);
    gfx.fillRect(9, 15, 6, 3);
    // Overall button details
    gfx.fillStyle(0xcccccc, 1);
    gfx.fillRect(8, 11, 1, 1);
    gfx.fillRect(15, 11, 1, 1);

    // Arms (white t-shirt sleeves)
    gfx.fillStyle(0xeeeeee, 1);
    gfx.fillRect(1, 11, 3, 4);
    gfx.fillRect(20, 11, 3, 4);

    // Forearms (skin)
    gfx.fillStyle(0xf5cba7, 1);
    gfx.fillRect(1, 15, 3, 2);
    gfx.fillRect(20, 15, 3, 2);

    // Hands
    gfx.fillStyle(0xf5cba7, 1);
    gfx.fillRect(1, 17, 3, 2);
    gfx.fillRect(20, 17, 3, 2);

    // Head
    gfx.fillStyle(0xf5cba7, 1);
    gfx.fillRect(6, 1, 12, 10);

    // Long red hair — flowing past shoulders
    gfx.fillStyle(0xcc3318, 1);
    // Top of head
    gfx.fillRect(5, 0, 14, 4);
    // Left side hair (long, past shoulders)
    gfx.fillRect(3, 1, 4, 14);
    // Right side hair (long, past shoulders)
    gfx.fillRect(17, 1, 4, 14);
    // Hair highlights
    gfx.fillStyle(0xdd5533, 1);
    gfx.fillRect(4, 3, 2, 8);
    gfx.fillRect(18, 4, 2, 7);

    // Eyes (green)
    gfx.fillStyle(0x2e7d32, 1);
    gfx.fillRect(8, 5, 2, 2);
    gfx.fillRect(14, 5, 2, 2);

    // Freckles
    gfx.fillStyle(0xd4a574, 1);
    gfx.fillRect(9, 7, 1, 1);
    gfx.fillRect(14, 7, 1, 1);

    // Smile
    gfx.fillStyle(0xc0825a, 1);
    gfx.fillRect(10, 8, 4, 1);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // ─── Chickens ───────────────────────────────────────────

  static generateChicken(scene: Phaser.Scene, id: number, color: number, role: 'rooster' | 'hen') {
    const key = `chicken_${id}`;
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const isRooster = role === 'rooster';
    const size = isRooster ? 18 : 14;
    const bodyW = isRooster ? 12 : 10;
    const bodyH = isRooster ? 8 : 7;
    const bodyY = isRooster ? 6 : 5;

    // Tail feathers
    if (isRooster) {
      gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
      gfx.fillTriangle(1, bodyY + 2, 4, bodyY - 2, 5, bodyY + bodyH - 1);
      gfx.fillTriangle(0, bodyY + 1, 3, bodyY - 3, 4, bodyY + 3);
    } else {
      gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(20).color, 1);
      gfx.fillTriangle(2, bodyY + 2, 4, bodyY, 4, bodyY + bodyH - 2);
    }

    // Body (oval shape)
    gfx.fillStyle(color, 1);
    const cx = size / 2 + 1;
    gfx.fillEllipse(cx, bodyY + bodyH / 2, bodyW, bodyH);

    // Breast (lighter belly)
    const lighterColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;
    gfx.fillStyle(lighterColor, 1);
    gfx.fillEllipse(cx + 1, bodyY + bodyH / 2 + 1, bodyW - 4, bodyH - 3);

    // Wing
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(15).color, 1);
    gfx.fillEllipse(cx - 1, bodyY + bodyH / 2, bodyW / 2 + 1, bodyH - 2);

    // Head
    gfx.fillStyle(color, 1);
    const headX = cx + bodyW / 2 - 2;
    const headY = bodyY - 1;
    gfx.fillCircle(headX, headY, isRooster ? 4 : 3);

    // Comb (red)
    gfx.fillStyle(0xdd2222, 1);
    if (isRooster) {
      // Big rooster comb
      gfx.fillRect(headX - 2, headY - 5, 2, 3);
      gfx.fillRect(headX, headY - 6, 2, 4);
      gfx.fillRect(headX + 2, headY - 4, 2, 2);
    } else {
      // Small hen comb
      gfx.fillRect(headX - 1, headY - 4, 2, 2);
      gfx.fillRect(headX + 1, headY - 3, 2, 2);
    }

    // Wattle (red dangly bit)
    gfx.fillStyle(0xcc2222, 1);
    gfx.fillCircle(headX + 2, headY + 2, isRooster ? 2 : 1);

    // Eye
    gfx.fillStyle(0x111111, 1);
    gfx.fillCircle(headX + 1, headY - 1, 1);
    // Eye highlight
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(headX + 1, headY - 2, 1, 1);

    // Beak
    gfx.fillStyle(0xee8800, 1);
    gfx.fillTriangle(headX + 3, headY, headX + 6, headY + 1, headX + 3, headY + 2);

    // Legs
    gfx.fillStyle(0xee8800, 1);
    gfx.fillRect(cx - 2, bodyY + bodyH - 1, 2, 4);
    gfx.fillRect(cx + 2, bodyY + bodyH - 1, 2, 4);
    // Feet
    gfx.fillRect(cx - 3, bodyY + bodyH + 2, 4, 1);
    gfx.fillRect(cx + 1, bodyY + bodyH + 2, 4, 1);

    gfx.generateTexture(key, size + 4, bodyY + bodyH + 4);
    gfx.destroy();
  }

  // ─── Eggs ───────────────────────────────────────────────

  static generateEggs(scene: Phaser.Scene) {
    for (const [key, color, alpha] of [
      ['egg_white', 0xfaf0dc, 1],
      ['egg_blue', 0x88aacc, 1],
      ['egg_spoiled', 0x6b5b3a, 0.7],
    ] as [string, number, number][]) {
      if (scene.textures.exists(key)) continue;
      const gfx = scene.add.graphics();
      gfx.fillStyle(color, alpha);
      gfx.fillEllipse(5, 6, 8, 10);
      // Highlight
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillEllipse(4, 4, 3, 4);
      gfx.generateTexture(key, 10, 12);
      gfx.destroy();
    }
  }

  // ─── Predators ──────────────────────────────────────────

  static generatePredators(scene: Phaser.Scene) {
    // Fox
    if (!scene.textures.exists('fox_sprite')) {
      const gfx = scene.add.graphics();
      // Body
      gfx.fillStyle(0xcc5500, 1);
      gfx.fillEllipse(10, 10, 16, 10);
      // White chest
      gfx.fillStyle(0xffddbb, 1);
      gfx.fillEllipse(14, 11, 6, 6);
      // Head
      gfx.fillStyle(0xcc5500, 1);
      gfx.fillCircle(18, 6, 5);
      // Ears
      gfx.fillTriangle(16, 2, 15, 6, 18, 4);
      gfx.fillTriangle(20, 2, 18, 4, 21, 6);
      // Ear inner
      gfx.fillStyle(0x1a1a1a, 1);
      gfx.fillTriangle(16, 3, 16, 5, 17, 4);
      gfx.fillTriangle(20, 3, 19, 4, 20, 5);
      // Snout
      gfx.fillStyle(0xdd7733, 1);
      gfx.fillTriangle(20, 6, 24, 8, 20, 9);
      // Nose
      gfx.fillStyle(0x111111, 1);
      gfx.fillCircle(23, 7, 1);
      // Eyes
      gfx.fillStyle(0xffcc00, 1);
      gfx.fillCircle(17, 5, 1);
      gfx.fillCircle(19, 5, 1);
      gfx.fillStyle(0x111111, 1);
      gfx.fillRect(17, 5, 1, 1);
      gfx.fillRect(19, 5, 1, 1);
      // Tail
      gfx.fillStyle(0xcc5500, 1);
      gfx.fillEllipse(2, 8, 6, 4);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(1, 8, 2);
      // Legs
      gfx.fillStyle(0x1a1a1a, 1);
      gfx.fillRect(7, 14, 2, 4);
      gfx.fillRect(13, 14, 2, 4);
      gfx.generateTexture('fox_sprite', 26, 18);
      gfx.destroy();
    }

    // Hawk shadow
    if (!scene.textures.exists('hawk_shadow')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x333333, 0.4);
      gfx.fillEllipse(12, 6, 24, 8);
      // Wing shapes
      gfx.fillTriangle(0, 6, 6, 2, 12, 6);
      gfx.fillTriangle(24, 6, 18, 2, 12, 6);
      gfx.generateTexture('hawk_shadow', 24, 12);
      gfx.destroy();
    }
  }

  // ─── Interactables ──────────────────────────────────────

  static generateInteractables(scene: Phaser.Scene) {
    // Feeder
    if (!scene.textures.exists('feeder_sprite')) {
      const gfx = scene.add.graphics();
      // Trough
      gfx.fillStyle(0x8b6914, 1);
      gfx.fillRect(1, 6, 14, 4);
      gfx.fillRect(0, 5, 16, 2);
      // Legs
      gfx.fillRect(2, 10, 2, 4);
      gfx.fillRect(12, 10, 2, 4);
      // Feed inside
      gfx.fillStyle(0xe8c84a, 1);
      gfx.fillRect(2, 6, 12, 2);
      gfx.generateTexture('feeder_sprite', 16, 14);
      gfx.destroy();
    }

    // Waterer
    if (!scene.textures.exists('waterer_sprite')) {
      const gfx = scene.add.graphics();
      // Base dish
      gfx.fillStyle(0x888888, 1);
      gfx.fillRect(1, 10, 14, 3);
      // Water
      gfx.fillStyle(0x4488cc, 0.8);
      gfx.fillRect(2, 10, 12, 2);
      // Jug
      gfx.fillStyle(0xaaaaaa, 1);
      gfx.fillRect(4, 2, 8, 9);
      gfx.fillStyle(0x999999, 1);
      gfx.fillRect(5, 0, 6, 3);
      // Highlight
      gfx.fillStyle(0xcccccc, 0.5);
      gfx.fillRect(5, 3, 2, 6);
      gfx.generateTexture('waterer_sprite', 16, 14);
      gfx.destroy();
    }

    // Nesting box
    if (!scene.textures.exists('nestbox_sprite')) {
      const gfx = scene.add.graphics();
      // Box
      gfx.fillStyle(0x8b7355, 1);
      gfx.fillRect(0, 2, 16, 12);
      // Opening
      gfx.fillStyle(0x5a4a32, 1);
      gfx.fillRect(2, 3, 12, 8);
      // Hay inside
      gfx.fillStyle(0xdaa520, 0.8);
      gfx.fillRect(3, 8, 10, 3);
      gfx.fillStyle(0xc8961e, 0.6);
      gfx.fillRect(4, 7, 3, 2);
      gfx.fillRect(9, 7, 3, 2);
      gfx.generateTexture('nestbox_sprite', 16, 14);
      gfx.destroy();
    }

    // Door (closed)
    if (!scene.textures.exists('door_closed')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x6b4423, 1);
      gfx.fillRect(0, 0, 12, 18);
      gfx.fillStyle(0x5a3a1e, 1);
      // Planks
      gfx.fillRect(0, 0, 12, 1);
      gfx.fillRect(0, 6, 12, 1);
      gfx.fillRect(0, 12, 12, 1);
      // Handle
      gfx.fillStyle(0x888888, 1);
      gfx.fillRect(9, 8, 2, 3);
      // Frame
      gfx.lineStyle(1, 0x4a2e14, 1);
      gfx.strokeRect(0, 0, 12, 18);
      gfx.generateTexture('door_closed', 12, 18);
      gfx.destroy();
    }

    // Pitchfork
    if (!scene.textures.exists('pitchfork_sprite')) {
      const gfx = scene.add.graphics();
      // Handle
      gfx.fillStyle(0x8b6914, 1);
      gfx.fillRect(6, 4, 2, 14);
      // Tines
      gfx.fillStyle(0x888888, 1);
      gfx.fillRect(2, 0, 2, 6);
      gfx.fillRect(5, 0, 2, 5);
      gfx.fillRect(8, 0, 2, 5);
      gfx.fillRect(11, 0, 2, 6);
      // Crossbar
      gfx.fillRect(2, 4, 12, 2);
      gfx.generateTexture('pitchfork_sprite', 14, 18);
      gfx.destroy();
    }

    // Treat bag
    if (!scene.textures.exists('treat_sprite')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xcc8833, 1);
      gfx.fillRect(2, 2, 10, 12);
      gfx.fillStyle(0xaa6622, 1);
      gfx.fillRect(2, 2, 10, 3);
      // Label
      gfx.fillStyle(0xffeecc, 1);
      gfx.fillRect(4, 6, 6, 4);
      // Seeds spilling
      gfx.fillStyle(0xe8c84a, 1);
      gfx.fillCircle(3, 14, 1);
      gfx.fillCircle(7, 15, 1);
      gfx.fillCircle(10, 14, 1);
      gfx.generateTexture('treat_sprite', 14, 16);
      gfx.destroy();
    }

    // Kitchen/meal
    if (!scene.textures.exists('kitchen_sprite')) {
      const gfx = scene.add.graphics();
      // Plate
      gfx.fillStyle(0xdddddd, 1);
      gfx.fillEllipse(8, 10, 14, 8);
      gfx.fillStyle(0xcccccc, 1);
      gfx.fillEllipse(8, 10, 10, 5);
      // Food
      gfx.fillStyle(0xcc8844, 1);
      gfx.fillEllipse(6, 9, 5, 3);
      gfx.fillStyle(0x44aa44, 1);
      gfx.fillEllipse(10, 8, 4, 3);
      // Steam
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillRect(6, 3, 1, 3);
      gfx.fillRect(9, 2, 1, 4);
      gfx.generateTexture('kitchen_sprite', 16, 14);
      gfx.destroy();
    }

    // Well (water source)
    if (!scene.textures.exists('well_sprite')) {
      const gfx = scene.add.graphics();
      // Stone base (circular)
      gfx.fillStyle(0x888888, 1);
      gfx.fillRoundedRect(1, 6, 14, 8, 2);
      // Stone details
      gfx.fillStyle(0x777777, 1);
      gfx.fillRect(3, 7, 3, 2);
      gfx.fillRect(9, 8, 3, 2);
      gfx.fillRect(5, 10, 4, 2);
      // Water inside
      gfx.fillStyle(0x4488cc, 0.8);
      gfx.fillRoundedRect(3, 8, 10, 4, 1);
      // Roof posts
      gfx.fillStyle(0x6b4423, 1);
      gfx.fillRect(3, 1, 2, 7);
      gfx.fillRect(11, 1, 2, 7);
      // Roof
      gfx.fillStyle(0x8b5a2b, 1);
      gfx.fillRect(1, 0, 14, 3);
      // Bucket
      gfx.fillStyle(0xaaaaaa, 1);
      gfx.fillRect(7, 4, 3, 3);
      gfx.generateTexture('well_sprite', 16, 14);
      gfx.destroy();
    }

    // Water bucket
    if (!scene.textures.exists('bucket_sprite')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x8b6914, 1);
      gfx.fillRect(2, 3, 10, 8);
      gfx.fillStyle(0xaaaaaa, 1);
      gfx.fillRect(1, 3, 12, 1); // rim
      gfx.fillRect(1, 10, 12, 1); // bottom band
      // Water inside
      gfx.fillStyle(0x4488cc, 0.8);
      gfx.fillRect(3, 4, 8, 5);
      // Handle
      gfx.fillStyle(0x888888, 1);
      gfx.fillRect(5, 0, 1, 3);
      gfx.fillRect(8, 0, 1, 3);
      gfx.fillRect(5, 0, 4, 1);
      gfx.generateTexture('bucket_sprite', 14, 12);
      gfx.destroy();
    }

    // Leash
    if (!scene.textures.exists('leash_sprite')) {
      const gfx = scene.add.graphics();
      // Handle
      gfx.fillStyle(0x8b4513, 1);
      gfx.fillRect(1, 0, 4, 6);
      // Rope
      gfx.fillStyle(0xdaa520, 1);
      gfx.fillRect(3, 5, 2, 8);
      // Clip
      gfx.fillStyle(0xcccccc, 1);
      gfx.fillRect(2, 12, 4, 2);
      gfx.generateTexture('leash_sprite', 8, 14);
      gfx.destroy();
    }

    // Brush
    if (!scene.textures.exists('brush_sprite')) {
      const gfx = scene.add.graphics();
      // Handle
      gfx.fillStyle(0x8b6914, 1);
      gfx.fillRect(4, 0, 4, 8);
      // Bristles
      gfx.fillStyle(0xdddddd, 1);
      gfx.fillRect(2, 8, 8, 4);
      gfx.fillStyle(0xbbbbbb, 1);
      gfx.fillRect(3, 9, 2, 3);
      gfx.fillRect(7, 9, 2, 3);
      gfx.generateTexture('brush_sprite', 12, 12);
      gfx.destroy();
    }

    // Feed scoops — each animal type gets its own color
    // chicken=golden grain, goat=green pellets, horse=tan hay, cat=orange kibble
    const scoopDefs: [string, number][] = [
      ['chicken_feed_scoop', 0xe8c84a],
      ['goat_feed_scoop',    0x66bb44],
      ['horse_feed_scoop',   0xc8a850],
      ['cat_food_scoop',     0xe07830],
    ];
    for (const [key, fillColor] of scoopDefs) {
      if (!scene.textures.exists(key)) {
        const gfx = scene.add.graphics();
        // Handle
        gfx.fillStyle(0x8b5e2a, 1);
        gfx.fillRect(6, 0, 3, 7);
        // Scoop bowl sides
        gfx.fillStyle(fillColor, 1);
        gfx.fillRect(1, 6, 13, 8);
        gfx.fillRect(2, 14, 11, 2);
        // Feed highlight inside bowl
        gfx.fillStyle(0xffffff, 0.25);
        gfx.fillRect(3, 7, 8, 4);
        gfx.generateTexture(key, 15, 16);
        gfx.destroy();
      }
    }
  }

  // ─── Goats ──────────────────────────────────────────────

  static generateGoat(scene: Phaser.Scene, id: number, color: number) {
    const key = `goat_${id}`;
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const w = 20, h = 18;

    // Body
    gfx.fillStyle(color, 1);
    gfx.fillEllipse(10, 11, 14, 9);
    // Lighter belly
    const lighter = Phaser.Display.Color.IntegerToColor(color).lighten(25).color;
    gfx.fillStyle(lighter, 1);
    gfx.fillEllipse(10, 13, 10, 5);
    // Head
    gfx.fillStyle(color, 1);
    gfx.fillCircle(17, 6, 4);
    // Horns
    gfx.fillStyle(0xccbb88, 1);
    gfx.fillTriangle(15, 3, 14, 0, 16, 1);
    gfx.fillTriangle(19, 3, 20, 0, 18, 1);
    // Eye (rectangular pupil!)
    gfx.fillStyle(0xffcc44, 1);
    gfx.fillCircle(18, 5, 2);
    gfx.fillStyle(0x111111, 1);
    gfx.fillRect(17, 5, 2, 1); // Horizontal rectangular pupil
    // Ear
    gfx.fillStyle(color, 1);
    gfx.fillEllipse(14, 4, 3, 2);
    // Beard
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).lighten(15).color, 1);
    gfx.fillTriangle(18, 8, 17, 12, 19, 10);
    // Legs
    gfx.fillStyle(color, 1);
    gfx.fillRect(5, 14, 2, 4);
    gfx.fillRect(8, 14, 2, 4);
    gfx.fillRect(12, 14, 2, 4);
    gfx.fillRect(15, 14, 2, 4);
    // Hooves
    gfx.fillStyle(0x333333, 1);
    gfx.fillRect(5, 17, 2, 1);
    gfx.fillRect(8, 17, 2, 1);
    gfx.fillRect(12, 17, 2, 1);
    gfx.fillRect(15, 17, 2, 1);
    // Short tail
    gfx.fillStyle(color, 1);
    gfx.fillTriangle(2, 9, 0, 7, 3, 8);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // ─── Horses ─────────────────────────────────────────────

  static generateHorse(scene: Phaser.Scene, id: number, bodyColor: number, maneColor?: number) {
    const key = `horse_${id}`;
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const w = 28, h = 24;
    const mane = maneColor ?? Phaser.Display.Color.IntegerToColor(bodyColor).darken(30).color;

    // Body
    gfx.fillStyle(bodyColor, 1);
    gfx.fillEllipse(13, 14, 18, 10);
    // Neck
    gfx.fillStyle(bodyColor, 1);
    gfx.fillRect(20, 4, 5, 12);
    // Head
    gfx.fillStyle(bodyColor, 1);
    gfx.fillEllipse(24, 4, 7, 6);
    // Snout (lighter)
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(bodyColor).lighten(20).color, 1);
    gfx.fillEllipse(26, 5, 4, 3);
    // Nostril
    gfx.fillStyle(0x333333, 1);
    gfx.fillCircle(27, 5, 1);
    // Eye
    gfx.fillStyle(0x2a1a0a, 1);
    gfx.fillCircle(24, 3, 1.5);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(24, 2, 1, 1);
    // Ear
    gfx.fillStyle(bodyColor, 1);
    gfx.fillTriangle(22, 0, 21, 3, 23, 2);
    // Ear inner
    gfx.fillStyle(0xddaa88, 1);
    gfx.fillTriangle(22, 1, 21, 3, 23, 2);
    // Mane
    gfx.fillStyle(mane, 1);
    gfx.fillRect(20, 1, 3, 11);
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(mane).darken(10).color, 1);
    gfx.fillRect(21, 2, 1, 9);
    // Tail
    gfx.fillStyle(mane, 1);
    gfx.fillTriangle(2, 10, 0, 6, 4, 8);
    gfx.fillTriangle(1, 10, 0, 14, 3, 12);
    // Legs
    gfx.fillStyle(bodyColor, 1);
    gfx.fillRect(7, 18, 2, 5);
    gfx.fillRect(11, 18, 2, 5);
    gfx.fillRect(16, 18, 2, 5);
    gfx.fillRect(20, 18, 2, 5);
    // Hooves
    gfx.fillStyle(0x333333, 1);
    gfx.fillRect(7, 22, 2, 2);
    gfx.fillRect(11, 22, 2, 2);
    gfx.fillRect(16, 22, 2, 2);
    gfx.fillRect(20, 22, 2, 2);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // ─── Cats ───────────────────────────────────────────────

  static generateCat(scene: Phaser.Scene, id: number, color: number, pattern: string) {
    const key = `cat_${id}`;
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();
    const w = 16, h = 14;

    // Tail (curving up)
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 6, 2, 1);
    gfx.fillRect(1, 5, 2, 1);
    gfx.fillRect(2, 4, 2, 1);
    gfx.fillRect(3, 3, 2, 1);

    // Body
    gfx.fillStyle(color, 1);
    gfx.fillEllipse(9, 8, 10, 6);

    // Tabby stripes
    if (pattern === 'tabby') {
      const darker = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
      gfx.fillStyle(darker, 0.6);
      gfx.fillRect(6, 6, 1, 4);
      gfx.fillRect(8, 6, 1, 4);
      gfx.fillRect(10, 6, 1, 4);
      gfx.fillRect(12, 6, 1, 4);
    }

    // Calico patches
    if (pattern === 'calico') {
      gfx.fillStyle(0xffffff, 0.7);
      gfx.fillCircle(7, 8, 3);
      gfx.fillStyle(0x111111, 0.5);
      gfx.fillCircle(11, 7, 2);
    }

    // White chest
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillEllipse(12, 9, 4, 3);

    // Head
    gfx.fillStyle(color, 1);
    gfx.fillCircle(14, 4, 3.5);

    // Ears (pointed)
    gfx.fillTriangle(12, 1, 11, 4, 13, 3);
    gfx.fillTriangle(16, 1, 15, 3, 17, 4);
    // Inner ears
    gfx.fillStyle(0xddaa88, 1);
    gfx.fillTriangle(12, 2, 12, 4, 13, 3);
    gfx.fillTriangle(16, 2, 15, 3, 16, 4);

    // Eyes
    gfx.fillStyle(0x44cc44, 1); // Green eyes
    gfx.fillCircle(13, 3, 1.2);
    gfx.fillCircle(15, 3, 1.2);
    // Pupils (vertical slit)
    gfx.fillStyle(0x111111, 1);
    gfx.fillRect(13, 2, 1, 2);
    gfx.fillRect(15, 2, 1, 2);

    // Nose
    gfx.fillStyle(0xffaaaa, 1);
    gfx.fillTriangle(13, 5, 15, 5, 14, 6);

    // Whiskers
    gfx.lineStyle(0.5, 0xcccccc, 0.5);
    gfx.lineBetween(12, 5, 8, 4);
    gfx.lineBetween(12, 5, 8, 6);
    gfx.lineBetween(16, 5, 20, 4); // past edge but ok, clipped by texture

    // Legs
    gfx.fillStyle(color, 1);
    gfx.fillRect(6, 10, 2, 3);
    gfx.fillRect(10, 10, 2, 3);
    // Paws
    gfx.fillStyle(0xffffff, 0.7);
    gfx.fillRect(6, 12, 2, 1);
    gfx.fillRect(10, 12, 2, 1);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // ─── Terrain Tiles ──────────────────────────────────────

  static generateTerrainTiles(scene: Phaser.Scene) {
    const ts = 32; // tile size

    // Grass tile with variation
    if (!scene.textures.exists('tile_grass')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x5a8f3c, 1);
      gfx.fillRect(0, 0, ts, ts);
      // Grass blades
      const rng = new Phaser.Math.RandomDataGenerator(['grass']);
      for (let i = 0; i < 8; i++) {
        const shade = rng.between(0, 2);
        const colors = [0x4d7a32, 0x6b9f4a, 0x528a38];
        gfx.fillStyle(colors[shade], 0.6);
        const gx = rng.between(2, ts - 4);
        const gy = rng.between(2, ts - 4);
        gfx.fillRect(gx, gy, 1, rng.between(2, 4));
      }
      gfx.generateTexture('tile_grass', ts, ts);
      gfx.destroy();
    }

    // Dirt path tile
    if (!scene.textures.exists('tile_dirt')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xa0825a, 1);
      gfx.fillRect(0, 0, ts, ts);
      // Pebbles
      const rng = new Phaser.Math.RandomDataGenerator(['dirt']);
      for (let i = 0; i < 5; i++) {
        gfx.fillStyle(rng.pick([0x8b7248, 0xb8956e, 0x9a8060]), 0.5);
        gfx.fillCircle(rng.between(4, ts - 4), rng.between(4, ts - 4), rng.between(1, 2));
      }
      gfx.generateTexture('tile_dirt', ts, ts);
      gfx.destroy();
    }

    // Woods tile
    if (!scene.textures.exists('tile_woods')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x2d5016, 1);
      gfx.fillRect(0, 0, ts, ts);
      // Dark undergrowth
      gfx.fillStyle(0x1a3d0a, 0.6);
      gfx.fillRect(4, 8, 12, 8);
      gfx.fillRect(18, 4, 10, 12);
      gfx.generateTexture('tile_woods', ts, ts);
      gfx.destroy();
    }
  }

  // ─── Trees ──────────────────────────────────────────────

  static generateTree(scene: Phaser.Scene, variant: number = 0) {
    const key = `tree_${variant}`;
    if (scene.textures.exists(key)) return;

    const gfx = scene.add.graphics();

    // Trunk
    gfx.fillStyle(0x5a3a1e, 1);
    gfx.fillRect(12, 20, 6, 16);
    // Trunk texture
    gfx.fillStyle(0x4a2e14, 1);
    gfx.fillRect(13, 22, 2, 3);
    gfx.fillRect(15, 28, 2, 3);

    // Canopy (layered circles for volume)
    const greens = [0x2d6b1a, 0x3d8a2a, 0x4d9a3a, 0x3d7a28];
    const canopyShapes = [
      { x: 15, y: 12, r: 12 },
      { x: 10, y: 10, r: 9 },
      { x: 20, y: 10, r: 9 },
      { x: 15, y: 6, r: 8 },
    ];
    for (let i = 0; i < canopyShapes.length; i++) {
      const s = canopyShapes[i];
      gfx.fillStyle(greens[(i + variant) % greens.length], 1);
      gfx.fillCircle(s.x, s.y, s.r);
    }

    // Highlight
    gfx.fillStyle(0x5aaa4a, 0.3);
    gfx.fillCircle(12, 6, 5);

    gfx.generateTexture(key, 30, 36);
    gfx.destroy();
  }
}

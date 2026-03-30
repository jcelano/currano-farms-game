# Currano Farms — Phase 2 Art Guide

How to create and integrate custom AI-generated pixel art sprites for the game.

---

## Current Art System

All art is currently **procedural** — generated via code in `svelte-app/src/lib/game/art/SpriteFactory.ts` using Phaser's Graphics API. To replace any sprite with a real image file, you only need to:

1. Create the PNG file at the correct size
2. Place it in `svelte-app/static/assets/`
3. Load it in `BootScene.ts` with `this.load.image()` or `this.load.spritesheet()`
4. The texture key will match, so the existing game code picks it up automatically

---

## Sprite Specifications

### Player Character
- **Texture key:** `player_placeholder`
- **Size:** 24 x 32 pixels
- **Views needed:** Front-facing (current), optionally 4-direction walk cycle
- **Spritesheet format:** If animated, 4 frames per direction (16 frames total)
  - Row 0: walk down, Row 1: walk left, Row 2: walk right, Row 3: walk up
- **AI prompt example:**
  > "16-bit pixel art farmer character, 24x32 pixels, front-facing, wearing straw hat, red flannel shirt, blue jeans, brown boots. New England farm style. Transparent background."

### Chickens (8 unique sprites)
- **Texture keys:** `chicken_0` through `chicken_7`
- **Size:** ~18 x 18 pixels (rooster), ~14 x 16 pixels (hens)
- **Each chicken needs unique coloring:**

| ID | Name | Breed | Color to Match |
|---|---|---|---|
| 0 | Goldie | Mixed (rooster) | Golden/amber, large red comb, long tail feathers |
| 1 | Ruby | Rhode Island Red | Reddish-brown |
| 2 | Sandy | Buff Orpington | Light buff/cream (smallest) |
| 3 | Angelina | Black Australorp | Glossy black with green sheen |
| 4 | Tangerine | Buff Orpington | Golden buff |
| 5 | Pebbles | Araucana | Gray-blue (lays blue eggs) |
| 6 | Midnight | Black Australorp | Very dark black |
| 7 | Valentina | Buff Orpington | Golden buff (bold personality) |

- **AI prompt example:**
  > "16-bit pixel art chicken, Rhode Island Red hen, 14x16 pixels, side view, reddish-brown feathers, small red comb, orange beak and legs, idle standing pose. Transparent background."

### Eggs
- **Texture keys:** `egg_white`, `egg_blue`, `egg_spoiled`
- **Size:** 10 x 12 pixels
- **Colors:** Cream white, light blue (Araucana), dark brown (spoiled)
- **AI prompt:** "Pixel art chicken egg, 10x12 pixels, cream colored with subtle highlight, simple farm game style"

### Fox Predator
- **Texture key:** `fox_sprite`
- **Size:** 26 x 18 pixels
- **Design:** Red fox, side view, running/stalking pose, bushy tail with white tip
- **AI prompt:** "16-bit pixel art red fox, 26x18 pixels, side view, stalking pose, orange-red fur, white chest, bushy tail. Game sprite, transparent background."

### Hawk Predator
- **Texture key:** `hawk_shadow`
- **Size:** 24 x 12 pixels
- **Design:** Dark shadow/silhouette of a hawk seen from below, semi-transparent
- **AI prompt:** "Pixel art hawk shadow silhouette viewed from below, 24x12 pixels, dark gray, spread wings, simple shape for ground shadow"

### Chick
- **Currently:** Yellow circle (`Chick.ts` uses `Phaser.GameObjects.Arc`)
- **To upgrade:** Create a `chick_sprite` texture (8x8 pixels, tiny yellow fluffy ball)
- **AI prompt:** "Tiny pixel art baby chick, 8x8 pixels, fluffy yellow, side view, small orange beak"

### Interactable Objects
| Key | Size | Description |
|---|---|---|
| `feeder_sprite` | 16 x 14 | Wooden feed trough with grain inside |
| `waterer_sprite` | 16 x 14 | Metal chicken waterer (jug on dish) |
| `nestbox_sprite` | 16 x 14 | Wooden nesting box with hay |
| `door_closed` | 12 x 18 | Wooden plank coop door |
| `pitchfork_sprite` | 14 x 18 | Pitchfork leaning against wall |
| `treat_sprite` | 14 x 16 | Bag of chicken treats/seeds |
| `kitchen_sprite` | 16 x 14 | Plate of food with steam |

### Trees
- **Texture keys:** `tree_0`, `tree_1`, `tree_2`
- **Size:** 30 x 36 pixels
- **3 variants:** Different canopy shapes (round, tall, wide)
- **Style:** New England deciduous trees (will need seasonal variants later)

---

## AI Art Generation Workflow

### Recommended Tools
1. **DALL-E 3** (via ChatGPT) — Good at pixel art with clear prompts
2. **Midjourney** — Best quality, use `--ar 1:1 --style raw` for pixel art
3. **Stable Diffusion** with pixel art LoRA — Most control, free
4. **Aseprite** — Professional pixel art editor for touch-ups

### Step-by-Step Process

1. **Generate the base sprite** using AI with a prompt like:
   ```
   16-bit pixel art [subject], [size] pixels, [view direction],
   [color details], game sprite style, transparent background,
   no anti-aliasing, clean pixel edges
   ```

2. **Clean up in Aseprite or Piskel (free browser tool):**
   - Resize to exact pixel dimensions (nearest-neighbor scaling)
   - Remove anti-aliasing artifacts (AI often adds smooth gradients)
   - Ensure transparent background (alpha channel)
   - Match the color palette to existing game colors

3. **Export as PNG** with transparency

4. **Place in** `svelte-app/static/assets/sprites/`

5. **Load in BootScene.ts:**
   ```typescript
   // In BootScene.create() or a new preload() method:
   this.load.image('chicken_1', '/assets/sprites/chicken_ruby.png');
   // For animated sprites:
   this.load.spritesheet('player_walk', '/assets/sprites/player_walk.png', {
     frameWidth: 24,
     frameHeight: 32,
   });
   ```

6. **The game automatically uses it** — SpriteFactory checks `scene.textures.exists(key)` and skips generation if the texture already exists.

### Tips for Better AI Pixel Art

- **Specify exact pixel dimensions** in the prompt
- **Say "no anti-aliasing"** to get clean edges
- **Use "16-bit" or "SNES-style"** for the right aesthetic
- **Generate at 4x size** (e.g., 96x128 for a 24x32 sprite) and then downscale in Aseprite with nearest-neighbor — this gives AI more detail to work with
- **Keep a consistent palette** across all sprites — use a shared color palette reference
- **Test in-game immediately** after placing the file — the hot reload will pick it up

### Recommended Color Palette

For visual consistency, use these base colors across all sprites:

```
Skin:    #f5cba7, #daa06d
Hair:    #6b3a2a, #3d2314
Clothes: #cc4444 (flannel), #4a6fa5 (jeans)
Wood:    #8b6914, #5a3a1e, #4a2e14
Metal:   #888888, #666666, #aaaaaa
Grass:   #5a8f3c, #4d7a32, #6b9f4a
Dirt:    #a0825a, #8b7248
Water:   #4488cc, #3366aa
Chicken: Per breed (see table above)
```

---

## Tilemap Upgrade Path (Future)

Currently the terrain is drawn procedurally. To upgrade to a proper tilemap:

1. **Create a tileset PNG** (256x256 or larger) with 32x32 pixel tiles:
   - Grass (4 variants)
   - Dirt path (center, edges, corners — 9-slice)
   - Water (animated: 2-3 frames)
   - Wood floor (for coop interior)
   - Stone (for paths, walls)

2. **Design the map in Tiled** (free map editor: https://www.mapeditor.org/):
   - Import your tileset
   - Paint the 80x60 tile grid
   - Add collision layer
   - Export as JSON

3. **Load in Phaser:**
   ```typescript
   // In BootScene:
   this.load.tilemapTiledJSON('farm_map', '/assets/maps/farm.json');
   this.load.image('farm_tiles', '/assets/tilesets/farm_tiles.png');

   // In FarmScene:
   const map = this.make.tilemap({ key: 'farm_map' });
   const tileset = map.addTilesetImage('farm_tiles');
   map.createLayer('ground', tileset);
   map.createLayer('buildings', tileset);
   ```

---

## Seasonal Sprite Variants (Phase 3+)

Each visual element needs seasonal variants:

| Element | Spring | Summer | Fall | Winter |
|---|---|---|---|---|
| Trees | Light green buds | Full dark green | Orange/red leaves | Bare branches + snow |
| Grass | Bright green + mud | Deep green | Golden brown | White snow |
| Paths | Muddy brown | Dry light brown | Leaf-covered | Snow-covered |
| Pond | Normal | Normal | Normal | Frozen gray |

Create each variant as a separate sprite and swap them when the season changes via `sprite.setTexture('tree_fall_0')`.

---

## Animation Frames

For animated sprites, create sprite sheets (single PNG with all frames in a row):

### Chicken Walk Cycle (4 frames)
```
Frame 1: Stand (legs together)
Frame 2: Step right (right leg forward)
Frame 3: Stand (legs together)
Frame 4: Step left (left leg forward)
```

### Chicken Peck Animation (3 frames)
```
Frame 1: Head up
Frame 2: Head down (beak to ground)
Frame 3: Head up (with seed particle)
```

### Player Walk Cycle (4 frames per direction)
```
Frame 1: Stand
Frame 2: Left foot forward
Frame 3: Stand
Frame 4: Right foot forward
```

Load as spritesheet and create animations in Phaser:
```typescript
this.anims.create({
  key: 'chicken_walk',
  frames: this.anims.generateFrameNumbers('chicken_1_sheet', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
```

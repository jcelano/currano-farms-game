import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Player } from '../entities/Player';
import { Chicken } from '../entities/Chicken';
import { Interactable } from '../entities/Interactable';
import { ZoneManager, ZONE_DEFS } from '../systems/ZoneManager';
import { TimeSystem } from '../systems/TimeSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { DayNightRenderer } from '../systems/DayNightRenderer';
import { WeatherRenderer } from '../systems/WeatherRenderer';
import { AnimalStatSystem } from '../systems/AnimalStatSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { EggSystem } from '../systems/EggSystem';
import { CoopDoorSystem } from '../systems/CoopDoorSystem';
import { PredatorSystem } from '../systems/PredatorSystem';
import { RoosterSystem } from '../systems/RoosterSystem';
import { CoopCleaningSystem } from '../systems/CoopCleaningSystem';
import { HatchingSystem } from '../systems/HatchingSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { saveSystem } from '../systems/SaveSystem';
import { Goat } from '../entities/Goat';
import { Horse } from '../entities/Horse';
import { Cat } from '../entities/Cat';
import { GoatMischiefSystem } from '../systems/GoatMischiefSystem';
import { FenceSystem } from '../systems/FenceSystem';
import { HorseCareSystem } from '../systems/HorseCareSystem';
import { CatAttentionSystem } from '../systems/CatAttentionSystem';
import { WaterSystem } from '../systems/WaterSystem';

function tileRng(rng: Phaser.Math.RandomDataGenerator, tileSize: number): number {
  return rng.between(0, tileSize);
}
import { fps, gameReady, gamePaused, pauseMenuOpen, playerStamina, playerMoney, fenceSections, waterLevels, gateStates, currentSaveSlot, gameEvents, coopDoorOpen, get, addNotification } from '$lib/stores/gameStore';

export class FarmScene extends Phaser.Scene {
  private player!: Player;
  private zoneManager!: ZoneManager;
  private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
  public timeSystem!: TimeSystem;
  public weatherSystem!: WeatherSystem;
  private dayNightRenderer!: DayNightRenderer;
  private weatherRenderer!: WeatherRenderer;
  private chickenEntities: Chicken[] = [];
  private animalStatSystem!: AnimalStatSystem;
  private interactionSystem!: InteractionSystem;
  private eggSystem!: EggSystem;
  private coopDoorSystem!: CoopDoorSystem;
  private predatorSystem!: PredatorSystem;
  private roosterSystem!: RoosterSystem;
  private coopCleaningSystem!: CoopCleaningSystem;
  private hatchingSystem!: HatchingSystem;
  private audioSystem!: AudioSystem;
  private goatEntities: Goat[] = [];
  private horseEntities: Horse[] = [];
  private catEntities: Cat[] = [];
  private goatMischiefSystem!: GoatMischiefSystem;
  private fenceSystem!: FenceSystem;
  private horseCareSystem!: HorseCareSystem;
  private catAttentionSystem!: CatAttentionSystem;
  private waterSystem!: WaterSystem;
  private waterBars: Map<string, { bg: Phaser.GameObjects.Rectangle; fill: Phaser.GameObjects.Rectangle }> = new Map();
  private gateColliders: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private gateVisuals: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor() {
    super({ key: 'FarmScene' });
  }

  create() {
    const { widthPx, heightPx, tileSize, widthTiles, heightTiles } = CONFIG.map;

    // Set world bounds
    this.physics.world.setBounds(0, 0, widthPx, heightPx);

    // Draw the map
    this.drawMap(widthTiles, heightTiles, tileSize);
    this.drawZones(tileSize);
    this.drawPaths(tileSize);

    // Create collision bodies for buildings & perimeter
    this.collisionGroup = this.physics.add.staticGroup();
    this.createCollisions(tileSize);

    // Zone manager
    this.zoneManager = new ZoneManager(this);

    // Player — start on the path just west of the farmhouse porch
    const startX = 45 * tileSize;
    const startY = 51 * tileSize;
    this.player = new Player(this, startX, startY);

    // Collision between player and buildings
    this.physics.add.collider(this.player, this.collisionGroup);

    // Camera
    this.cameras.main.setBounds(0, 0, widthPx, heightPx);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // ─── Sprint 2: Time & Weather Systems ──────────────────
    this.timeSystem = new TimeSystem();
    this.weatherSystem = new WeatherSystem();
    this.dayNightRenderer = new DayNightRenderer(this);
    this.weatherRenderer = new WeatherRenderer(this);

    // ─── Sprint 3: Chickens & Interactions ────────────────
    this.spawnChickens(tileSize);
    this.animalStatSystem = new AnimalStatSystem(this.chickenEntities);
    this.interactionSystem = new InteractionSystem();
    this.interactionSystem.setChickens(this.chickenEntities);
    this.createInteractables(tileSize);

    // ─── Sprint 4: Eggs, Door, Predators ────────────────────
    this.eggSystem = new EggSystem(this, this.chickenEntities);
    this.coopDoorSystem = new CoopDoorSystem(this.chickenEntities);
    this.predatorSystem = new PredatorSystem(this, this.chickenEntities, this.coopDoorSystem);
    this.roosterSystem = new RoosterSystem(this.chickenEntities.find(c => c.role === 'rooster'));
    this.createCoopInteractables(tileSize);

    // ─── Sprint 5: Cleaning, Hatching, Audio ──────────────
    this.coopCleaningSystem = new CoopCleaningSystem(this, this.chickenEntities);
    this.hatchingSystem = new HatchingSystem(this, this.chickenEntities, () => this.eggSystem['eggEntities']);
    this.audioSystem = new AudioSystem(this);
    this.eggSystem.setAudioSystem(this.audioSystem);
    this.createSprint5Interactables(tileSize);

    // ─── Phase 2: Goats, Horses, Cats ───────────────────────
    this.spawnGoats(tileSize);
    this.spawnHorses(tileSize);
    this.spawnCats(tileSize);
    this.animalStatSystem.setGoats(this.goatEntities);
    this.animalStatSystem.setHorses(this.horseEntities);
    this.animalStatSystem.setCats(this.catEntities);
    this.interactionSystem.setGoats(this.goatEntities);
    this.interactionSystem.setHorses(this.horseEntities);
    this.interactionSystem.setCats(this.catEntities);
    this.goatMischiefSystem = new GoatMischiefSystem(this.goatEntities);
    this.fenceSystem = new FenceSystem();
    this.horseCareSystem = new HorseCareSystem(this.horseEntities);
    this.catAttentionSystem = new CatAttentionSystem(this.catEntities);
    this.waterSystem = new WaterSystem(this.chickenEntities, this.goatEntities, this.horseEntities, this.catEntities);
    this.createPhase2Interactables(tileSize);
    this.createFences(tileSize);

    // Wire player spacebar to interaction system
    this.player.onInteract = () => this.interactionSystem.tryInteract();

    // ESC key to toggle pause (Phaser captures keyboard, so handle here)
    if (this.input.keyboard) {
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => {
        pauseMenuOpen.update(v => {
          const newVal = !v;
          gamePaused.set(newVal);
          return newVal;
        });
      });
    }

    // Restore stamina on sleep + autosave
    gameEvents.on('new-day', () => {
      playerStamina.set(CONFIG.stamina.max);
      // Autosave to slot 0
      saveSystem.save(0).catch(() => {});
    });

    gameReady.set(true);
  }

  update(_time: number, delta: number) {
    const paused = get(gamePaused);

    if (!paused) {
      // Advance game time
      this.timeSystem.update(delta);

      // Update visual systems
      this.dayNightRenderer.update();
      this.weatherRenderer.update();

      // Animal stat decay (checks hourly internally)
      this.animalStatSystem.update();

      // Update chickens
      for (const chicken of this.chickenEntities) {
        chicken.update(this.player.x, this.player.y);
      }

      // Interaction proximity detection
      this.interactionSystem.update(delta);

      // Sprint 4 systems
      this.eggSystem.update();
      this.coopDoorSystem.update();
      this.predatorSystem.update(delta);
      this.roosterSystem.update(delta);

      // Sprint 5 systems
      this.coopCleaningSystem.update();
      this.hatchingSystem.update();
      this.audioSystem.update();

      // Phase 2: Update new animals
      for (const goat of this.goatEntities) goat.update(this.player.x, this.player.y);
      for (const horse of this.horseEntities) horse.update(this.player.x, this.player.y);
      for (const cat of this.catEntities) cat.update(this.player.x, this.player.y);
      this.goatMischiefSystem.update(delta);
      this.fenceSystem.update();
      this.horseCareSystem.update();
      this.catAttentionSystem.update();
      this.waterSystem.update();
      this.updateWaterBars();
    }

    // Player always updates (but velocity is 0 when paused via input)
    this.player.update(paused);
    this.zoneManager.update(this.player.x, this.player.y);

    // Update FPS store every 30 frames
    if (this.game.loop.frame % 30 === 0) {
      fps.set(Math.round(this.game.loop.actualFps));
    }
  }

  private spawnChickens(tileSize: number) {
    // Coop zone: x:4, y:44, w:10, h:10 tiles
    // Chicken yard: x:4, y:36, w:14, h:8 tiles
    // Chickens start in the yard (open area)
    const yardBounds = {
      minX: 4 * tileSize + 10,
      maxX: (4 + 14) * tileSize - 10,
      minY: 36 * tileSize + 10,
      maxY: (36 + 8) * tileSize - 10,
    };

    CONFIG.chickens.defaults.forEach((def, i) => {
      const chicken = new Chicken(this, i, {
        name: def.name,
        role: def.role,
        breed: def.breed,
        color: def.color,
      }, yardBounds);

      this.chickenEntities.push(chicken);
      chicken.syncToStore();
    });
  }

  private createInteractables(tileSize: number) {
    // Feeder inside coop (x:4, y:44 zone — place at tile 7, 47)
    const feeder = new Interactable(this, {
      id: 'chicken-feeder',
      x: 7 * tileSize,
      y: 47 * tileSize,
      label: 'Feed Chickens',
      staminaCost: CONFIG.stamina.costs.feedAnimal,
      color: 0xdaa520,
      size: 16,
      spriteKey: 'feeder_sprite',
      onInteract: () => {
        for (const chicken of this.chickenEntities) {
          chicken.feed(CONFIG.chickens.hunger.feederFill);
          chicken.syncToStore();
        }
      },
    });
    this.interactionSystem.register(feeder);

    // Waterer inside coop (tile 11, 47) — requires water bucket
    const waterer = new Interactable(this, {
      id: 'chicken-waterer',
      x: 11 * tileSize,
      y: 47 * tileSize,
      label: 'Water Chickens',
      staminaCost: CONFIG.stamina.costs.waterAnimal,
      color: 0x4169e1,
      size: 16,
      spriteKey: 'waterer_sprite',
      requiresItem: 'water-bucket',
      requiresItemHint: 'Fill a bucket at the well first',
      onInteract: () => {
        waterLevels.update(l => ({ ...l, 'chicken-waterer': Math.min(100, (l['chicken-waterer'] ?? 0) + CONFIG.water.bucketFill) }));
        addNotification('Filled chicken waterer!', 'positive');
      },
    });
    this.interactionSystem.register(waterer);
    this.addWaterBar('chicken-waterer', 11 * tileSize, 47 * tileSize);

    // Kitchen at farmhouse door (outside west wall)
    const kitchen = new Interactable(this, {
      id: 'kitchen',
      x: 47 * tileSize,
      y: 53 * tileSize,
      label: 'Eat Meal (+35 stamina)',
      staminaCost: 0,
      color: 0xff8c00,
      size: 16,
      spriteKey: 'kitchen_sprite',
      onInteract: () => {
        playerStamina.update(s => Math.min(CONFIG.stamina.max, s + CONFIG.stamina.regenPerMeal));
      },
    });
    this.interactionSystem.register(kitchen);
  }

  // ─── Map Drawing (enhanced art) ──────────────────────────

  private drawMap(widthTiles: number, heightTiles: number, tileSize: number) {
    // Base grass with subtle variation
    const gfx = this.add.graphics();
    gfx.setDepth(0);

    // Draw grass base with color variation
    const rng = new Phaser.Math.RandomDataGenerator(['farmgrass']);
    for (let ty = 0; ty < heightTiles; ty++) {
      for (let tx = 0; tx < widthTiles; tx++) {
        const isWoods = tx < 3 || tx >= widthTiles - 3 || ty < 3 || ty >= heightTiles - 2;
        if (isWoods) {
          const shade = rng.pick([0x2d5016, 0x264a12, 0x1f4010]);
          gfx.fillStyle(shade, 1);
        } else {
          const shade = rng.pick([0x5a8f3c, 0x528738, 0x629742, 0x4f8235]);
          gfx.fillStyle(shade, 1);
        }
        gfx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);

        // Grass blade details on non-woods tiles
        if (!isWoods && rng.frac() > 0.5) {
          gfx.fillStyle(rng.pick([0x4d7a32, 0x6b9f4a]), 0.4);
          gfx.fillRect(
            tx * tileSize + rng.between(4, tileSize - 6),
            ty * tileSize + rng.between(4, tileSize - 6),
            1, rng.between(2, 5),
          );
        }
      }
    }

    // Tree sprites in the woods perimeter
    const treeRng = new Phaser.Math.RandomDataGenerator(['farmtrees']);
    for (let i = 0; i < 80; i++) {
      const edge = treeRng.between(0, 3);
      let tx: number, ty: number;
      switch (edge) {
        case 0: tx = treeRng.between(0, widthTiles - 1); ty = treeRng.between(0, 2); break;
        case 1: tx = treeRng.between(0, widthTiles - 1); ty = treeRng.between(heightTiles - 2, heightTiles - 1); break;
        case 2: tx = treeRng.between(0, 2); ty = treeRng.between(3, heightTiles - 3); break;
        default: tx = treeRng.between(widthTiles - 3, widthTiles - 1); ty = treeRng.between(3, heightTiles - 3); break;
      }
      const variant = treeRng.between(0, 2);
      const tree = this.add.image(
        tx * tileSize + tileRng(treeRng, tileSize),
        ty * tileSize + tileRng(treeRng, tileSize),
        `tree_${variant}`,
      );
      tree.setDepth(ty < 3 ? 0.5 : 7); // Trees in front have higher depth
      tree.setScale(0.8 + treeRng.frac() * 0.4);
    }
  }

  private drawZones(tileSize: number) {
    const gfx = this.add.graphics();
    gfx.setDepth(1);

    for (const zone of ZONE_DEFS) {
      const x = zone.x * tileSize;
      const y = zone.y * tileSize;
      const w = zone.width * tileSize;
      const h = zone.height * tileSize;

      const isBuilding = ['farmhouse', 'horse_barn', 'coop', 'equip_shed', 'hay_storage', 'feed_store'].includes(zone.name);
      const isFenced = ['chicken_yard', 'paddock', 'goat_pen'].includes(zone.name);

      if (isBuilding) {
        this.drawBuilding(gfx, x, y, w, h, zone.name, zone.color);
      } else if (isFenced) {
        this.drawFencedArea(gfx, x, y, w, h, zone.color, tileSize);
      } else if (zone.name === 'pond') {
        this.drawPond(gfx, x, y, w, h);
      } else if (zone.name === 'flower_garden') {
        this.drawFlowerGarden(gfx, x, y, w, h);
      } else if (zone.name === 'farmers_market') {
        this.drawFarmersMarket(gfx, x, y, w, h);
      } else {
        // Generic zone
        gfx.fillStyle(zone.color, 0.2);
        gfx.fillRect(x, y, w, h);
      }
    }
  }

  private drawBuilding(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, name: string, color: number) {
    const darker = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
    const lighter = Phaser.Display.Color.IntegerToColor(color).lighten(10).color;

    // Foundation
    gfx.fillStyle(0x555555, 1);
    gfx.fillRect(x + 2, y + h - 6, w - 4, 6);

    // Walls
    gfx.fillStyle(color, 0.85);
    gfx.fillRect(x + 4, y + 12, w - 8, h - 18);

    // Roof (darker, triangular shape feel)
    gfx.fillStyle(darker, 1);
    gfx.fillRect(x, y + 2, w, 12);
    gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    gfx.fillRect(x + 2, y, w - 4, 4);

    // Roof ridge
    gfx.fillStyle(0x444444, 1);
    gfx.fillRect(x + w / 2 - 2, y - 1, 4, 2);

    // Windows
    gfx.fillStyle(0x88bbdd, 0.8);
    const windowSpacing = Math.max(48, w / 4);
    for (let wx = x + 20; wx < x + w - 30; wx += windowSpacing) {
      gfx.fillRect(wx, y + 18, 16, 12);
      // Window frame
      gfx.lineStyle(1, 0x5a4a32, 1);
      gfx.strokeRect(wx, y + 18, 16, 12);
      // Cross panes
      gfx.fillStyle(0x5a4a32, 1);
      gfx.fillRect(wx + 7, y + 18, 2, 12);
      gfx.fillRect(wx, y + 23, 16, 2);
      gfx.fillStyle(0x88bbdd, 0.8);
    }

    // Door
    gfx.fillStyle(0x5a3a1e, 1);
    const doorW = 14;
    const doorH = 22;
    const doorX = x + w / 2 - doorW / 2;
    const doorY = y + h - doorH - 6;
    gfx.fillRect(doorX, doorY, doorW, doorH);
    gfx.fillStyle(0x4a2e14, 1);
    gfx.fillRect(doorX, doorY, doorW, 2);
    gfx.fillRect(doorX, doorY + doorH / 2, doorW, 2);
    // Doorknob
    gfx.fillStyle(0xccaa44, 1);
    gfx.fillCircle(doorX + doorW - 4, doorY + doorH / 2, 2);

    // Building outline
    gfx.lineStyle(1, 0x333333, 0.5);
    gfx.strokeRect(x + 4, y + 12, w - 8, h - 18);
  }

  private drawFencedArea(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, tileSize: number) {
    // Lighter grass inside
    gfx.fillStyle(color, 0.15);
    gfx.fillRect(x, y, w, h);

    // Fence posts and rails
    const postSpacing = tileSize * 2;
    const postColor = 0x7a5c28;
    const railColor = 0x8b6914;

    // Horizontal rails (top and bottom)
    gfx.fillStyle(railColor, 0.9);
    gfx.fillRect(x, y, w, 2);
    gfx.fillRect(x, y + 4, w, 1);
    gfx.fillRect(x, y + h - 2, w, 2);
    gfx.fillRect(x, y + h - 5, w, 1);

    // Vertical rails (left and right)
    gfx.fillRect(x, y, 2, h);
    gfx.fillRect(x + 4, y, 1, h);
    gfx.fillRect(x + w - 2, y, 2, h);
    gfx.fillRect(x + w - 5, y, 1, h);

    // Posts
    for (let px = x; px <= x + w; px += postSpacing) {
      gfx.fillStyle(postColor, 1);
      gfx.fillRect(px - 3, y - 3, 6, 8);
      gfx.fillRect(px - 3, y + h - 5, 6, 8);
    }
    for (let py = y; py <= y + h; py += postSpacing) {
      gfx.fillStyle(postColor, 1);
      gfx.fillRect(x - 3, py - 3, 8, 6);
      gfx.fillRect(x + w - 5, py - 3, 8, 6);
    }
  }

  private drawPond(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    // Bank
    gfx.fillStyle(0x6b8f4a, 1);
    gfx.fillEllipse(x + w / 2, y + h / 2, w - 4, h - 4);
    // Water
    gfx.fillStyle(0x3366aa, 0.8);
    gfx.fillEllipse(x + w / 2, y + h / 2, w - 20, h - 16);
    // Lighter water highlight
    gfx.fillStyle(0x5588cc, 0.4);
    gfx.fillEllipse(x + w / 2 - 10, y + h / 2 - 6, w / 3, h / 4);
    // Reeds
    gfx.fillStyle(0x4a7a32, 0.8);
    gfx.fillRect(x + 12, y + 8, 2, 10);
    gfx.fillRect(x + 16, y + 6, 2, 12);
    gfx.fillRect(x + w - 16, y + h - 18, 2, 10);
  }

  private drawFlowerGarden(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    // Garden bed soil
    gfx.fillStyle(0x5a3a1e, 0.4);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(1, 0x8b6914, 0.5);
    gfx.strokeRect(x, y, w, h);

    // Flowers with stems
    const flowerRng = new Phaser.Math.RandomDataGenerator(['flowers']);
    const petalColors = [0xff69b4, 0xff4500, 0xffff00, 0xda70d6, 0xff6347, 0xff88aa, 0xffaa00];
    for (let i = 0; i < 30; i++) {
      const fx = x + flowerRng.between(8, w - 8);
      const fy = y + flowerRng.between(12, h - 4);
      const stemH = flowerRng.between(6, 12);
      // Stem
      gfx.fillStyle(0x228b22, 0.7);
      gfx.fillRect(fx, fy - stemH, 1, stemH);
      // Leaf
      if (flowerRng.frac() > 0.5) {
        gfx.fillStyle(0x32a852, 0.6);
        gfx.fillEllipse(fx + 2, fy - stemH / 2, 4, 2);
      }
      // Petals
      const color = flowerRng.pick(petalColors);
      gfx.fillStyle(color, 0.9);
      gfx.fillCircle(fx, fy - stemH, 3);
      // Center
      gfx.fillStyle(0xffff88, 1);
      gfx.fillCircle(fx, fy - stemH, 1);
    }
  }

  private drawFarmersMarket(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    // Ground area
    gfx.fillStyle(0xa08050, 0.3);
    gfx.fillRect(x, y, w, h);

    // Stalls
    const stallW = (w - 20) / 3;
    const stallColors = [0xcc4444, 0x44aa44, 0x4488cc];
    for (let i = 0; i < 3; i++) {
      const sx = x + 5 + i * (stallW + 5);
      // Table
      gfx.fillStyle(0x8b6914, 1);
      gfx.fillRect(sx, y + h / 2, stallW, h / 2 - 4);
      // Awning
      gfx.fillStyle(stallColors[i], 0.8);
      gfx.fillRect(sx - 2, y + 4, stallW + 4, h / 2 - 6);
      // Awning stripes
      gfx.fillStyle(0xffffff, 0.2);
      for (let sy = y + 4; sy < y + h / 2 - 2; sy += 6) {
        gfx.fillRect(sx - 2, sy, stallW + 4, 2);
      }
      // Poles
      gfx.fillStyle(0x666666, 1);
      gfx.fillRect(sx, y + 4, 2, h - 8);
      gfx.fillRect(sx + stallW - 2, y + 4, 2, h - 8);
    }
  }

  private drawPaths(tileSize: number) {
    const gfx = this.add.graphics();
    gfx.setDepth(0.5);
    gfx.fillStyle(0xa0825a, 1);
    const pw = 2;
    const pathX = 44;
    gfx.fillRect(pathX * tileSize, 4 * tileSize, pw * tileSize, 52 * tileSize);
    gfx.fillRect(44 * tileSize, 50 * tileSize, 6 * tileSize, pw * tileSize);
    gfx.fillRect(14 * tileSize, 42 * tileSize, 30 * tileSize, pw * tileSize);
    gfx.fillRect(22 * tileSize, 34 * tileSize, 26 * tileSize, pw * tileSize);
    gfx.fillRect(16 * tileSize, 18 * tileSize, 44 * tileSize, pw * tileSize);
    gfx.fillRect(44 * tileSize, 28 * tileSize, 6 * tileSize, pw * tileSize);
    gfx.fillRect(24 * tileSize, 8 * tileSize, 20 * tileSize, pw * tileSize);
    gfx.fillRect(44 * tileSize, 42 * tileSize, 6 * tileSize, pw * tileSize);
    gfx.fillRect(34 * tileSize, 50 * tileSize, 10 * tileSize, pw * tileSize);
    gfx.fillRect(60 * tileSize, 18 * tileSize, 4 * tileSize, pw * tileSize);
  }

  private createCollisions(tileSize: number) {
    const { widthPx, heightPx } = CONFIG.map;
    const wallThickness = 3 * tileSize;
    this.addCollisionRect(0, 0, widthPx, wallThickness);
    this.addCollisionRect(0, heightPx - 2 * tileSize, widthPx, 2 * tileSize);
    this.addCollisionRect(0, 0, wallThickness, heightPx);
    this.addCollisionRect(widthPx - 3 * tileSize, 0, 3 * tileSize, heightPx);

    // Note: 'coop' removed from solid zones so player can enter to feed, water, gather eggs
    const solidZones = ['farmhouse', 'horse_barn', 'equip_shed', 'hay_storage', 'feed_store'];
    for (const zone of ZONE_DEFS) {
      if (solidZones.includes(zone.name)) {
        this.addCollisionRect(zone.x * tileSize, zone.y * tileSize, zone.width * tileSize, zone.height * tileSize);
      }
    }
    const pond = ZONE_DEFS.find(z => z.name === 'pond')!;
    this.addCollisionRect(pond.x * tileSize, pond.y * tileSize, pond.width * tileSize, pond.height * tileSize);
  }

  private createCoopInteractables(tileSize: number) {
    // Coop door is now handled by createFences() gate system
    // Nesting area — eggs are collected by walking over them
  }

  private createSprint5Interactables(tileSize: number) {
    // Pitchfork pickup (tile 8, 49)
    const pitchfork = new Interactable(this, {
      id: 'pitchfork-source',
      x: 8 * tileSize,
      y: 49 * tileSize,
      label: 'Pitchfork',
      staminaCost: 0,
      color: 0x8b6914,
      size: 14,
      spriteKey: 'pitchfork_sprite',
      givesItem: { id: 'pitchfork', label: 'Pitchfork', spriteKey: 'pitchfork_sprite' },
      onInteract: () => {},
    });
    this.interactionSystem.register(pitchfork);

    // Coop cleaning spot (tile 9, 47) — requires pitchfork
    const coopClean = new Interactable(this, {
      id: 'coop-clean',
      x: 9 * tileSize,
      y: 47 * tileSize,
      label: 'Clean Coop',
      staminaCost: CONFIG.stamina.costs.cleanCoop,
      color: 0x8b6914,
      size: 14,
      requiresItem: 'pitchfork',
      requiresItemHint: 'Pick up the pitchfork first',
      onInteract: () => {
        this.coopCleaningSystem.clean();
        this.audioSystem.playSFX('clean');
      },
    });
    this.interactionSystem.register(coopClean);

    // Treat dispenser (tile 12, 49)
    const treats = new Interactable(this, {
      id: 'treats',
      x: 12 * tileSize,
      y: 49 * tileSize,
      label: 'Give Treats',
      staminaCost: 1,
      color: 0xff8c00,
      size: 12,
      spriteKey: 'treat_sprite',
      onInteract: () => {
        for (const chicken of this.chickenEntities) {
          chicken.hunger = Math.min(100, chicken.hunger + CONFIG.chickens.hunger.treatBoost);
          chicken.happiness = Math.min(100, chicken.happiness + 10);
          chicken.syncToStore();
        }
        addNotification('Chickens loved the treats!', 'positive');
      },
    });
    this.interactionSystem.register(treats);
  }

  private spawnGoats(tileSize: number) {
    const bounds = {
      minX: 22 * tileSize + 10, maxX: (22 + 12) * tileSize - 10,
      minY: 32 * tileSize + 10, maxY: (32 + 10) * tileSize - 10,
    };
    CONFIG.goats.defaults.forEach((def, i) => {
      const goat = new Goat(this, i, { name: def.name, personality: def.personality, color: def.color }, bounds);
      this.goatEntities.push(goat);
      goat.syncToStore();
    });
  }

  private spawnHorses(tileSize: number) {
    const bounds = {
      minX: 4 * tileSize + 15, maxX: (4 + 16) * tileSize - 15,
      minY: 22 * tileSize + 15, maxY: (22 + 10) * tileSize - 15,
    };
    CONFIG.horses.defaults.forEach((def, i) => {
      const horse = new Horse(this, i, { name: def.name, breed: def.breed, color: def.color }, bounds);
      this.horseEntities.push(horse);
      horse.syncToStore();
    });
  }

  private spawnCats(tileSize: number) {
    // Cats live in the barn area
    const barnX = 10 * tileSize;
    const barnY = 26 * tileSize;
    CONFIG.cats.defaults.forEach((def, i) => {
      const cat = new Cat(this, i, { name: def.name, color: def.color, pattern: def.pattern },
        barnX + Phaser.Math.Between(-30, 30), barnY + Phaser.Math.Between(-30, 30));
      this.catEntities.push(cat);
      cat.syncToStore();
    });
  }

  private createPhase2Interactables(tileSize: number) {
    // ─── Well (center of farm) ───────
    const well = new Interactable(this, {
      id: 'well', x: 40 * tileSize, y: 28 * tileSize,
      label: 'Well', staminaCost: 0,
      color: 0x888888, size: 16, spriteKey: 'well_sprite',
      givesItem: { id: 'water-bucket', label: 'Water Bucket', spriteKey: 'bucket_sprite' },
      onInteract: () => {},
    });
    this.interactionSystem.register(well);

    // ─── Leash (near barn entrance) ───────
    const leash = new Interactable(this, {
      id: 'leash-source', x: 16 * tileSize, y: 24 * tileSize,
      label: 'Leash', staminaCost: 0,
      color: 0xdaa520, size: 12, spriteKey: 'leash_sprite',
      givesItem: { id: 'leash', label: 'Leash', spriteKey: 'leash_sprite' },
      onInteract: () => {},
    });
    this.interactionSystem.register(leash);

    // ─── Goat Pen Interactables ───────
    const goatFeeder = new Interactable(this, {
      id: 'goat-feeder', x: 25 * tileSize, y: 35 * tileSize,
      label: 'Feed Goats', staminaCost: CONFIG.stamina.costs.feedAnimal,
      color: 0xdaa520, size: 16, spriteKey: 'feeder_sprite',
      onInteract: () => {
        for (const g of this.goatEntities) { g.feed(CONFIG.goats.hunger.feedFill); g.syncToStore(); }
      },
    });
    this.interactionSystem.register(goatFeeder);

    const goatWaterer = new Interactable(this, {
      id: 'goat-waterer', x: 30 * tileSize, y: 35 * tileSize,
      label: 'Water Goats', staminaCost: CONFIG.stamina.costs.waterAnimal,
      color: 0x4169e1, size: 16, spriteKey: 'waterer_sprite',
      requiresItem: 'water-bucket',
      requiresItemHint: 'Fill a bucket at the well first',
      onInteract: () => {
        waterLevels.update(l => ({ ...l, 'goat-waterer': Math.min(100, (l['goat-waterer'] ?? 0) + CONFIG.water.bucketFill) }));
        addNotification('Filled goat waterer!', 'positive');
      },
    });
    this.interactionSystem.register(goatWaterer);
    this.addWaterBar('goat-waterer', 30 * tileSize, 35 * tileSize);

    const giveTreat = new Interactable(this, {
      id: 'goat-treat', x: 28 * tileSize, y: 38 * tileSize,
      label: 'Give Goat Treats', staminaCost: 1,
      color: 0xff8c00, size: 12, spriteKey: 'treat_sprite',
      onInteract: () => {
        for (const g of this.goatEntities) {
          g.hunger = Math.min(100, g.hunger + CONFIG.goats.hunger.treatFill);
          g.mischief = Math.max(0, g.mischief - CONFIG.goats.mischief.treatReduction);
          g.syncToStore();
        }
        addNotification('Goats love the treats! Mischief reduced.', 'positive');
      },
    });
    this.interactionSystem.register(giveTreat);

    // ─── Horse Barn/Paddock Interactables (at barn door, south edge y=22) ───────
    const hayRack = new Interactable(this, {
      id: 'horse-hay', x: 8 * tileSize, y: 24 * tileSize,
      label: 'Feed Hay', staminaCost: CONFIG.stamina.costs.feedAnimal,
      color: 0xdaa520, size: 16, spriteKey: 'feeder_sprite',
      onInteract: () => {
        for (const h of this.horseEntities) { h.feed(CONFIG.horses.hunger.hayFill); h.syncToStore(); }
      },
    });
    this.interactionSystem.register(hayRack);

    const horseTrough = new Interactable(this, {
      id: 'horse-water', x: 12 * tileSize, y: 24 * tileSize,
      label: 'Fill Horse Trough', staminaCost: CONFIG.stamina.costs.waterAnimal,
      color: 0x4169e1, size: 16, spriteKey: 'waterer_sprite',
      requiresItem: 'water-bucket',
      requiresItemHint: 'Fill a bucket at the well first',
      onInteract: () => {
        waterLevels.update(l => ({ ...l, 'horse-water': Math.min(100, (l['horse-water'] ?? 0) + CONFIG.water.bucketFill) }));
        addNotification('Horse trough filled!', 'positive');
      },
    });
    this.interactionSystem.register(horseTrough);
    this.addWaterBar('horse-water', 12 * tileSize, 24 * tileSize);

    // Brush pickup
    const brushSource = new Interactable(this, {
      id: 'brush-source', x: 10 * tileSize, y: 24 * tileSize,
      label: 'Horse Brush', staminaCost: 0,
      color: 0xaa8844, size: 14,
      givesItem: { id: 'brush', label: 'Brush', spriteKey: 'brush_sprite' },
      onInteract: () => {},
    });
    this.interactionSystem.register(brushSource);

    // Brush use spot (in paddock, near horses)
    const brushUse = new Interactable(this, {
      id: 'horse-brush-use', x: 10 * tileSize, y: 26 * tileSize,
      label: 'Brush Horses', staminaCost: CONFIG.stamina.costs.brushHorse,
      color: 0xaa8844, size: 14,
      requiresItem: 'brush',
      requiresItemHint: 'Pick up the brush first',
      onInteract: () => {
        for (const h of this.horseEntities) { h.brush(CONFIG.horses.coat.brushBoost); h.syncToStore(); }
        addNotification('Horses groomed! Coats looking shiny.', 'positive');
      },
    });
    this.interactionSystem.register(brushUse);

    // ─── Cat Interactables (near farmhouse) ───────
    const catFood = new Interactable(this, {
      id: 'cat-food', x: 6 * tileSize, y: 24 * tileSize,
      label: 'Feed Cats', staminaCost: CONFIG.stamina.costs.feedAnimal,
      color: 0xdaa520, size: 14, spriteKey: 'feeder_sprite',
      onInteract: () => {
        for (const c of this.catEntities) { c.feed(CONFIG.cats.hunger.feedFill); c.syncToStore(); }
      },
    });
    this.interactionSystem.register(catFood);

    const catWater = new Interactable(this, {
      id: 'cat-water', x: 6 * tileSize, y: 26 * tileSize,
      label: 'Water Cats', staminaCost: CONFIG.stamina.costs.waterAnimal,
      color: 0x4169e1, size: 14, spriteKey: 'waterer_sprite',
      requiresItem: 'water-bucket',
      requiresItemHint: 'Fill a bucket at the well first',
      onInteract: () => {
        waterLevels.update(l => ({ ...l, 'cat-water': Math.min(100, (l['cat-water'] ?? 0) + CONFIG.water.bucketFill) }));
        addNotification('Cat water bowl filled!', 'positive');
      },
    });
    this.interactionSystem.register(catWater);
    this.addWaterBar('cat-water', 6 * tileSize, 26 * tileSize);

    // Pet cats: handled by walk-up proximity in InteractionSystem

    // ─── Fence Repair (near goat pen) ───────
    const fenceRepair = new Interactable(this, {
      id: 'fence-repair', x: 20 * tileSize, y: 36 * tileSize,
      label: 'Repair Fence (-$25)', staminaCost: CONFIG.stamina.costs.repairFence,
      color: 0x8b6914, size: 14,
      onInteract: () => {
        const money = get(playerMoney);
        if (money < CONFIG.fences.repairCost) {
          addNotification('Not enough money for repairs!', 'warning');
          return;
        }
        playerMoney.update(m => m - CONFIG.fences.repairCost);
        const sections = get(fenceSections);
        const weakest = sections.indexOf(Math.min(...sections));
        this.fenceSystem.repairSection(weakest);
        addNotification(`Fence section ${weakest + 1} repaired!`, 'positive');
      },
    });
    this.interactionSystem.register(fenceRepair);
  }

  private addCollisionRect(x: number, y: number, w: number, h: number) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h);
    rect.setVisible(false);
    this.physics.add.existing(rect, true);
    this.collisionGroup.add(rect);
  }

  /** Add a togglable collision rect with a visible gate marker */
  private addGateCollider(id: string, x: number, y: number, w: number, h: number) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h);
    rect.setVisible(false);
    this.physics.add.existing(rect, true);
    this.collisionGroup.add(rect);
    this.gateColliders.set(id, rect);

    // Visible gate bar (brown when closed)
    const visual = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x8b6914, 0.9);
    visual.setDepth(3);
    visual.setStrokeStyle(1, 0x5c3a1e, 1);
    this.gateVisuals.set(id, visual);
  }

  private toggleGate(gateId: string) {
    const rect = this.gateColliders.get(gateId);
    if (!rect) return;
    const states = get(gateStates);
    const isOpen = states[gateId] ?? false;
    const newState = !isOpen;
    gateStates.update(s => ({ ...s, [gateId]: newState }));

    // Enable/disable the collision body
    const body = rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = !newState;

    // Show/hide the visual gate bar
    const visual = this.gateVisuals.get(gateId);
    if (visual) {
      if (newState) {
        visual.setAlpha(0.2); // Faded = open
        visual.setFillStyle(0x4a8a4a, 0.3); // Green tint when open
      } else {
        visual.setAlpha(0.9); // Solid = closed
        visual.setFillStyle(0x8b6914, 0.9); // Brown when closed
      }
    }

    addNotification(newState ? 'Gate opened.' : 'Gate closed.', 'info');
  }

  // ─── Water Level Bars ──────────────────────────────────

  addWaterBar(watererId: string, x: number, y: number) {
    const barWidth = 24;
    const barHeight = 4;
    const offsetY = 16; // below the waterer sprite

    const bg = this.add.rectangle(x, y + offsetY, barWidth, barHeight, 0x333333, 0.8);
    bg.setDepth(2);
    const fill = this.add.rectangle(x - barWidth / 2, y + offsetY, 0, barHeight, 0x4488cc, 0.9);
    fill.setOrigin(0, 0.5);
    fill.setDepth(2);

    this.waterBars.set(watererId, { bg, fill });
  }

  private updateWaterBars() {
    const levels = get(waterLevels);
    for (const [id, bar] of this.waterBars.entries()) {
      const level = levels[id] ?? 0;
      const maxWidth = 24;
      bar.fill.width = (level / 100) * maxWidth;

      // Color based on level
      if (level <= 10) {
        bar.fill.setFillStyle(0xe74c3c, 0.9); // red
      } else if (level <= 30) {
        bar.fill.setFillStyle(0xf39c12, 0.9); // orange
      } else {
        bar.fill.setFillStyle(0x4488cc, 0.9); // blue
      }
    }
  }

  // ─── Fences & Gates ────────────────────────────────────

  private createFences(tileSize: number) {
    const T = tileSize;
    const gateW = 3 * T; // 3-tile wide gate openings

    // ─── Chicken Yard (4,36 → 18,44) ───────
    this.addCollisionRect(4 * T, 36 * T, 14 * T, T);     // North wall
    this.addCollisionRect(18 * T, 36 * T, T, 8 * T);      // East wall (outer edge)
    // South wall — gate at east end (x=15-18) so it's reachable from outside
    this.addCollisionRect(4 * T, 44 * T, 11 * T, T);      // left of gate
    this.addGateCollider('gate-chicken-yard', 15 * T, 44 * T, gateW, T);
    // Gate interactable at outer edge of south fence
    const chickenGate = new Interactable(this, {
      id: 'gate-chicken-yard', x: 16 * T + T / 2, y: 44 * T + T / 2,
      label: 'Open/Close Gate', staminaCost: 0,
      color: 0x8b6914, size: 12,
      onInteract: () => this.toggleGate('gate-chicken-yard'),
    });
    this.interactionSystem.register(chickenGate);

    // ─── Coop (4,44 → 14,54) — player must open door to enter ───────
    // East wall with gate (door) at y=48-51
    this.addCollisionRect(14 * T, 44 * T, T, 4 * T);      // above door
    this.addGateCollider('gate-coop', 14 * T, 48 * T, T, gateW);
    this.addCollisionRect(14 * T, 51 * T, T, 3 * T);      // below door
    // South wall
    this.addCollisionRect(4 * T, 54 * T, 10 * T, T);
    // Coop door interactable at outer edge
    const coopGate = new Interactable(this, {
      id: 'gate-coop', x: 14 * T + T / 2, y: 49 * T + T / 2,
      label: 'Open/Close Coop Door', staminaCost: 0,
      color: 0x8b4513, size: 14,
      onInteract: () => {
        this.toggleGate('gate-coop');
        this.coopDoorSystem.toggle();
      },
    });
    this.interactionSystem.register(coopGate);

    // ─── Paddock (4,22 → 20,32) ───────
    this.addCollisionRect(20 * T, 22 * T, T, 10 * T);     // East wall (outer edge)
    // South wall — gate at east end (x=17-20) reachable from outside
    this.addCollisionRect(4 * T, 32 * T, 13 * T, T);      // left of gate
    this.addGateCollider('gate-paddock', 17 * T, 32 * T, gateW, T);
    const paddockGate = new Interactable(this, {
      id: 'gate-paddock', x: 18 * T + T / 2, y: 32 * T + T / 2,
      label: 'Open/Close Gate', staminaCost: 0,
      color: 0x8b6914, size: 12,
      onInteract: () => this.toggleGate('gate-paddock'),
    });
    this.interactionSystem.register(paddockGate);

    // ─── Goat Pen (22,32 → 34,42) ───────
    this.addCollisionRect(22 * T, 32 * T, 12 * T, T);     // North wall
    this.addCollisionRect(34 * T, 32 * T, T, 10 * T);     // East wall (outer edge)
    this.addCollisionRect(22 * T, 42 * T, 12 * T, T);     // South wall
    // West wall — gate at bottom (y=39-42) reachable from outside
    this.addCollisionRect(22 * T, 32 * T, T, 7 * T);      // above gate
    this.addGateCollider('gate-goat-pen', 22 * T, 39 * T, T, gateW);
    const goatGate = new Interactable(this, {
      id: 'gate-goat-pen', x: 22 * T - T / 2, y: 40 * T + T / 2,
      label: 'Open/Close Gate', staminaCost: 0,
      color: 0x8b6914, size: 12,
      onInteract: () => this.toggleGate('gate-goat-pen'),
    });
    this.interactionSystem.register(goatGate);
  }
}

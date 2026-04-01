import Phaser from 'phaser';
import { currentZone } from '$lib/stores/gameStore';

export interface ZoneDefinition {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
}

// Zone coordinates based on Farm_Map_Layout.md (80x60 grid at 32px)
// Coordinates are in tiles, converted to pixels in the constructor
export const ZONE_DEFS: ZoneDefinition[] = [
  // Farmhouse (bottom-right)
  { name: 'farmhouse', x: 48, y: 48, width: 14, height: 10, color: 0x8b7355, label: 'Farmhouse' },
  // Chicken Coop & Yard (bottom-left)
  { name: 'coop', x: 4, y: 44, width: 10, height: 10, color: 0xcd853f, label: 'Chicken Coop' },
  { name: 'chicken_yard', x: 4, y: 36, width: 14, height: 8, color: 0x90ee90, label: 'Chicken Yard' },
  // Horse Barn (upper-left)
  { name: 'horse_barn', x: 4, y: 14, width: 12, height: 8, color: 0xa0522d, label: 'Horse Barn' },
  // Paddock (below barn)
  { name: 'paddock', x: 4, y: 22, width: 16, height: 10, color: 0x7ccd7c, label: 'Paddock' },
  // Goat Pen (center-left)
  { name: 'goat_pen', x: 22, y: 32, width: 12, height: 10, color: 0xdaa520, label: 'Goat Pen' },
  // Vegetable Garden (center-right)
  { name: 'veg_garden', x: 36, y: 32, width: 12, height: 10, color: 0x228b22, label: 'Vegetable Garden' },
  // Flower Garden (right, near farmhouse)
  { name: 'flower_garden', x: 48, y: 40, width: 10, height: 6, color: 0xff69b4, label: 'Flower Garden' },
  // Grape Orchard (upper-center)
  { name: 'grape_orchard', x: 24, y: 4, width: 14, height: 8, color: 0x6b3fa0, label: 'Grape Orchard' },
  // Hay/Feed Storage (near horse barn)
  { name: 'hay_storage', x: 16, y: 14, width: 8, height: 8, color: 0xf0e68c, label: 'Hay Storage' },
  // Equipment Shed (center-right)
  { name: 'equip_shed', x: 48, y: 26, width: 8, height: 6, color: 0x808080, label: 'Equipment Shed' },
  // Pond (upper-right, decorative)
  { name: 'pond', x: 58, y: 4, width: 8, height: 6, color: 0x4169e1, label: 'Pond' },
  // Feed Store (near hay storage)
  { name: 'feed_store', x: 62, y: 14, width: 10, height: 8, color: 0xb8860b, label: 'Feed Store' },
  // Farmer's Market (bottom-center, near farmhouse path)
  { name: 'farmers_market', x: 34, y: 50, width: 12, height: 6, color: 0xff8c00, label: "Farmer's Market" },
];

export class ZoneManager {
  private zones: { def: ZoneDefinition; rect: Phaser.Geom.Rectangle }[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private lastZone = '';

  constructor(private scene: Phaser.Scene) {
    const tileSize = 32;
    for (const def of ZONE_DEFS) {
      const rect = new Phaser.Geom.Rectangle(
        def.x * tileSize,
        def.y * tileSize,
        def.width * tileSize,
        def.height * tileSize,
      );
      this.zones.push({ def, rect });

      // Zone label
      const label = scene.add.text(
        rect.centerX,
        rect.centerY,
        def.label,
        { fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' },
      );
      label.setOrigin(0.5);
      label.setAlpha(0.6);
      label.setDepth(10);
      this.labels.push(label);
    }
  }

  update(playerX: number, playerY: number): string {
    for (const { def, rect } of this.zones) {
      if (rect.contains(playerX, playerY)) {
        if (def.name !== this.lastZone) {
          this.lastZone = def.name;
          currentZone.set(def.label);
        }
        return def.name;
      }
    }
    if (this.lastZone !== '') {
      this.lastZone = '';
      currentZone.set('Outdoors');
    }
    return '';
  }

  getZoneDefs(): ZoneDefinition[] {
    return ZONE_DEFS;
  }
}

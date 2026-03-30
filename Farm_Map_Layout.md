# Currano Farms — Map Layout Reference

**Grid:** 80 tiles wide × 60 tiles tall @ 32px per tile (2560×1920 pixels)
**Orientation:** North is up. Farmhouse faces south (toward the player's default approach).

---

## ASCII Zone Map

Each character = roughly 2×2 tiles (so this 40×30 grid represents the 80×60 tile map).

```
╔════════════════════════════════════════╗
║ TTT                              TTT  ║
║ TTTT    ┌─────────┐              TTTT ║
║ TTT     │  GRAPE  │   ~~~~~~~~   TTT  ║
║  TT     │ ORCHARD │   ~ Pond ~    TT  ║
║  T      └─────────┘   ~~~~~~~~     T  ║
║                                       ║
║   ┌──────────┐     ┌──────────┐       ║
║   │  HORSE   │     │   HAY /  │       ║
║   │  BARN    │     │  FEED    │       ║
║   │  [R] [C] │     │  STORAGE │       ║
║   └──────────┘     └──────────┘       ║
║   ┌──────────────┐                    ║
║   │   PADDOCK    │    ┌─────────┐     ║
║   │  (fenced)    │    │ EQUIP   │     ║
║   │              │    │  SHED   │     ║
║   └──────────────┘    └─────────┘     ║
║                                       ║
║        ┌─────────┐  ┌──────────┐      ║
║        │  GOAT   │  │ VEG      │      ║
║        │  PEN    │  │ GARDEN   │      ║
║        │ (fenced)│  │ (fenced) │      ║
║        └─────────┘  └──────────┘      ║
║                      ┌────────┐       ║
║  ┌──────────┐        │ FLOWER │       ║
║  │ CHICKEN  │  ===   │ GARDEN │       ║
║  │ COOP &   │ =path= └────────┘      ║
║  │ YARD     │  ===  ┌──────────────┐  ║
║  │ (fenced) │ =path=│  FARMHOUSE   │  ║
║  └──────────┘  ===  │   [porch]    │  ║
║                ===  └──────────────┘  ║
╚════════════════════════════════════════╝

T = Trees / Woods (predator spawn zone)
~ = Decorative water feature
= = Main dirt path
[R] = Romeo's stall
[C] = Champagne's stall
```

---

## Zone Details

### Farmhouse (Bottom-right)
- **Size:** ~12×8 tiles
- **Contains:** Front porch (cat waiting spot), kitchen door, phone, calendar, save point
- **Interactions:** Cook meals (stamina), check calendar, make phone calls (schedule vet/farrier), sleep
- **Path connection:** Main path runs north from porch to all other zones

### Chicken Coop & Yard (Bottom-left)
- **Size:** Coop ~8×6 tiles, Yard ~12×10 tiles (fenced)
- **Contains:** Coop building (nesting boxes, feeder, waterer, roost), fenced outdoor yard
- **Interactions:** Open/close coop door, fill feeder, fill waterer, gather eggs, clean coop, give treats
- **Notes:** Door faces east toward main path. Yard extends south and west. Fence needs periodic repair.

### Horse Barn & Paddock (Upper-left)
- **Size:** Barn ~10×6 tiles, Paddock ~14×8 tiles (fenced)
- **Contains:** 2 stalls (Romeo left, Champagne right), feed room (oats/hay), tack room, water trough in paddock
- **Interactions:** Feed oats, feed hay, fill trough, brush, muck stalls, lead to/from paddock, ride/train
- **Grass Turnout:** Adjacent open area north of paddock for grazing (grass health tracked)

### Goat Pen (Center-left)
- **Size:** ~10×8 tiles (fenced)
- **Contains:** Three-sided shelter, feed station, water trough
- **Interactions:** Feed, water, give treats, give beer, give random items, trim hooves
- **Notes:** Strategically placed NEXT to the vegetable garden (temptation for escapes). Fence sections are individually tracked.

### Vegetable Garden (Center-right)
- **Size:** ~10×8 tiles (fenced — theoretically)
- **Contains:** 24 planting plots (6×4 grid), watering station, compost bin
- **Interactions:** Plant, water, weed, harvest, apply pest control
- **Notes:** Fence gate should be closeable. If left open + goat escapes = disaster.

### Flower Garden (Right, near farmhouse)
- **Size:** ~8×4 tiles
- **Contains:** Decorative planting beds
- **Interactions:** Plant, water, harvest
- **Notes:** Near farmhouse for visual appeal. Pollinators from flowers boost veggie garden.

### Grape Orchard (Upper-center)
- **Size:** ~10×6 tiles
- **Contains:** 10 grape vines in rows, netting rack
- **Interactions:** Prune, train vines, water, harvest, apply netting
- **Notes:** Far from farmhouse — requires a walk. Adds strategic time pressure.

### Hay / Feed Storage Barn (Upper-right area)
- **Size:** ~10×6 tiles
- **Contains:** Hay bale storage area, feed bag shelf, delivery zone
- **Interactions:** Stack hay (mini-game), carry feed bags to other zones
- **Notes:** Deliveries arrive here. Player must carry supplies to the animal areas.

### Equipment Shed (Center-right)
- **Size:** ~6×4 tiles
- **Contains:** Tractor, snow blower, tools
- **Interactions:** Use equipment, repair equipment
- **Notes:** Equipment condition visible. Broken equipment shows visual damage.

### Woods / Tree Line (Perimeter)
- **Size:** Irregular border, 3–6 tiles deep
- **Contains:** Dense trees, underbrush
- **Interactions:** None (player can't enter)
- **Purpose:** Predator spawn zone. Visual rustling effects when predators are near. Creates atmosphere and boundary.

### Pond (Upper-right, decorative)
- **Size:** ~6×4 tiles
- **Purpose:** Decorative. Future: duck pond for premium tier.

---

## Path Network

The main dirt path connects all zones in roughly this order:

```
Farmhouse Porch
    │
    ├── Flower Garden (right)
    │
    ├── Chicken Coop (left)
    │
    ├── Goat Pen (left) ←→ Vegetable Garden (right)
    │
    ├── Equipment Shed (right)
    │
    ├── Horse Barn (left) ←→ Hay Storage (right)
    │
    └── Grape Orchard (center-top)
```

**Walking times** (at normal speed, approximate):
- Farmhouse → Chicken Coop: ~8 seconds
- Farmhouse → Horse Barn: ~18 seconds
- Farmhouse → Goat Pen: ~14 seconds
- Farmhouse → Garden: ~12 seconds
- Farmhouse → Grape Orchard: ~25 seconds
- Horse Barn → Hay Storage: ~6 seconds
- Goat Pen → Vegetable Garden: ~4 seconds (that's the problem)

---

## Fence Sections

The property has 20 tracked fence sections (each can degrade independently):

| # | Location | Risk |
|---|---|---|
| 1–4 | Chicken yard (N, S, E, W) | Predator entry |
| 5–6 | Coop walls (E, W) | Weasel entry |
| 7–10 | Goat pen (N, S, E, W) | Goat escape |
| 11–14 | Paddock (N, S, E, W) | Horse escape (rare) |
| 15–16 | Vegetable garden (N, S) | Goat raid defense |
| 17–20 | Perimeter (NW, NE, SW, SE) | Predator access |

---

## Collision Zones

- **Solid:** All buildings, fence posts, stone walls, water troughs, equipment, trees
- **Passable:** Open gates, paths, grass, garden plots
- **Conditional:** Fence gates (passable when open, solid when closed), coop door

---

## Seasonal Visual Changes

| Element | Spring | Summer | Fall | Winter |
|---|---|---|---|---|
| Grass | Bright green, some mud | Deep green | Golden/brown | White (snow) |
| Trees | Light green, budding | Full canopy | Orange/red | Bare branches |
| Paths | Muddy (darker brown) | Dry (light brown) | Leaf-covered | Snow-covered |
| Gardens | Sprouting | Full growth | Harvest colors | Empty, snow |
| Pond | Normal | Normal | Normal | Frozen (gray) |
| Sky tint | Soft blue | Bright blue | Warm amber | Cold gray-blue |

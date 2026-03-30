# Currano Farms — Phase 1 MVP Sprint Plan

**Goal:** A playable core loop where the player wakes up, walks around the farm, feeds and waters chickens, gathers eggs, locks/unlocks the coop, and experiences a day/night cycle with seasons. By the end of Phase 1, one animal type (chickens) is fully working, and the foundation supports adding more.

**Duration:** 12 weeks (3 months)
**Milestone:** Internal playtest — can you play through a full in-game week with chickens and feel the rhythm of farm life?

---

## Sprint 1 (Weeks 1–2): Project Scaffold & Walking on a Map

**Goal:** Player character walks around a placeholder farm map in the browser.

### Tasks

- [ ] **Initialize project structure** per App Guidelines
  - SvelteKit app with static adapter
  - Express backend with basic health endpoint
  - Shared directory
  - `.env.example`, `render.yaml`, CI workflow stub
- [ ] **Install and configure Phaser 3** within SvelteKit
  - Mount Phaser canvas in `/play` route
  - Verify Phaser + Svelte communication (event bus or stores)
  - Handle canvas resize on window resize
- [ ] **Create placeholder tilemap** in Tiled
  - 80x60 tile grid at 32px
  - Simple colored tiles: green (grass), brown (dirt paths), gray (buildings), blue (water troughs)
  - Export as JSON, load in Phaser
- [ ] **Player character**
  - Placeholder sprite (colored rectangle or simple 4-frame walk cycle)
  - WASD/arrow key movement with collision against buildings and fences
  - Camera follows player, scrolling across the map
- [ ] **Basic zone markers**
  - Visual indicators for each farm zone (farmhouse, coop, barn, goat pen, garden)
  - No interactivity yet — just labeled areas on the map
- [ ] **Dev mode HUD**
  - Display current FPS, player coordinates, active zone
  - Toggle with backtick key

### Deliverable
Player walks around a colored-rectangle farm. Camera scrolls. Collision works. Runs in browser at 60 FPS.

---

## Sprint 2 (Weeks 3–4): Time, Weather & Day/Night Cycle

**Goal:** Time passes, the sky changes, and seasons cycle.

### Tasks

- [ ] **Time system**
  - Game clock ticking at 1 real second = 1 game minute
  - HUD display: current time, day number, season
  - Day phase detection (dawn, morning, afternoon, evening, night)
  - Pause and 2x speed controls
- [ ] **Day/night visual cycle**
  - Tint overlay that darkens during evening/night, warms at dawn
  - Smooth transitions between phases
  - Sunrise/sunset color ramps
- [ ] **Season system**
  - 28-day season counter
  - Season label in HUD
  - Placeholder palette swap (just tint changes for now: green→golden→orange→white)
- [ ] **Weather generation**
  - Daily weather roll using probability tables from `game-config.js`
  - Weather icon in HUD
  - Rain particle effect (simple falling dots)
  - Snow particle effect (slower, larger dots)
  - No gameplay effects yet — visuals only this sprint
- [ ] **Sleep transition**
  - At 9 PM, prompt to sleep
  - Fade to black, advance to 5 AM next day
  - Morning summary placeholder (just "Day X — [Weather]")

### Deliverable
Time passes visually. Day turns to night. Seasons change every 28 days. Rain and snow fall. Player can sleep through the night.

---

## Sprint 3 (Weeks 5–6): Chicken Coop & Basic Interactions

**Goal:** Chickens exist, need food and water, and the player can interact with them.

### Tasks

- [ ] **Chicken entities**
  - Spawn 7 hens + 1 rooster from config defaults
  - Placeholder sprites (small colored rectangles per breed color)
  - Idle behavior: random wandering within coop bounds, pecking animation
  - Each chicken tracks: hunger, thirst, happiness, health (from config)
- [ ] **Stat decay system**
  - Stats tick down per game hour at rates from `game-config.js`
  - Visual indicators: small colored dots above each chicken (green = ok, yellow = warning, red = critical)
  - Health declines when hunger or thirst hit critical threshold
- [ ] **Interaction system (foundation)**
  - Player approaches object/animal → interaction prompt appears
  - Spacebar/click to perform context-sensitive action
  - Action costs stamina (from config)
  - Animated feedback (small particle burst or icon)
- [ ] **Chicken feeding**
  - Feeder object in coop — player interacts to fill it
  - All chickens in range get hunger restored
  - Feed consumed from inventory (infinite supply for now — economy comes later)
- [ ] **Chicken watering**
  - Waterer object — same mechanic as feeding but for thirst
  - Summer multiplier applied (2x thirst decay in summer)
  - Winter: frozen waterer interaction (takes extra time)
- [ ] **Player stamina system**
  - Stamina bar in HUD
  - Actions cost stamina per config values
  - Meals restore stamina (placeholder: interact with farmhouse kitchen)
  - Zero stamina = slow walk, can't do heavy tasks

### Deliverable
Chickens walk around the coop, get hungry and thirsty over time, and the player feeds and waters them. Stamina limits how much the player can do per day.

---

## Sprint 4 (Weeks 7–8): Eggs, Coop Door & Predators

**Goal:** The chicken gameplay loop is complete — eggs, free-ranging, and predator risk.

### Tasks

- [ ] **Egg-laying system**
  - Each hen lays eggs on a timer (1–2 day interval from config)
  - Eggs appear in nesting boxes as small sprites
  - Happiness affects lay speed (multiplier from config)
  - Araucana (Pebbles) lays blue eggs
- [ ] **Egg gathering**
  - Player interacts with nesting box → collects egg to inventory
  - Uncollected eggs darken after spoil timer (2 days)
  - Collecting spoiled egg → small penalty feedback
  - Egg count tracked in inventory
- [ ] **Coop door mechanic**
  - Interactive door object: open/close states
  - Open = chickens can wander into the yard (free range zone)
  - Chickens gradually move outside when door is open
  - Free-range happiness boost applied per config
  - **CRITICAL:** Door state persists through day/night transition
- [ ] **Predator system (basic)**
  - Fox entity: spawns from woods edge at dusk/night
  - Hawk entity: shadow sprite during daytime when chickens are free-ranging
  - Attack roll using base chances from config
  - If coop unlocked at night → massive predator multiplier
  - Attack result: chicken loses health (or dies if already low)
  - Player intervention: run toward predator to scare off (proximity check)
- [ ] **Predator warnings**
  - Toast notification: "Something is rustling at the fence line..."
  - Hawk: shadow on ground moving toward chickens
  - Alert marker on mini-map (placeholder mini-map — just dots)
- [ ] **Rooster crowing**
  - Goldie crows at dawn + random intervals
  - Crow counter per day
  - Exceed threshold → neighbor complaint notification + fine

### Deliverable
Full chicken gameplay loop: feed, water, gather eggs, let them out, lock them up at night. Forget to lock the coop and a fox might get in. Rooster crows and neighbors complain.

---

## Sprint 5 (Weeks 9–10): Coop Cleaning, Treats & Polish

**Goal:** Remaining chicken mechanics, plus the UX polish that makes it feel like a game.

### Tasks

- [ ] **Coop cleaning**
  - Cleanliness stat for coop (decays over time)
  - Dirty coop: visual change (darker floor tiles), health penalty for chickens
  - Player cleans with pitchfork interaction — takes stamina, costs more in muddy spring
- [ ] **Treats & food scraps**
  - Player can give treats (from inventory) — happiness boost, feeding frenzy animation
  - Food scraps from kitchen — same mechanic, different item
- [ ] **Hatching system (basic)**
  - If a hen goes broody (random chance per config), she sits on uncollected eggs
  - Hatch timer (7 days) with visual progress
  - Chick entity: small sprite, requires heat lamp proximity
  - Chick grows to adult after 14 days
- [ ] **Notification system**
  - Toast notifications slide in from top-right
  - Queue system (don't stack more than 3)
  - Categories: warning (orange), info (blue), danger (red), positive (green)
  - Notifications from config-driven triggers
- [ ] **Morning summary screen**
  - Overlay after waking: overnight events, weather forecast, egg count, animal status summary
  - Click to dismiss
- [ ] **Sound effects (first pass)**
  - Chicken clucking (idle, random)
  - Rooster crow
  - Egg collection "pop"
  - Feeding swoosh
  - Water splash
  - Footstep sounds (dirt)
  - Door latch click (coop open/close)
- [ ] **Basic background music**
  - One ambient track for daytime
  - One for evening
  - Fade transitions between them

### Deliverable
Chicken gameplay is complete with cleaning, treats, hatching, and basic audio. Notifications communicate what's happening. Morning summary gives the player a daily briefing.

---

## Sprint 6 (Weeks 11–12): Save System, UI Shell & Playtest

**Goal:** You can save your game, there's a real menu, and the whole thing is playable end-to-end.

### Tasks

- [ ] **Save/load system**
  - Serialize full game state to JSON (time, season, weather, animal stats, inventory, coop door state, egg timers, etc.)
  - Save to IndexedDB (local / offline)
  - Autosave every in-game evening
  - Manual save from pause menu
  - Load game from title screen
  - 3 save slots with metadata (day, season, farm summary)
- [ ] **Title screen**
  - Game logo / title art (placeholder)
  - New Game / Continue / Load Game / Settings
  - Simple parallax background (farm scene)
- [ ] **Pause menu**
  - Resume, Save, Settings (volume, speed), Quit to Title
  - ESC key toggle
- [ ] **Settings**
  - Music volume, SFX volume
  - Game speed (1x / 2x)
  - Control display (keyboard shortcuts reference)
- [ ] **Backend integration (basic)**
  - Auth system from App Guidelines (login, register, JWT)
  - `/api/game/save` and `/api/game/load/:slot` endpoints
  - Cloud save for logged-in users
  - Guest mode: local saves only
- [ ] **Mobile touch controls (basic)**
  - Virtual joystick for movement
  - Tap to interact
  - Test on mobile browsers, fix layout issues
- [ ] **Playtest & balance pass**
  - Play through 7 full in-game days
  - Tune stat decay rates — does it feel right?
  - Tune predator frequency — too stressful? Not enough?
  - Tune stamina costs — can you get through a full day?
  - Fix any bugs found during play
  - Document balance changes back into `game-config.js`

### Deliverable
**Phase 1 MVP complete.** A playable farm sim with chickens, day/night cycle, seasons, weather, predators, egg economy, save/load, and basic UI. Ready for friends-and-family testing before adding horses, cats, and goats in Phase 2.

---

## Phase 1 Summary

| Sprint | Weeks | Focus | Key Deliverable |
|---|---|---|---|
| 1 | 1–2 | Scaffold & Map | Player walks around farm |
| 2 | 3–4 | Time & Weather | Day/night, seasons, rain/snow |
| 3 | 5–6 | Chickens & Interactions | Feed, water, stamina system |
| 4 | 7–8 | Eggs & Predators | Full chicken loop with danger |
| 5 | 9–10 | Polish & Audio | Cleaning, treats, hatching, sound |
| 6 | 11–12 | Save/UI/Playtest | Complete MVP, balance tuning |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Art assets not ready | Blocks visual polish | Use colored rectangles for Phase 1. Art can be dropped in later without code changes. |
| Phaser + SvelteKit integration issues | Blocks all game work | Spike this in Sprint 1 first. If problems arise, fall back to standalone Phaser with Svelte overlay via iframes. |
| Balance feels wrong | Game isn't fun | Playtest early (Sprint 4+), tweak `game-config.js`. All values are centralized for easy tuning. |
| Mobile performance | Can't hit 30 FPS | Reduce particle counts, simplify weather effects, test on low-end device early. |
| Scope creep | Phase 1 takes 5 months instead of 3 | Strict rule: no horses, cats, goats, or garden in Phase 1. Chickens only. |

---

## Definition of Done (Phase 1)

- [ ] Player can start a new game, play through 7+ in-game days, and save/load
- [ ] All 8 chickens behave independently with their own stats
- [ ] Feeding, watering, egg gathering, coop cleaning, and treats all work
- [ ] Coop door opens/closes, free-range affects happiness and predator risk
- [ ] At least 2 predator types (fox + hawk) function correctly
- [ ] Day/night cycle and season transitions are visually clear
- [ ] Weather generates daily and rain/snow are visible
- [ ] Rooster crows and neighbor complaints trigger at threshold
- [ ] Notifications communicate events to the player
- [ ] Morning summary shows overnight events
- [ ] Save/load works locally (IndexedDB) and via cloud (authenticated)
- [ ] Game runs at 60 FPS desktop, 30 FPS mobile
- [ ] Basic sound effects and music are in place
- [ ] Touch controls work on mobile

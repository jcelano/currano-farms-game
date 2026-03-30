# Currano Farms — Game Design Specification

## 1. Executive Summary

Currano Farms is a top-down 2D real-time farm simulation game that runs in the browser. The player manages a small New England-style farm with horses, goats, chickens, and barn cats through four seasons of weather, predators, and daily chores. The game emphasizes the charm and challenge of real farm life — every animal has a name, a personality, and needs that change with the seasons.

The game is built with Phaser.js and runs on any modern browser (desktop and mobile). A free tier includes the core four animal types; premium unlocks additional animals and expanded systems.

---

## 2. Technical Architecture

### 2.1 Tech Stack (Aligned with App Guidelines)

| Layer | Technology | Notes |
|---|---|---|
| **Game Engine** | Phaser 3 (HTML5/WebGL with Canvas fallback) | Embedded within SvelteKit app |
| **Frontend Shell** | SvelteKit 2 + Svelte 5 | Menus, HUD overlays, auth screens, admin panel, shop UI — all outside the Phaser canvas |
| **Backend** | Express.js (Node, ES Modules) | Game state persistence, API endpoints, serves static build in production |
| **Database** | PostgreSQL via Supabase (free 500MB) | Player accounts, save data, leaderboards, economy state |
| **Auth** | JWT + bcryptjs | Free/Pro tier gating, save-to-cloud |
| **Payments** | Stripe (subscriptions) | Premium tier unlock |
| **Email** | Resend (free: 100/day) | Account verification, password reset |
| **Bot Protection** | Cloudflare Turnstile | Registration and login forms |
| **Hosting** | Render.com or Vercel | Free tier to start, ~$7–15/mo at scale |
| **CI/CD** | GitHub Actions | Lint, build, test, deploy on push to main |
| **AI (future)** | Anthropic Claude SDK | Dynamic event narration, animal personality text, hint system |

**Architecture:** The Phaser game canvas is mounted inside a SvelteKit route (`/play`). Svelte components handle everything outside the game loop — login, registration, menus, settings, the shop/upgrade UI, admin dashboard, and the HUD overlay. The Phaser game communicates with Svelte via a shared event bus or Svelte stores.

**Build:** SvelteKit builds to static files (`dist-svelte/`), served by Express in production. Phaser is bundled as a dependency within the SvelteKit build via Vite.

### 2.2 Project Structure

```
currano-farms/
├── server/                      # Express backend
│   ├── index.js                 # Main server: routes, middleware, static serving
│   ├── auth.js                  # Auth logic: register, login, verify, reset
│   ├── db.js                    # Database pool, schema init, game-state queries
│   ├── game-api.js              # Save/load game state, leaderboard, economy endpoints
│   └── manage-users.js          # CLI tool for user management
├── svelte-app/                  # SvelteKit frontend (static adapter)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte   # Global layout (nav, auth state)
│   │   │   ├── +page.svelte     # Landing / marketing page
│   │   │   ├── play/
│   │   │   │   └── +page.svelte # Game page — mounts Phaser canvas here
│   │   │   ├── terms/
│   │   │   └── privacy/
│   │   ├── lib/
│   │   │   ├── api.js           # Frontend API client
│   │   │   ├── components/      # Svelte UI components (HUD, menus, modals)
│   │   │   └── game/            # Phaser game code
│   │   │       ├── main.ts      # Phaser config & bootstrap
│   │   │       ├── scenes/      # Phaser scenes (Farm, Riding, HayStacking, etc.)
│   │   │       ├── entities/    # Animal classes, player, predators
│   │   │       ├── systems/     # Time, weather, economy, predator AI
│   │   │       ├── ui/          # In-game Phaser UI (not Svelte)
│   │   │       └── assets/      # Sprite sheets, tilemaps, audio
│   │   └── app.css
│   └── svelte.config.js
├── shared/                      # Shared types, constants, game config
├── .github/workflows/ci.yml
├── .env.example
├── render.yaml
└── package.json
```

### 2.3 Rendering

- **View:** Top-down 2D with slight isometric tilt (similar to Stardew Valley or early Harvest Moon)
- **Art Style:** Pixel art, 16x16 or 32x32 tile base, with expressive animal sprites
- **Resolution:** 320x180 base, scaled up to fit viewport (pixel-perfect rendering)
- **Layers (back to front):** Ground/terrain → paths/fences → buildings (lower walls) → entities (player, animals, objects) → buildings (upper walls/roofs) → weather/particle effects → HUD
- **Tilemap editor:** Tiled (free) for map creation, exported as JSON for Phaser

### 2.4 Target Platforms

- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (responsive layout, touch controls)
- Future: PWA wrapper for app-like experience on mobile

### 2.5 Save System

- **Local (free tier):** IndexedDB via Phaser's built-in data manager for offline saves
- **Cloud (authenticated users):** Save state synced to PostgreSQL via `/api/game/save` and `/api/game/load` endpoints. Enables cross-device play.
- **Autosave:** Every in-game evening when chores are done, plus manual save from pause menu
- **Slots:** 3 save slots per player
- **Save data structure:** JSON blob containing full game state (animal stats, inventory, calendar, economy, farm upgrades, time/season)

### 2.6 Performance Targets

- 60 FPS on desktop, 30 FPS minimum on mid-range mobile
- Initial load under 5 seconds on broadband
- Total asset budget: under 20MB for free tier

### 2.7 Database Schema (Game-Specific Tables)

In addition to the standard user/auth/payment tables from the App Guidelines, the game adds:

```sql
-- Game save slots
CREATE TABLE IF NOT EXISTS game_saves (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
    save_name TEXT DEFAULT 'My Farm',
    game_state JSONB NOT NULL,           -- Full serialized game state
    play_time_seconds INTEGER DEFAULT 0,
    current_season TEXT,
    current_day INTEGER,
    current_year INTEGER,
    farm_value INTEGER DEFAULT 0,        -- For leaderboards
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, slot)
);

-- Leaderboards (updated on save)
CREATE TABLE IF NOT EXISTS leaderboards (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    farm_name TEXT,
    farm_value INTEGER DEFAULT 0,
    days_survived INTEGER DEFAULT 0,
    animals_healthy INTEGER DEFAULT 0,
    longest_no_loss_streak INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email)
);
```

### 2.8 API Routes (Game-Specific)

```
# Game state (protected)
POST   /api/game/save              # Save game state to slot
GET    /api/game/load/:slot        # Load game state from slot
GET    /api/game/slots             # List all save slots with metadata
DELETE /api/game/slots/:slot       # Delete a save slot

# Leaderboards (mixed)
GET    /api/leaderboards           # Public: top farms by value
POST   /api/leaderboards/update    # Protected: update player's leaderboard entry

# Shop / Economy (protected)
GET    /api/shop/catalog           # Available upgrades and items
POST   /api/shop/purchase          # Buy an upgrade (deducts from game currency)
```

---

## 3. Game World

### 3.1 Farm Map Layout

The farm is a single scrollable map divided into distinct zones connected by paths and dirt roads. The player character walks between them.

**Zones:**

- **Farmhouse & Porch:** Starting point each morning. Cats wait here. Access to the kitchen (food scraps for chickens), calendar, phone (schedule farrier/vet), and save point.
- **Horse Barn & Paddock:** Two stalls (Romeo and Champagne), feed room (oats/hay storage), tack room, and an adjacent fenced paddock with a water trough. A separate grass turnout area nearby.
- **Chicken Coop & Yard:** Enclosed coop with nesting boxes and roost bars. An attached fenced yard for free-ranging. Feed and water stations inside and outside.
- **Goat Pen & Shelter:** Fenced area with a three-sided shelter. Water trough and feed station. Adjacent to the garden (dangerously close).
- **Cat Area:** Distributed — cats roam the whole farm. Feeding station near the barn. Heated bed area inside the barn for winter.
- **Vegetable Garden:** Planting beds, watering system, compost area. Fenced (theoretically) to keep goats out.
- **Flower Garden:** Decorative beds near the farmhouse.
- **Grape Orchard:** Small vineyard area at the edge of the property. Seasonal growth cycle leading to wine production.
- **Hay Storage / Feed Barn:** Where deliveries arrive. Hay bales stacked here. Feed bags stored here.
- **Equipment Shed:** Tractor, snow blower, tools. Equipment condition visible here.
- **Perimeter:** Fences and stone walls around the property. Multiple sections that can degrade independently.
- **Wooded Edge:** Where predators emerge from. Visual cues (rustling bushes, shadows) warn the player.

### 3.2 Map Scale

Approximately 80x60 tiles at 32px each. The player can traverse the full map in about 60–90 seconds of real time at walking speed. Running is available but spooks nearby animals.

---

## 4. Core Systems

### 4.1 Time System

- **Game clock:** 1 real second = 1 game minute (a full day is ~24 real minutes)
- **Day phases:** Dawn (5–7 AM), Morning (7 AM–12 PM), Afternoon (12–5 PM), Evening (5–8 PM), Night (8 PM–5 AM)
- **Player sleeps** from ~9 PM to 5 AM (skipped with a fade-to-black transition)
- **Time can be paused** via the menu
- **Speed control:** 1x (default), 2x (for waiting on tasks), pause

### 4.2 Season System

- **4 seasons:** Spring, Summer, Fall, Winter
- **Season length:** 28 game days each (112 days per year)
- **Visual changes:** Palette swaps for terrain, trees, and sky. Snow accumulates gradually in winter. Mud appears in spring. Lush green in summer. Warm tones in fall.
- **Gameplay changes per season detailed in Section 8**

### 4.3 Weather System

Weather is generated daily with seasonal probability weights.

| Weather | Spring | Summer | Fall | Winter |
|---|---|---|---|---|
| Clear/Sunny | 30% | 50% | 40% | 25% |
| Cloudy | 20% | 15% | 20% | 20% |
| Rain | 30% | 20% | 20% | 5% |
| Thunderstorm | 10% | 10% | 5% | 0% |
| Snow | 0% | 0% | 5% | 35% |
| Ice Storm | 0% | 0% | 0% | 10% |
| Heat Wave | 0% | 5% | 0% | 0% |
| Fog | 10% | 0% | 10% | 5% |

**Weather effects:**

- **Rain:** Puddles form, paddock gets muddy (cleaning takes longer next day). Garden is watered automatically. Player moves slightly slower outdoors.
- **Thunderstorm:** Animals get stressed. Small chance of fence/coop damage. Hawks won't attack (silver lining).
- **Snow:** Accumulates in inches. Over 4 inches requires shoveling/snow-blowing paths. Water troughs freeze and must be broken/thawed.
- **Ice Storm:** Power outage risk. Paths are slippery (player moves slower). Cat heated beds may stop working.
- **Heat Wave:** Animals drink 2x water. Garden needs 2x watering. Risk of dehydration if player falls behind. Fly problems increase.
- **Fog:** Reduced visibility. Predators are harder to spot. Atmospheric and tense.

### 4.4 Calendar & Scheduling System

- In-game calendar on the farmhouse wall (also accessible via HUD)
- Tracks upcoming events: farrier visits, vet appointments, hay deliveries, seasonal milestones
- Player can schedule appointments by interacting with the phone in the farmhouse
- Missed appointments have consequences (farrier won't come for another 2 weeks, vet charges a missed visit fee)

---

## 5. Player Character

### 5.1 Movement & Controls

**Desktop:**
- WASD or arrow keys to move
- Mouse to interact (click on animals, objects, tools)
- Scroll wheel or Q/E to cycle through held items
- Spacebar for primary action (context-sensitive: feed, brush, pick up, etc.)
- I for inventory, M for map, C for calendar, ESC for pause

**Mobile:**
- Virtual joystick (left side) for movement
- Tap to interact with objects/animals
- Toolbar along the bottom for tool/item selection
- Swipe gestures for inventory and menus

### 5.2 Inventory

- Toolbar holds 8 active items (switchable)
- Full inventory screen holds up to 30 item slots
- Items include: feed bucket, water pail, brush, pitchfork, egg basket, shovel, fence repair kit, treats, flea collar, etc.
- Items don't degrade (tools are permanent), but consumables (feed, hay, treats) deplete

### 5.3 Energy System

- Player has a stamina bar (100 points)
- Most actions cost stamina (feeding: 2, mucking stalls: 8, shoveling snow: 10, riding a horse: 5, etc.)
- Stamina regenerates by eating meals (breakfast, lunch, dinner — prepared in the farmhouse kitchen)
- If stamina hits 0, player moves at half speed and can't perform heavy tasks
- Sleeping fully restores stamina

---

## 6. Animal Systems

Each animal is an independent entity with its own AI, stats, and behavior patterns.

### 6.1 Universal Animal Stats

Every animal tracks the following:

| Stat | Range | Effect |
|---|---|---|
| Hunger | 0–100 | Drops over time. Below 20 = unhappy, below 5 = health decline |
| Thirst | 0–100 | Drops faster in summer. Below 20 = unhappy, below 5 = health decline |
| Happiness | 0–100 | Affected by care, attention, enrichment, weather. Affects productivity |
| Health | 0–100 | Affected by hunger, thirst, illness, neglect. Below 30 = needs vet |
| Cleanliness | 0–100 | Drops as stalls/coops get dirty. Affects health over time |

Stats tick down at rates that vary by animal type, season, and weather.

### 6.2 Horses — Romeo & Champagne

**Sprites:** Romeo is a darker bay with Arabian/Morgan build (refined, athletic). Champagne is a chestnut with distinctive white blaze, taller Tennessee Walker frame with flowing mane.

**Unique Stats:**
- Hoof Condition (0–100): Declines over time. Farrier visit resets to 100. Below 30 = limping animation, speed penalty, health decline.
- Coat Condition (0–100): Improved by brushing. Drops faster in spring (shedding). Affects happiness.
- Training Level (0–100): Increased by riding/training. Declines slowly if neglected. Higher training = smoother riding mini-game.

**Behaviors:**
- Idle: Grazing, swishing tail, looking around. Occasional whinny sound.
- Happy: Prancing, nuzzling the player when approached.
- Unhappy: Ears back, pawing the ground, won't cooperate easily with tasks.
- Spring shedding: Visual tufts of hair on the sprite. Brushing produces a satisfying particle effect.

**Interactions:**
- Feed oats (from feed bucket) — fills hunger partially
- Feed hay (from hay rack in stall) — fills hunger fully
- Fill water trough — fills thirst
- Brush — increases coat condition and happiness
- Muck stall (pitchfork) — increases cleanliness
- Lead to paddock / bring to stall — transition between zones
- Turn out on grass — happiness boost but grass health declines over time
- Ride/Train — mini-game (see Section 10). Increases training level and happiness.
- Shoe (farrier only) — resets hoof condition

**Breeding:**
- If both horses are healthy and happy (stats above 80), player can initiate breeding
- Gestation: 14 game days
- Foal requires extra care: more frequent feeding, can't be ridden, gradually grows over 28 game days
- Foal can be kept (expands herd) or sold (significant income)

### 6.3 Cats — Maria & Lelo

**Sprites:** Distinct cat designs (Maria could be a calico, Lelo a gray tabby — customizable in settings).

**Unique Stats:**
- Attention (0–100): Declines over time. Below 30 = loud meowing, below 10 = they scratch furniture in the farmhouse.
- Flea/Tick Protection (0–100): Starts at 100 when collar applied. Declines at ~0.37/day (hits 0 at ~9 months). Below 20 = itching animation, health risk.

**Behaviors:**
- Morning: Wait by porch door. Sprite visible through window making faces. Walk in circles impatiently.
- Fed: Purring animation, rub against player's legs.
- Neglected: Loud meow sound effects (escalating frequency). Follow player around the farm demanding attention.
- Winter: Curl up in heated beds inside the barn. If power is out, they huddle together and happiness drops fast.
- Roaming: Wander the farm chasing mice (occasional catch animation — slight pest reduction for the garden).

**Interactions:**
- Feed (cat food at feeding station) — fills hunger
- Fill water bowl — fills thirst
- Pet/give attention — increases attention and happiness
- Apply flea/tick collar — resets protection to 100
- Check heated bed status (winter) — visual indicator

**Predator vulnerability:** Fisher cats and foxes can threaten cats. Cats have a small evasion chance (they're quick) but can be injured or killed if unprotected at night.

### 6.4 Chickens — Goldie, Ruby, Sandy, Angelina, Tangerine, Pebbles, Midnight

**Sprites:** Each hen has a color variant matching her breed. Goldie (rooster) has a larger, more colorful sprite. Sandy is noticeably smaller than the rest.

**Breed Visual Differences:**
- Buff Orpingtons: Golden/buff colored, fluffy
- Araucanas: Gray-blue/reddish, tuft-eared (lay blue/green eggs)
- Black Australorps: Glossy black with green sheen
- Rhode Island Reds: Deep reddish-brown

**Unique Stats:**
- Egg Timer: Each hen produces an egg every 1–2 game days (affected by happiness and health). Araucanas produce blue eggs.
- Free Range Happiness Bonus: +10 happiness per day spent outside, but vulnerability flag is set.

**Behaviors:**
- Coop (locked): Milling around inside, pecking at ground, sitting on nests.
- Free range: Spread across the yard, pecking at bugs, dust-bathing. Occasionally wander toward the edge of the safe zone.
- Rooster: Crows at dawn (sound effect). Frequency increases if happiness is high. If frequency exceeds threshold → neighbor complaint event.
- Sandy: Slightly faster movement speed, tends to stick close to the larger hens.
- Egg-laying: Hen sits in nesting box, small sparkle effect when egg appears.

**Interactions:**
- Fill feeder — fills hunger for all chickens in range
- Fill waterer — fills thirst for all chickens in range
- Give treats/scraps — happiness boost, small feeding animation frenzy
- Gather eggs (egg basket) — collect from nesting boxes. Uncollected eggs spoil after 2 game days (visual change: darkened egg sprite).
- Open/close coop door — toggles free range. CRITICAL: must close before nightfall or predators can enter.
- Clean coop (pitchfork/shovel) — increases cleanliness

**Hatching:**
- If eggs are left uncollected and a hen is broody (random chance), she'll sit on them
- Hatch after 7 game days
- Chicks require heat lamp and special feed for 14 game days before joining the flock

**Predator interactions:** Fox, hawks, raccoons, weasels, fisher cats all threaten chickens. Hawks attack during daytime free range (shadow warning on ground). Others attack at night if coop is unlocked.

### 6.5 Goats — Lela, Tiki, Spike

**Sprites:** Small, stocky Nigerian Dwarf builds. Each has distinct coloring (Lela: brown/white, Tiki: black/tan, Spike: all gray with small horns).

**Unique Stats:**
- Mischief Level (0–100): Always slowly increasing. Higher mischief = more escape attempts and destructive behavior. Reduced by treats, attention, and giving them things to climb on.
- Hoof Condition (0–100): Like horses, needs periodic trimming. Declines slower than horses.

**Behaviors:**
- Idle: Climbing on things, head-butting each other playfully, staring at fences.
- Scheming: When mischief is high, they visually inspect fence sections. A thought-bubble icon with a hole or a garden appears above their heads.
- Escape attempt: Goat runs at a weak fence section and either jumps it or wiggles through a hole. If successful, heads straight for the garden or chicken coop.
- In the garden: Eating vegetables. Each second in the garden destroys crop progress.
- At the coop: Eating from the chicken feeder, pushing chickens aside.
- Beer reaction: Give a goat beer → exaggerated happy animation, brief happiness spike, slightly increases mischief.
- Tin can test: Give random items → funny reaction animation (love it, hate it, confused).

**Interactions:**
- Feed (goat feed at station) — fills hunger
- Fill water trough — fills thirst
- Give treat — reduces mischief, increases happiness
- Give beer — big happiness spike, mischief +5
- Give random items (tin cans, cardboard, etc.) — unique reaction per item, discovery log
- Trim hooves (player or vet) — resets hoof condition
- Repair fence (fence repair kit) — fixes weak sections goats have been testing
- Direct goats to brush area — they clear overgrowth (useful, but need secure fencing)

**Predator interactions:** Bears and possums. Bears are rare but dangerous — a bear event is a major crisis. Possums steal goat feed.

---

## 7. Garden System

### 7.1 Vegetable Garden

- Grid of 6x4 planting plots (24 total)
- Each plot can hold one crop type
- **Growth cycle:** Plant → Sprout (2 days) → Growing (3–5 days) → Harvestable (stays for 3 days before withering)
- **Crop types (by season):**
  - Spring: Lettuce, peas, radishes, carrots
  - Summer: Tomatoes, corn, peppers, squash
  - Fall: Pumpkins, potatoes, beets, kale
  - Winter: Nothing grows (prep and planning season)
- **Maintenance:** Water daily (rain counts), weed every 2–3 days, apply pest control as needed
- **Pest system:** Japanese beetles appear in summer. Visual: small beetle sprites on plants. If untreated for 3 days, crop health drops significantly. Treatment: pick by hand (slow) or apply pest control (costs money, instant).

### 7.2 Flower Garden

- Decorative plots near the farmhouse
- Similar mechanics to vegetables but flowers sell for different prices and attract pollinators that boost vegetable garden yields
- Purely optional but profitable

### 7.3 Grape Orchard

- 8–12 grape vines in a dedicated area
- **Long growth cycle:** Vines take a full game year to mature from planting
- **Seasonal tasks:** Prune in spring, train vines in summer, harvest in fall, protect in winter
- **Wine production:** After harvest, grapes go into a fermenting process (14 game days). Wine sells for high value — the game's premium income source.
- **Risk:** Frost in late spring or early fall can damage the crop. Birds eat grapes if not netted.

---

## 8. Seasonal Detail

### 8.1 Spring
- Mud everywhere — all outdoor tasks take 25% longer
- Horses shed heavily — coat condition drops 2x faster, brushing is more important
- Planting season for the garden
- Fence damage from winter needs repair
- Baby animal events possible (foal, chicks)
- Predators are hungrier coming out of winter — higher attack frequency

### 8.2 Summer
- Animals drink 2x water — troughs empty faster
- Garden pests peak (Japanese beetles)
- Fly season in the barn — need fly management (traps, masks for horses)
- Longest days — more daytime action points
- Heat wave risk: extreme water needs, possible animal stress
- Grape vines need daily attention

### 8.3 Fall
- Harvest time — garden and grapes ready
- Shorter days — less time before evening chores
- Predators stocking up before winter — moderate attack frequency
- Falling leaves visual effect. Less mowing/brush work.
- Prep for winter: stock up on hay, check equipment, ensure heated beds work

### 8.4 Winter
- Snow accumulation system: 0–12+ inches tracked per storm
- Over 4 inches: must shovel or snow-blow paths before animals can access food/water
- Water freezes: troughs need manual thawing (takes time/stamina)
- Shorter days: very limited daytime window
- Ice storm risk: power outage → heated cat beds fail, frozen pipes
- No garden work (planning/ordering seeds for spring)
- Hay consumption increases (no grazing possible)
- Cozy moments: cats on heated beds, horses snug in stalls, the farmhouse fire

---

## 9. Predator & Threat System

### 9.1 Predator AI

Predators spawn from the wooded edges of the map during specific conditions.

| Predator | Active Time | Target | Warning Sign | Prevention |
|---|---|---|---|---|
| Fox | Dusk/Night | Chickens, Cats | Rustling at fence line | Lock coop, keep cats inside |
| Hawk | Daytime | Free-range chickens | Shadow on ground | Keep chickens in coop |
| Raccoon | Night | Chickens, cat food | Knocked-over trash can | Lock coop, secure cat food |
| Weasel | Night | Chickens | Scratch marks on coop | Lock coop, repair holes |
| Fisher Cat | Night | Chickens, Cats | Screeching sound | Lock coop, bring cats in |
| Possum | Night | Chicken feed, goat feed | Feed levels drop unexpectedly | Secure feed storage |
| Bear | Any (rare) | Goats, feed storage | Loud crashing, broken fence | Chase off with tractor horn, call animal control |

### 9.2 Attack Resolution

- If prevention measures are in place → predator is repelled (player may not even notice until morning log: "A fox tried the coop last night but it was locked.")
- If vulnerable → attack succeeds. Consequences range from stolen feed (possum) to injured animal (fox, weasel) to killed animal (rare, only if health was already low and multiple failed protections).
- Player can intervene if they're awake and nearby — run toward the predator to scare it off. Some predators (bears) require equipment.

### 9.3 Animal Loss

Animal death is possible but rare and always the result of sustained neglect, not a single mistake. If an animal is lost, the game treats it with weight — a memorial marker appears on the farm, and the remaining animals show sadness animations for several days.

---

## 10. Mini-Games & Interactive Tasks

Certain tasks trigger short interactive sequences rather than being simple click-and-wait actions.

### 10.1 Horse Riding / Training
- Side-scrolling riding course
- Player steers horse over jumps, around obstacles
- Better timing = higher training score
- Different courses for different skill levels
- Champagne's Walker gait feels different from Romeo's Morgan trot

### 10.2 Egg Gathering
- Timed collection: move through the coop, click nesting boxes
- Some hens are sitting on eggs and need gentle coaxing
- Spoiled eggs are visually distinct — collecting one by mistake is a small penalty

### 10.3 Goat Escape Chase
- Triggered when a goat breaks free
- Top-down chase through the farm — player must corner the goat
- Goats are fast and change direction unpredictably
- Luring with treats makes it easier

### 10.4 Predator Defense
- Night-time alert: predator spotted
- Player grabs flashlight and heads to the threatened area
- Shine light / make noise to scare predator away
- Quick event — 15–30 seconds. Miss it and the predator succeeds.

### 10.5 Hay Stacking
- Delivery arrives: 50 bales to stack
- Tetris-like stacking puzzle in the barn
- Better stacking = better storage (less mold risk)
- Satisfying completion with a "barn full" visual

### 10.6 Snow Shoveling / Blowing
- Path-clearing task after heavy snow
- Player traces a path on the map to clear
- Snow blower is faster but costs fuel; shovel is free but slower and costs more stamina

---

## 11. Economy & Progression

### 11.1 Income Sources

| Source | Frequency | Base Value | Notes |
|---|---|---|---|
| Eggs (white) | Daily | $2/egg | From most breeds |
| Eggs (blue/green) | Daily | $4/egg | Araucana only — premium |
| Vegetables | Seasonal harvest | $5–20/crop | Varies by crop type |
| Flowers | Seasonal | $3–8/bunch | Boosts garden yields too |
| Wine | Annual (fall) | $50–200/bottle | Quality depends on vine care |
| Horse breeding | Occasional | $500–2000/foal | Requires healthy, happy parents |
| Brush clearing (goats) | Per job | $25/area | Neighbor contracts |

### 11.2 Expenses

| Expense | Cost | Frequency |
|---|---|---|
| Hay (50 bales) | $250 | Every ~14 days |
| Oats | $40/bag | Every ~7 days |
| Chicken feed | $20/bag | Every ~5 days |
| Goat feed | $30/bag | Every ~7 days |
| Cat food | $15/bag | Every ~10 days |
| Farrier visit | $150 | Every 42–56 days |
| Vet (routine) | $100/animal | Annually |
| Vet (emergency) | $200–500 | As needed |
| Fence repair supplies | $25/section | As needed |
| Pest control | $30/treatment | Summer |
| Flea/tick collar | $20/collar | Every ~270 days per cat |
| Equipment repair | $50–200 | As needed |
| Seeds/plants | $5–15/packet | Seasonal |

### 11.3 Progression Milestones

The game tracks achievements and milestones that gate new content:

- **Year 1 Complete:** Survive all four seasons. Unlock farm expansion options.
- **First Wine Vintage:** Successfully produce wine. Unlock vineyard upgrades.
- **Foal Born:** Breed horses successfully. Unlock additional horse-related content.
- **Zero Losses:** Complete a year with no animal injuries or escapes. Unlock improved fencing options.
- **Master Gardener:** Harvest every crop type in a single year.
- **Goat Whisperer:** Keep all goats' mischief below 30 for a full season.
- **Good Neighbor:** No neighbor complaints for a full year.

### 11.4 Farm Upgrades (purchased with earnings)

- Automatic waterers (reduces daily watering chores)
- Improved fencing (harder for goats to escape, better predator protection)
- Larger coop (more chickens)
- Hay elevator (faster hay stacking)
- Irrigation system (auto-water garden)
- Generator (prevents power outage problems)
- Additional pasture (more grazing without killing grass)

---

## 12. UI & HUD

### 12.1 In-Game HUD

- **Top-left:** Clock (current time, day, season). Weather icon.
- **Top-right:** Money display. Notification bell (upcoming events, warnings).
- **Bottom:** Item toolbar (8 slots). Currently held item highlighted.
- **Bottom-left:** Stamina bar.
- **Mini-map:** Toggle with M key. Shows farm zones, animal positions, and alert markers.

### 12.2 Menus

- **Pause Menu:** Resume, Save, Settings, Quit
- **Inventory:** Full grid of items. Drag to toolbar to equip.
- **Calendar:** Monthly view with scheduled events. Click a day to schedule.
- **Farm Journal:** Animal stats overview, recent events log ("Ruby laid an egg," "Spike tested the south fence"), financial summary.
- **Phone:** Schedule farrier/vet, order supplies (hay, feed, seeds). Deliveries take 1–3 game days.
- **Shop Catalog:** Browse and order upgrades, supplies, seeds.

### 12.3 Notification System

- **Toast notifications** slide in from the top-right for events:
  - "Goldie is crowing — neighbors are getting restless"
  - "Lela is eyeing the south fence..."
  - "Maria is meowing loudly at the porch"
  - "Hay supply: 8 bales remaining"
  - "The farrier is coming tomorrow"
- **Alert markers** appear on the mini-map for urgent issues (predator spotted, escaped goat, sick animal)
- **Morning summary** when the player wakes: overnight events, weather forecast, today's scheduled events

---

## 13. Audio Design

### 13.1 Music

- Ambient, gentle acoustic tracks that change with season and time of day
- Morning: Light guitar, birds chirping
- Daytime: Upbeat folk/country
- Evening: Slower, winding-down melody
- Winter: Softer, piano-driven, cozy
- No music during predator events — tension through silence and sound effects

### 13.2 Sound Effects

- **Ambient:** Wind, birds, distant traffic (rural), crickets (evening), rain/snow
- **Animals:** Specific sounds per animal — Romeo's whinny vs. Champagne's nicker, Goldie's crow, individual cat meows for Maria and Lelo, goat bleating, hen clucking
- **Player actions:** Footsteps (change with terrain — dirt, mud, snow, gravel), tool sounds, bucket filling, hay rustling, gate latching
- **Events:** Predator warning sounds, storm rumbles, equipment engine sounds, phone ringing
- **Feedback:** Satisfying "ding" for completed tasks, egg collection sound, cash register for sales

---

## 14. Monetization & Free/Premium Model

### 14.1 Free Tier (Core Game)

- Full farm with 4 animal types: 2 horses, 2 cats, 7 chickens + rooster, 3 goats
- All seasons, weather, predators, garden, and core mechanics
- All mini-games
- Farm upgrades up to tier 2

### 14.2 Premium Tier (One-Time Purchase or Subscription)

- **Additional animals:** Cows, pigs, sheep, oxen, ducks, geese — each with unique mechanics
- **Expanded farm zones:** New buildings (dairy barn, pig pen, duck pond)
- **Advanced breeding:** Cross-breeding, genetic traits
- **Expanded economy:** Farmers market, county fair competitions
- **Tier 3+ farm upgrades**
- **Cosmetic options:** Farmhouse customization, custom animal names/colors
- **No ads in either tier** — premium is pure content expansion

### 14.3 Future Content (Post-Launch)

- Seasonal holiday events
- Multiplayer farm visits
- Leaderboards (most productive farm, longest streak without animal loss)
- Community challenges
- Additional crop types and recipes

---

## 15. Development Phases

### Phase 1 — MVP (Months 1–3)
- Core engine: map rendering, player movement, time/season system
- One animal type fully implemented (chickens — simplest mechanics)
- Basic feeding/watering/egg-gathering loop
- Day/night cycle with simple HUD
- Save/load system

### Phase 2 — Core Animals (Months 3–5)
- Add horses, cats, goats with full stat systems
- All daily interactions for each animal
- Predator system (basic: fox and hawk)
- Weather system affecting gameplay

### Phase 3 — Economy & Polish (Months 5–7)
- Full economy: income, expenses, supply ordering
- Garden system
- Farm upgrades
- Calendar and scheduling (farrier, vet)
- Mini-games (riding, hay stacking, egg gathering)
- Notification system
- Audio implementation

### Phase 4 — Content & Launch (Months 7–9)
- All predator types
- Random events system
- Grape orchard and wine production
- Breeding systems
- Progression milestones
- Mobile optimization and touch controls
- QA, balancing, playtesting
- Launch free tier

### Phase 5 — Premium & Post-Launch (Months 9+)
- Premium animal types
- Expanded farm zones
- Advanced features (breeding, farmers market)
- Community features
- Ongoing content updates

---

## 16. Key Design Principles

1. **Every animal is an individual.** Romeo feels different from Champagne. Sandy is the little one. Spike is the escape artist. Players should care about their animals by name.

2. **Consequences are fair but real.** Forgetting to lock the coop doesn't immediately kill a chicken, but repeated neglect compounds. The game teaches responsibility without being punishing.

3. **Seasons change everything.** The same farm feels completely different in January vs. July. Players who master summer will face new challenges in winter.

4. **Humor lives in the details.** Goats scheming at the fence. Cats judging you through the window. Feeding a goat a tin can. The game should make people smile.

5. **Based on real farm life.** The mechanics are grounded in what actually happens on a small New England farm. That authenticity is the game's signature.

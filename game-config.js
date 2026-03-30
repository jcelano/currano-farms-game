/**
 * Currano Farms — Master Game Configuration
 *
 * All tunable game values live here. Nothing gameplay-related should be
 * hardcoded in game logic — pull from this config instead.
 *
 * To tweak balance: change a number here, reload, and test.
 */

export const CONFIG = {

  // ─── TIME SYSTEM ──────────────────────────────────────────────
  time: {
    msPerGameMinute: 1000,            // 1 real second = 1 game minute
    dayLengthMinutes: 24 * 60,        // 1440 game minutes per day (24 real minutes)
    daysPerSeason: 28,
    seasonsPerYear: 4,
    phases: {
      dawn:      { start: 5,  end: 7  },
      morning:   { start: 7,  end: 12 },
      afternoon: { start: 12, end: 17 },
      evening:   { start: 17, end: 20 },
      night:     { start: 20, end: 5  },
    },
    playerWakeHour: 5,
    playerSleepHour: 21,
    speedMultipliers: [1, 2],         // Available speed options
  },

  // ─── PLAYER ───────────────────────────────────────────────────
  player: {
    walkSpeed: 120,                   // Pixels per second
    runSpeed: 200,                    // Pixels per second (spooks nearby animals)
    runSpookRadius: 80,               // Pixels — animals within this radius get startled
    stamina: {
      max: 100,
      regenPerMeal: 35,               // Breakfast, lunch, dinner each restore this
      regenOnSleep: 100,              // Full restore
      costs: {
        feedAnimal: 2,
        waterAnimal: 2,
        brushHorse: 4,
        muckStall: 8,
        muckStallMuddy: 12,           // Spring mud penalty
        cleanCoop: 6,
        cleanCoopMuddy: 9,
        shovelSnow: 10,
        snowBlower: 5,                // Uses fuel instead of full stamina
        gardenWater: 3,
        gardenWeed: 4,
        gardenHarvest: 2,
        gardenPlant: 3,
        repairFence: 6,
        clearBrush: 7,
        stackHay: 5,                  // Per 10 bales
        carryFeed: 3,
        rideHorse: 5,
        trainHorse: 8,
        gatherEggs: 1,
        petCat: 1,
        giveAttention: 1,
        applyFleaCollar: 2,
        trimGoatHooves: 6,
      },
    },
    inventory: {
      toolbarSlots: 8,
      maxSlots: 30,
    },
  },

  // ─── ANIMAL STATS — UNIVERSAL ─────────────────────────────────
  // Stats range 0–100. Decay rates are points lost per game hour.
  animalStats: {
    warningThreshold: 20,             // Below this = animal is unhappy
    criticalThreshold: 5,             // Below this = health starts declining
    healthDecayWhenCritical: 2,       // Health points lost per hour when hunger or thirst is critical
    happinessDecayBase: 0.5,          // Base happiness decay per hour (modified by conditions)
    cleanlinessDecayBase: 0.8,        // Base cleanliness decay per hour
  },

  // ─── HORSES ───────────────────────────────────────────────────
  horses: {
    count: 2,
    defaults: [
      { name: 'Romeo', breed: 'Arabian/Morgan mix', color: 'bay', personality: 'noble' },
      { name: 'Champagne', breed: 'Tennessee Walker', color: 'chestnut', marking: 'white blaze', personality: 'gentle' },
    ],
    hunger: {
      decayPerHour: 3.0,              // Points lost per game hour
      oatsFill: 30,                   // Points restored by one oat feeding
      hayFill: 50,                    // Points restored by one hay feeding
    },
    thirst: {
      decayPerHour: {
        normal: 2.5,
        summer: 5.0,                  // 2x in summer
        heatWave: 7.5,               // 3x during heat wave
      },
      waterFill: 60,                  // Points restored by filling trough
      freezeThreshold: 0,             // Winter: water freezes, must be thawed
    },
    coat: {
      decayPerHour: {
        normal: 0.5,
        spring: 1.0,                  // 2x in spring (shedding)
      },
      brushBoost: 25,                 // Points restored per brushing
    },
    hoof: {
      decayPerDay: 1.5,               // Points lost per game day
      farrierReset: 100,              // Reset to full on farrier visit
      limpThreshold: 30,              // Below this = limping, speed penalty
      limpSpeedPenalty: 0.5,          // 50% speed reduction
    },
    training: {
      decayPerDay: 0.3,               // Slow decline if not trained
      rideBoost: 5,                   // Points per riding session
      trainBoost: 8,                  // Points per training session
      maxLevel: 100,
    },
    grazing: {
      happinessBoostPerHour: 5,       // Bonus while on grass
      grassHealthDecayPerHour: 2,     // Grass health drops while grazed
      grassRecoveryPerDay: 5,         // Grass recovers when not grazed
      grassDeathThreshold: 10,        // Below this, grass is dead and needs reseeding
    },
    breeding: {
      minHappiness: 80,
      minHealth: 80,
      gestationDays: 14,
      foalGrowthDays: 28,
      foalExtraFeedMultiplier: 1.5,
    },
  },

  // ─── CATS ─────────────────────────────────────────────────────
  cats: {
    count: 2,
    defaults: [
      { name: 'Maria', color: 'calico', personality: 'demanding' },
      { name: 'Lelo', color: 'gray tabby', personality: 'affectionate' },
    ],
    hunger: {
      decayPerHour: 2.0,
      feedFill: 60,
    },
    thirst: {
      decayPerHour: 1.5,
      waterFill: 70,
    },
    attention: {
      decayPerHour: 3.0,              // Cats need a lot of attention
      petBoost: 20,
      loudMeowThreshold: 30,          // Below this = loud meowing
      scratchFurnitureThreshold: 10,   // Below this = scratching furniture
      meowFrequencyMultiplier: 2.0,   // How much louder meowing gets as attention drops
    },
    fleaCollar: {
      startValue: 100,
      decayPerDay: 0.37,              // Hits 0 at ~270 days (9 months)
      itchingThreshold: 20,
      healthRiskThreshold: 10,
      replacementCost: 20,
    },
    heatedBed: {
      requiredInWinter: true,
      happinessDropWithoutPerHour: 5,  // How fast happiness drops without heat in winter
    },
    predatorEvasionChance: 0.6,        // 60% chance to escape a predator attack
  },

  // ─── CHICKENS ─────────────────────────────────────────────────
  chickens: {
    defaults: [
      { name: 'Goldie', role: 'rooster', breed: 'mixed', color: 'golden' },
      { name: 'Ruby', role: 'hen', breed: 'Rhode Island Red', color: 'reddish-brown' },
      { name: 'Sandy', role: 'hen', breed: 'Buff Orpington', color: 'buff', trait: 'smallest' },
      { name: 'Angelina', role: 'hen', breed: 'Black Australorp', color: 'glossy-black' },
      { name: 'Tangerine', role: 'hen', breed: 'Buff Orpington', color: 'golden-buff' },
      { name: 'Pebbles', role: 'hen', breed: 'Araucana', color: 'gray-blue', eggColor: 'blue' },
      { name: 'Midnight', role: 'hen', breed: 'Black Australorp', color: 'glossy-black' },
      { name: 'Valentina', role: 'hen', breed: 'Buff Orpington', color: 'golden-buff', trait: 'bold' },
    ],
    hunger: {
      decayPerHour: 2.5,
      feederFill: 80,                  // Fills all chickens in range
      treatBoost: 15,                  // Happiness + small hunger fill
      scrapBoost: 20,                  // Food scraps — happiness + hunger
    },
    thirst: {
      decayPerHour: {
        normal: 2.0,
        summer: 4.0,
      },
      watererFill: 80,
    },
    eggs: {
      layIntervalDays: { min: 1, max: 2 },  // Random within range
      happinessLayBonus: 0.8,          // Multiplier: high happiness = faster laying
      spoilTimeDays: 2,                // Uncollected eggs spoil after this
      blueEggBreeds: ['Araucana'],
      hatchTimeDays: 7,
      chickGrowthDays: 14,
      broodyChance: 0.05,             // 5% chance per day a hen goes broody
    },
    freeRange: {
      happinessBoostPerHour: 10,
      vulnerabilityMultiplier: 3.0,    // 3x predator risk when free ranging
    },
    rooster: {
      crowIntervalMinutes: { min: 30, max: 120 },  // Game minutes between crows
      crowHappinessMultiplier: 1.5,    // Crows more when happy
      neighborComplaintThreshold: 8,   // Crows per day before complaint
      complaintPenalty: 50,            // Dollar fine per complaint
    },
    coop: {
      unlockedPredatorMultiplier: 10.0,  // Massive predator risk if coop left unlocked at night
    },
  },

  // ─── GOATS ────────────────────────────────────────────────────
  goats: {
    count: 3,
    defaults: [
      { name: 'Lela', breed: 'Nigerian Dwarf', color: 'brown-white', personality: 'curious' },
      { name: 'Tiki', breed: 'Nigerian Dwarf', color: 'black-tan', personality: 'mellow' },
      { name: 'Spike', breed: 'Nigerian Dwarf', color: 'gray', personality: 'escape-artist' },
    ],
    hunger: {
      decayPerHour: 2.5,
      feedFill: 50,
      treatFill: 15,
      beerHappinessBoost: 30,
      beerMischiefBoost: 5,
    },
    thirst: {
      decayPerHour: {
        normal: 2.0,
        summer: 4.0,
      },
      waterFill: 60,
    },
    mischief: {
      growthPerHour: 1.5,              // Always slowly increasing
      treatReduction: 10,
      attentionReduction: 5,
      escapeAttemptThreshold: 60,      // Above this = actively testing fences
      escapeSuccessChance: {
        goodFence: 0.05,               // 5% chance with good fence
        damagedFence: 0.30,            // 30% with damaged fence
        brokenFence: 0.80,             // 80% with broken fence
      },
      gardenDamagePerSecond: 5,        // Crop health points lost per second when goat is in garden
      coopFeedEatRate: 10,             // Chicken feed points consumed per minute when raiding coop
      spikeEscapeBonus: 0.10,          // Spike gets +10% escape chance (he's the escape artist)
    },
    hoof: {
      decayPerDay: 1.0,
      trimReset: 100,
      trimIntervalDays: 42,            // Every 6 weeks ideally
    },
    tinCanReactions: [
      { item: 'tin_can', reaction: 'love', happinessBoost: 10 },
      { item: 'cardboard', reaction: 'love', happinessBoost: 8 },
      { item: 'newspaper', reaction: 'like', happinessBoost: 5 },
      { item: 'plastic_bottle', reaction: 'confused', happinessBoost: 2 },
      { item: 'old_shoe', reaction: 'hate', happinessBoost: -3 },
      { item: 'rubber_ball', reaction: 'play', happinessBoost: 12 },
    ],
    brushClearing: {
      clearRatePerHour: 10,            // Brush health points cleared per hour
      requiresSecureFence: true,
    },
  },

  // ─── GARDEN ───────────────────────────────────────────────────
  garden: {
    vegetable: {
      plots: 24,                       // 6x4 grid
      crops: {
        spring: [
          { name: 'lettuce', growDays: 4, sellPrice: 8, waterNeed: 1 },
          { name: 'peas', growDays: 5, sellPrice: 10, waterNeed: 1 },
          { name: 'radishes', growDays: 3, sellPrice: 5, waterNeed: 1 },
          { name: 'carrots', growDays: 6, sellPrice: 12, waterNeed: 1 },
        ],
        summer: [
          { name: 'tomatoes', growDays: 7, sellPrice: 15, waterNeed: 2 },
          { name: 'corn', growDays: 8, sellPrice: 12, waterNeed: 2 },
          { name: 'peppers', growDays: 6, sellPrice: 14, waterNeed: 2 },
          { name: 'squash', growDays: 7, sellPrice: 10, waterNeed: 1 },
        ],
        fall: [
          { name: 'pumpkins', growDays: 9, sellPrice: 20, waterNeed: 1 },
          { name: 'potatoes', growDays: 7, sellPrice: 12, waterNeed: 1 },
          { name: 'beets', growDays: 5, sellPrice: 8, waterNeed: 1 },
          { name: 'kale', growDays: 4, sellPrice: 7, waterNeed: 1 },
        ],
        winter: [],                    // Nothing grows
      },
      growthStages: {
        planted: 0,
        sprout: 2,                     // Days after planting
        growing: 'variable',           // Depends on crop
        harvestable: 'variable',
        witherDays: 3,                 // Days before unharvested crop dies
      },
      weedGrowthIntervalDays: 2.5,    // Weeds appear every ~2.5 days
      weedCropDamagePerDay: 5,         // Unweeded plots lose crop health
    },
    flower: {
      plots: 8,
      pollinatorBonus: 0.15,           // 15% yield boost to veggie garden when flowers active
      sellPriceRange: { min: 3, max: 8 },
    },
    grapes: {
      vines: 10,
      maturationDays: 112,             // Full game year to mature
      harvestSeason: 'fall',
      fermentationDays: 14,
      wineValue: { min: 50, max: 200 },  // Quality-dependent
      qualityFactors: ['pruning', 'watering', 'pestControl', 'frostProtection'],
      frostDamageChance: 0.15,         // 15% chance in late spring / early fall
      birdDamageWithoutNets: 0.3,      // 30% crop loss without netting
    },
    pests: {
      japaneseBeetles: {
        season: 'summer',
        spawnChancePerDay: 0.4,        // 40% chance per day in summer
        cropDamagePerDay: 15,          // If untreated
        handPickTime: 5,               // Game minutes per plot (slow)
        sprayInstant: true,
        sprayCost: 30,
      },
    },
  },

  // ─── PREDATOR SYSTEM ──────────────────────────────────────────
  predators: {
    fox: {
      activeTime: 'dusk_night',        // Evening and night
      targets: ['chickens', 'cats'],
      warningSign: 'rustling_fence',
      baseAttackChance: 0.15,          // 15% chance per night
      seasonMultiplier: { spring: 1.5, summer: 1.0, fall: 1.3, winter: 0.8 },
      preventedBy: ['locked_coop', 'cats_inside'],
    },
    hawk: {
      activeTime: 'daytime',
      targets: ['chickens_freerange'],
      warningSign: 'shadow_ground',
      baseAttackChance: 0.10,
      seasonMultiplier: { spring: 1.2, summer: 1.0, fall: 1.0, winter: 0.5 },
      preventedBy: ['chickens_in_coop'],
      suppressedBy: ['thunderstorm'],  // Hawks don't attack in storms
    },
    raccoon: {
      activeTime: 'night',
      targets: ['chickens', 'cat_food'],
      warningSign: 'knocked_trash',
      baseAttackChance: 0.12,
      seasonMultiplier: { spring: 1.0, summer: 1.2, fall: 1.3, winter: 0.5 },
      preventedBy: ['locked_coop', 'secured_food'],
    },
    weasel: {
      activeTime: 'night',
      targets: ['chickens'],
      warningSign: 'scratch_marks',
      baseAttackChance: 0.08,
      seasonMultiplier: { spring: 1.0, summer: 1.0, fall: 1.0, winter: 1.2 },
      preventedBy: ['locked_coop', 'repaired_coop'],
    },
    fisherCat: {
      activeTime: 'night',
      targets: ['chickens', 'cats'],
      warningSign: 'screeching',
      baseAttackChance: 0.06,
      seasonMultiplier: { spring: 1.0, summer: 0.8, fall: 1.0, winter: 1.5 },
      preventedBy: ['locked_coop', 'cats_inside'],
    },
    possum: {
      activeTime: 'night',
      targets: ['chicken_feed', 'goat_feed'],
      warningSign: 'feed_drop',
      baseAttackChance: 0.20,          // Common but low impact
      seasonMultiplier: { spring: 1.0, summer: 1.0, fall: 1.2, winter: 0.8 },
      preventedBy: ['secured_feed'],
      damage: 'feed_loss',             // Steals feed, doesn't hurt animals
      feedStolenPerRaid: 15,           // Feed points consumed
    },
    bear: {
      activeTime: 'any',
      targets: ['goats', 'feed_storage'],
      warningSign: 'crashing_fence',
      baseAttackChance: 0.03,          // Rare
      seasonMultiplier: { spring: 1.5, summer: 1.0, fall: 2.0, winter: 0.0 },  // Hibernate in winter
      preventedBy: ['tractor_horn', 'animal_control'],
      isCrisisEvent: true,             // Triggers special UI
    },
  },

  // ─── WEATHER ──────────────────────────────────────────────────
  weather: {
    probabilities: {
      spring:  { clear: 0.30, cloudy: 0.20, rain: 0.30, thunderstorm: 0.10, snow: 0.00, iceStorm: 0.00, heatWave: 0.00, fog: 0.10 },
      summer:  { clear: 0.50, cloudy: 0.15, rain: 0.20, thunderstorm: 0.10, snow: 0.00, iceStorm: 0.00, heatWave: 0.05, fog: 0.00 },
      fall:    { clear: 0.40, cloudy: 0.20, rain: 0.20, thunderstorm: 0.05, snow: 0.05, iceStorm: 0.00, heatWave: 0.00, fog: 0.10 },
      winter:  { clear: 0.25, cloudy: 0.20, rain: 0.05, thunderstorm: 0.00, snow: 0.35, iceStorm: 0.10, heatWave: 0.00, fog: 0.05 },
    },
    effects: {
      rain: {
        playerSpeedMultiplier: 0.85,
        autoWaterGarden: true,
        nextDayMuddy: true,
        muddyTaskTimeMultiplier: 1.25,
      },
      thunderstorm: {
        animalStressPerHour: 10,
        fenceDamageChance: 0.10,
        coopDamageChance: 0.05,
        suppressesHawks: true,
      },
      snow: {
        inchesPerStorm: { min: 1, max: 8 },
        shovelRequiredInches: 4,
        waterFreezes: true,
        thawTimeMinutes: 15,           // Game minutes to thaw one trough
      },
      iceStorm: {
        powerOutageChance: 0.50,
        playerSpeedMultiplier: 0.70,
        pathDamageChance: 0.15,
      },
      heatWave: {
        thirstMultiplier: 2.0,
        gardenWaterMultiplier: 2.0,
        flyIncreaseMultiplier: 1.5,
        durationDays: { min: 2, max: 4 },
      },
      fog: {
        visibilityRadius: 0.4,         // 40% of normal view distance
        predatorDetectionPenalty: 0.5,  // 50% harder to spot predators
      },
    },
  },

  // ─── ECONOMY ──────────────────────────────────────────────────
  economy: {
    startingMoney: 500,
    income: {
      eggWhite: 2,
      eggBlue: 4,
      vegetable: { min: 5, max: 20 },   // Varies by crop
      flower: { min: 3, max: 8 },
      wine: { min: 50, max: 200 },
      foal: { min: 500, max: 2000 },
      brushClearing: 25,
    },
    expenses: {
      hay50Bales: 250,
      oatsBag: 40,
      chickenFeedBag: 20,
      goatFeedBag: 30,
      catFoodBag: 15,
      farrierVisit: 150,
      vetRoutine: 100,
      vetEmergency: { min: 200, max: 500 },
      fenceRepair: 25,
      pestControl: 30,
      fleaCollar: 20,
      equipmentRepair: { min: 50, max: 200 },
      seedPacket: { min: 5, max: 15 },
      grapeNetting: 40,
      flyTraps: 15,
      flyMask: 25,
    },
    supplyConsumption: {
      hayBalesPerDay: 3.5,             // ~14 days per 50-bale delivery
      oatsBagDays: 7,
      chickenFeedBagDays: 5,
      goatFeedBagDays: 7,
      catFoodBagDays: 10,
    },
    deliveryTimeDays: { min: 1, max: 3 },
    neighborComplaintFine: 50,
  },

  // ─── PROFESSIONAL VISITS ──────────────────────────────────────
  scheduling: {
    farrier: {
      intervalDays: { min: 42, max: 56 },  // 6–8 weeks
      cost: 150,
      missedRescheduleDays: 14,
      missedFee: 0,                     // No fee, just delay
    },
    vet: {
      annualCheckupCost: 100,
      emergencyCost: { min: 200, max: 500 },
      dewormIntervalDays: 90,           // Every ~3 months for horses and goats
      dentalFloatIntervalDays: 365,     // Once per year for horses
    },
    goatHoofTrim: {
      intervalDays: { min: 42, max: 56 },
      canDoSelf: true,                  // Player can do it (costs stamina) or vet
      selfStaminaCost: 6,
      vetCost: 50,
    },
  },

  // ─── FENCES & PROPERTY ────────────────────────────────────────
  property: {
    fenceSections: 20,                  // Total fence sections around property
    fenceHealth: {
      max: 100,
      decayPerDay: 0.5,                // Slow natural decay
      stormDamage: { min: 10, max: 30 },
      goatTestDamage: 2,               // Damage per escape attempt
      repairAmount: 100,               // Full repair per section
      weakThreshold: 40,               // Below this = goats notice
      brokenThreshold: 15,             // Below this = easy escape
    },
    stoneWalls: {
      sections: 8,
      decayPerSeason: 2,               // Very slow
      repairCost: 40,
    },
    brush: {
      growthPerDay: 2,
      maxBrush: 100,
      clearManualRate: 10,             // Per hour of player work
      goatClearRate: 10,               // Per hour of goat work
    },
    snowAccumulation: {
      maxInches: 18,
      shovelClearRate: 2,              // Inches per game-hour
      snowBlowerClearRate: 6,          // Inches per game-hour
      snowBlowerFuelCost: 5,           // Per use
    },
  },

  // ─── FARM UPGRADES ────────────────────────────────────────────
  upgrades: {
    tier1: {
      autoWaterer:       { cost: 300, effect: 'Reduces daily watering time by 50%' },
      improvedFencing:   { cost: 400, effect: 'Fence decay rate halved, goat escape chance -20%' },
      flyTrapsDeluxe:    { cost: 150, effect: 'Automatic fly control in summer' },
    },
    tier2: {
      largerCoop:        { cost: 600, effect: 'Can hold up to 15 chickens' },
      hayElevator:       { cost: 500, effect: 'Hay stacking mini-game is easier and faster' },
      irrigationSystem:  { cost: 700, effect: 'Garden auto-watered daily' },
    },
    tier3: {  // Premium only
      generator:         { cost: 1000, effect: 'Prevents power outage problems' },
      additionalPasture: { cost: 800,  effect: 'More grazing area, grass lasts 2x longer' },
      heatedBarn:        { cost: 1200, effect: 'All barn animals stay warm, no trough freezing' },
      tractorUpgrade:    { cost: 1500, effect: 'Faster brush clearing, snow plowing, hay moving' },
    },
  },

  // ─── RANDOM EVENTS ────────────────────────────────────────────
  randomEvents: {
    checkIntervalHours: 4,             // Roll for random events every 4 game hours
    events: {
      stormDamage:      { chance: 0.08, seasons: ['spring', 'fall', 'winter'] },
      animalIllness:    { chance: 0.05, seasons: ['all'] },
      goatEscape:       { chance: 0.15, seasons: ['all'] },  // On top of normal escape mechanics
      equipmentBreak:   { chance: 0.04, seasons: ['all'] },
      moldyHay:         { chance: 0.06, seasons: ['spring', 'summer'] },  // Humidity
      powerOutage:      { chance: 0.10, seasons: ['winter'] },
      neighborVisit:    { chance: 0.08, seasons: ['all'] },  // Positive event — tips or gifts
      wildflowerBloom:  { chance: 0.10, seasons: ['spring'] },  // Bonus pollinator effect
    },
  },

  // ─── MINI-GAMES ───────────────────────────────────────────────
  miniGames: {
    horseRiding: {
      durationSeconds: 60,
      jumpTimingWindowMs: 300,          // How precise the timing needs to be
      perfectJumpBonus: 3,              // Extra training points for perfect timing
      champagneGaitSpeed: 0.9,         // Slightly different feel per horse
      romeoGaitSpeed: 1.1,
    },
    hayStacking: {
      balesPerDelivery: 50,
      stackWidth: 8,                   // Tetris-like grid width
      stackHeight: 12,
      perfectStackMoldReduction: 0.5,  // 50% less mold risk with perfect stacking
    },
    goatChase: {
      goatSpeed: 160,                  // Faster than player walk
      goatDirectionChangeInterval: 800, // Ms between random direction changes
      treatLureRadius: 60,             // Pixels — goat comes toward treat within this range
      maxDurationSeconds: 45,
    },
    predatorDefense: {
      alertWindowSeconds: 20,          // Time to reach the threatened area
      flashlightRadius: 100,
      scareDistance: 50,               // Get this close to scare predator
      failConsequence: 'attack_succeeds',
    },
    eggGathering: {
      timePerRoundSeconds: 30,
      spoiledEggPenalty: 5,            // Money lost for collecting a spoiled egg
      broodyCooingChance: 0.2,        // 20% chance hen needs coaxing
      coaxTimeSeconds: 3,
    },
    snowClearing: {
      pathSegments: 12,                // Number of path segments to clear
      shovelTimePerSegment: 8,         // Seconds per segment with shovel
      blowerTimePerSegment: 3,         // Seconds per segment with snow blower
    },
  },

  // ─── PROGRESSION MILESTONES ───────────────────────────────────
  milestones: {
    year1Complete:     { condition: 'survive_all_seasons', reward: 'farm_expansion_unlocked' },
    firstWineVintage:  { condition: 'produce_wine', reward: 'vineyard_upgrades_unlocked' },
    foalBorn:          { condition: 'breed_horses', reward: 'horse_content_expanded' },
    zeroLosses:        { condition: 'no_injuries_1_year', reward: 'improved_fencing_option' },
    masterGardener:    { condition: 'harvest_all_crops_1_year', reward: 'rare_seed_catalog' },
    goatWhisperer:     { condition: 'mischief_below_30_full_season', reward: 'goat_tricks_unlocked' },
    goodNeighbor:      { condition: 'no_complaints_1_year', reward: 'neighbor_trade_unlocked' },
  },
};

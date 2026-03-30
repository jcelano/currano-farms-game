// Game configuration with TypeScript types.
// Source of truth: /game-config.js at project root.
// Values are inlined here for type safety and tree-shaking.

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow' | 'iceStorm' | 'heatWave' | 'fog';
export type DayPhase = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

export const CONFIG = {
  player: {
    walkSpeed: 120,
    runSpeed: 200,
    runSpookRadius: 80,
  },
  map: {
    widthTiles: 80,
    heightTiles: 60,
    tileSize: 32,
    get widthPx() { return this.widthTiles * this.tileSize; },
    get heightPx() { return this.heightTiles * this.tileSize; },
  },
  display: {
    baseWidth: 960,
    baseHeight: 540,
  },
  time: {
    msPerGameMinute: 1000,
    daysPerSeason: 28,
    seasonsPerYear: 4,
    phases: {
      dawn:      { start: 5,  end: 7  },
      morning:   { start: 7,  end: 12 },
      afternoon: { start: 12, end: 17 },
      evening:   { start: 17, end: 20 },
      night:     { start: 20, end: 5  },
    } as Record<DayPhase, { start: number; end: number }>,
    playerWakeHour: 5,
    playerSleepHour: 21,
    speedMultipliers: [1, 2] as number[],
  },
  weather: {
    probabilities: {
      spring:  { clear: 0.30, cloudy: 0.20, rain: 0.30, thunderstorm: 0.10, snow: 0.00, iceStorm: 0.00, heatWave: 0.00, fog: 0.10 },
      summer:  { clear: 0.50, cloudy: 0.15, rain: 0.20, thunderstorm: 0.10, snow: 0.00, iceStorm: 0.00, heatWave: 0.05, fog: 0.00 },
      fall:    { clear: 0.40, cloudy: 0.20, rain: 0.20, thunderstorm: 0.05, snow: 0.05, iceStorm: 0.00, heatWave: 0.00, fog: 0.10 },
      winter:  { clear: 0.25, cloudy: 0.20, rain: 0.05, thunderstorm: 0.00, snow: 0.35, iceStorm: 0.10, heatWave: 0.00, fog: 0.05 },
    } as Record<Season, Record<WeatherCondition, number>>,
    effects: {
      rain: {
        playerSpeedMultiplier: 0.85,
        autoWaterGarden: true,
        nextDayMuddy: true,
      },
      thunderstorm: {
        playerSpeedMultiplier: 0.85,
        animalStressPerHour: 10,
        fenceDamageChance: 0.10,
        suppressesHawks: true,
      },
      snow: {
        playerSpeedMultiplier: 1.0,
        waterFreezes: true,
      },
      iceStorm: {
        playerSpeedMultiplier: 0.70,
        powerOutageChance: 0.50,
      },
      heatWave: {
        playerSpeedMultiplier: 1.0,
        thirstMultiplier: 2.0,
        durationDays: { min: 2, max: 4 },
      },
      fog: {
        playerSpeedMultiplier: 1.0,
        visibilityRadius: 0.4,
      },
      clear: { playerSpeedMultiplier: 1.0 },
      cloudy: { playerSpeedMultiplier: 1.0 },
    } as Record<WeatherCondition, { playerSpeedMultiplier: number; [key: string]: unknown }>,
  },

  // ─── ANIMAL STATS ──────────────────────────────────────
  animalStats: {
    warningThreshold: 20,
    criticalThreshold: 5,
    healthDecayWhenCritical: 2,
    happinessDecayBase: 0.5,
    cleanlinessDecayBase: 0.8,
  },

  // ─── CHICKENS ──────────────────────────────────────────
  chickens: {
    defaults: [
      { name: 'Goldie', role: 'rooster' as const, breed: 'mixed', color: 0xdaa520 },
      { name: 'Ruby', role: 'hen' as const, breed: 'Rhode Island Red', color: 0xa0522d },
      { name: 'Sandy', role: 'hen' as const, breed: 'Buff Orpington', color: 0xdeb887, trait: 'smallest' },
      { name: 'Angelina', role: 'hen' as const, breed: 'Black Australorp', color: 0x2f2f2f },
      { name: 'Tangerine', role: 'hen' as const, breed: 'Buff Orpington', color: 0xe8a317 },
      { name: 'Pebbles', role: 'hen' as const, breed: 'Araucana', color: 0x7090a0, eggColor: 'blue' },
      { name: 'Midnight', role: 'hen' as const, breed: 'Black Australorp', color: 0x1a1a2e },
      { name: 'Valentina', role: 'hen' as const, breed: 'Buff Orpington', color: 0xe8a317, trait: 'bold' },
    ],
    hunger: {
      decayPerHour: 2.5,
      feederFill: 80,
      treatBoost: 15,
      scrapBoost: 20,
    },
    thirst: {
      decayPerHour: { normal: 2.0, summer: 4.0 },
      watererFill: 80,
    },
    freeRange: {
      happinessBoostPerHour: 10,
      vulnerabilityMultiplier: 3.0,
    },
    eggs: {
      layIntervalDays: { min: 1, max: 2 },
      happinessLayBonus: 0.8,
      spoilTimeDays: 2,
      blueEggBreeds: ['Araucana'],
      broodyChance: 0.05,
      hatchTimeDays: 7,
      chickGrowthDays: 14,
      maxBroody: 2,
    },
    rooster: {
      crowIntervalMinutes: { min: 30, max: 120 },
      crowHappinessMultiplier: 1.5,
      neighborComplaintThreshold: 8,
      complaintPenalty: 50,
    },
    coop: {
      unlockedPredatorMultiplier: 10.0,
      cleanlinessDecayPerHour: 0.8,
      dirtyThreshold: 40,
      criticalThreshold: 20,
      healthPenaltyPerHour: 1,
    },
  },

  // ─── GOATS ─────────────────────────────────────────────
  goats: {
    defaults: [
      { name: 'Lela', breed: 'Nigerian Dwarf', color: 0x8b6340, personality: 'curious' as const },
      { name: 'Tiki', breed: 'Nigerian Dwarf', color: 0x2a2a2a, personality: 'mellow' as const },
      { name: 'Spike', breed: 'Nigerian Dwarf', color: 0x888888, personality: 'escape-artist' as const },
    ],
    hunger: { decayPerHour: 2.5, feedFill: 50, treatFill: 15 },
    thirst: { decayPerHour: { normal: 2.0, summer: 4.0 }, waterFill: 60 },
    mischief: {
      growthPerHour: 1.5,
      treatReduction: 10,
      attentionReduction: 5,
      escapeAttemptThreshold: 60,
      escapeSuccessChance: { goodFence: 0.05, damagedFence: 0.30, brokenFence: 0.80 },
      gardenDamagePerSecond: 5,
      spikeEscapeBonus: 0.10,
    },
    hoof: { decayPerDay: 1.0, trimReset: 100, trimIntervalDays: 42 },
  },

  // ─── HORSES ────────────────────────────────────────────
  horses: {
    defaults: [
      { name: 'Romeo', breed: 'Arabian/Morgan', color: 0x6b3a1e, personality: 'noble' as const },
      { name: 'Champagne', breed: 'Tennessee Walker', color: 0x8b5a2b, personality: 'gentle' as const, marking: 'blaze' },
    ],
    hunger: { decayPerHour: 3.0, oatsFill: 30, hayFill: 50 },
    thirst: { decayPerHour: { normal: 2.5, summer: 5.0, heatWave: 7.5 }, waterFill: 60 },
    coat: { decayPerHour: { normal: 0.5, spring: 1.0 }, brushBoost: 25 },
    hoof: { decayPerDay: 1.5, farrierReset: 100, limpThreshold: 30, limpSpeedPenalty: 0.5 },
    training: { decayPerDay: 0.3, rideBoost: 5, trainBoost: 8, maxLevel: 100 },
    grazing: { happinessBoostPerHour: 5 },
    farrierCost: 150,
  },

  // ─── CATS ──────────────────────────────────────────────
  cats: {
    defaults: [
      { name: 'Maria', color: 0xdd8844, personality: 'demanding' as const, pattern: 'calico' },
      { name: 'Lelo', color: 0x888899, personality: 'affectionate' as const, pattern: 'tabby' },
    ],
    hunger: { decayPerHour: 2.0, feedFill: 60 },
    thirst: { decayPerHour: 1.5, waterFill: 70 },
    attention: {
      decayPerHour: 3.0,
      petBoost: 20,
      loudMeowThreshold: 30,
      scratchFurnitureThreshold: 10,
    },
    fleaCollar: {
      startValue: 100,
      decayPerDay: 0.37,
      itchingThreshold: 20,
      healthRiskThreshold: 10,
      replacementCost: 20,
    },
    heatedBed: { happinessDropWithoutPerHour: 5 },
    predatorEvasionChance: 0.6,
  },

  // ─── FENCES ────────────────────────────────────────────
  fences: {
    totalSections: 20,
    maxHealth: 100,
    decayPerDay: 0.5,
    stormDamage: { min: 10, max: 30 },
    goatTestDamage: 2,
    weakThreshold: 40,
    brokenThreshold: 15,
    repairCost: 25,
  },

  // ─── PREDATORS ─────────────────────────────────────────
  predators: {
    fox: {
      activeTime: 'dusk_night' as const,
      baseAttackChance: 0.15,
      seasonMultiplier: { spring: 1.5, summer: 1.0, fall: 1.3, winter: 0.8 },
      healthDamage: 30,
      scareRadius: 100,
      speed: 60,
    },
    hawk: {
      activeTime: 'daytime' as const,
      baseAttackChance: 0.10,
      seasonMultiplier: { spring: 1.2, summer: 1.0, fall: 1.0, winter: 0.5 },
      healthDamage: 25,
      scareRadius: 120,
      speed: 80,
      suppressedByThunderstorm: true,
    },
  },

  // ─── ECONOMY ───────────────────────────────────────────
  economy: {
    startingMoney: 500,
    eggWhitePrice: 2,
    eggBluePrice: 4,
    spoiledEggPenalty: 5,
  },

  // ─── STAMINA ───────────────────────────────────────────
  stamina: {
    max: 100,
    regenPerMeal: 35,
    regenOnSleep: 100,
    exhaustedSpeedMultiplier: 0.5,
    costs: {
      feedAnimal: 2,
      waterAnimal: 2,
      gatherEggs: 1,
      cleanCoop: 6,
      cleanCoopMuddy: 9,
      petCat: 1,
      brushHorse: 4,
      repairFence: 6,
    },
  },

  // ─── INTERACTION ───────────────────────────────────────
  interaction: {
    proximityRadius: 60,
    cooldownMs: 500,
  },
};

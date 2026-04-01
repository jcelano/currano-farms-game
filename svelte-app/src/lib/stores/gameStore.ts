import { writable, get } from 'svelte/store';
import type { Season, WeatherCondition, DayPhase } from '$lib/game/config';

// ─── Player & Scene ────────────────────────────────────────
export const playerPosition = writable({ x: 0, y: 0 });
export const currentZone = writable('');
export const fps = writable(0);
export const devMode = writable(false);
export const gameReady = writable(false);

// ─── Player Inventory (Carry System) ──────────────────────
export const MAX_INVENTORY = 3;

export interface CarriedItem {
  id: string;        // 'water-bucket', 'brush', 'pitchfork'
  label: string;     // Display name
  spriteKey: string;  // For visual indicator
  sourceId: string;   // Interactable ID it came from (for return)
}

export const playerInventory = writable<CarriedItem[]>([]);

export function addToInventory(item: CarriedItem): boolean {
  const inv = get(playerInventory);
  // Don't pick up duplicates
  if (inv.some(i => i.id === item.id)) return false;
  if (inv.length >= MAX_INVENTORY) {
    // Drop oldest item
    playerInventory.update(list => [...list.slice(1), item]);
  } else {
    playerInventory.update(list => [...list, item]);
  }
  return true;
}

export function removeFromInventory(itemId: string): CarriedItem | null {
  const inv = get(playerInventory);
  const item = inv.find(i => i.id === itemId);
  if (!item) return null;
  playerInventory.update(list => list.filter(i => i.id !== itemId));
  return item;
}

export function hasItem(itemId: string): boolean {
  return get(playerInventory).some(i => i.id === itemId);
}

// ─── Time System ───────────────────────────────────────────
export interface GameTimeState {
  hour: number;
  minute: number;
  day: number;        // 1-28 within current season
  season: Season;
  year: number;
  totalDays: number;  // Total elapsed days
}

export const gameTime = writable<GameTimeState>({
  hour: 5,
  minute: 0,
  day: 1,
  season: 'spring',
  year: 1,
  totalDays: 0,
});

export const timePhase = writable<DayPhase>('dawn');
export const gameSpeedMultiplier = writable(1);
export const gamePaused = writable(false);

// ─── Weather System ────────────────────────────────────────
export interface WeatherState {
  condition: WeatherCondition;
  isMuddy: boolean;         // Day after rain
  heatWaveDaysLeft: number; // Multi-day heat wave tracking
  speedMultiplier: number;  // Current weather speed effect
}

export const currentWeather = writable<WeatherState>({
  condition: 'clear',
  isMuddy: false,
  heatWaveDaysLeft: 0,
  speedMultiplier: 1.0,
});

// ─── Sleep System ──────────────────────────────────────────
export const sleepActive = writable(false);
export const morningSummary = writable<{ day: number; season: Season; weather: WeatherCondition } | null>(null);

// ─── Player Stamina ────────────────────────────────────────
export const playerStamina = writable(100);

// ─── Chickens ──────────────────────────────────────────────
export interface ChickenState {
  id: number;
  name: string;
  role: 'rooster' | 'hen';
  breed: string;
  color: number;
  hunger: number;
  thirst: number;
  happiness: number;
  health: number;
  cleanliness: number;
}

export const chickens = writable<ChickenState[]>([]);

// ─── Interaction System ────────────────────────────────────
export interface InteractionPromptState {
  label: string;
  cost: number;
  available: boolean;
  warning?: string; // shown in red when unavailable (e.g. "Not enough stamina!")
}

export const interactionPrompt = writable<InteractionPromptState | null>(null);
export const nearbyChicken = writable<ChickenState | null>(null);

// ─── Eggs ──────────────────────────────────────────────────
export interface EggState {
  id: number;
  henName: string;
  layDay: number;     // totalDays when laid
  isBlue: boolean;
  spoiled: boolean;
  x: number;
  y: number;
}

export const eggs = writable<EggState[]>([]);
export const collectedEggs = writable({ white: 0, blue: 0 });

// ─── Coop Door ─────────────────────────────────────────────
export const coopDoorOpen = writable(false);

// ─── Economy ───────────────────────────────────────────────
export const playerMoney = writable(500);

// ─── Notifications ─────────────────────────────────────────
export interface NotificationState {
  id: number;
  message: string;
  category: 'info' | 'warning' | 'danger' | 'positive';
  timestamp: number;
}

export const notifications = writable<NotificationState[]>([]);
export const notificationHistory = writable<NotificationState[]>([]);

let notifIdCounter = 0;
export function addNotification(message: string, category: NotificationState['category'] = 'info') {
  const notif: NotificationState = { id: notifIdCounter++, message, category, timestamp: Date.now() };
  notifications.update(list => [...list, notif].slice(-5)); // Keep last 5
  notificationHistory.update(list => [...list, notif].slice(-50)); // Keep last 50 for history
  // Auto-remove after 4 seconds
  setTimeout(() => {
    notifications.update(list => list.filter(n => n.id !== notif.id));
  }, 4000);
}

// ─── Goats ─────────────────────────────────────────────────
export interface GoatState {
  id: number; name: string; personality: string; color: number;
  hunger: number; thirst: number; happiness: number; health: number; cleanliness: number;
  mischief: number; hoofCondition: number; escaped: boolean;
}
export const goats = writable<GoatState[]>([]);
export const nearbyGoat = writable<GoatState | null>(null);

// ─── Horses ────────────────────────────────────────────────
export interface HorseState {
  id: number; name: string; breed: string; color: number;
  hunger: number; thirst: number; happiness: number; health: number; cleanliness: number;
  coat: number; hoofCondition: number; training: number;
}
export const horses = writable<HorseState[]>([]);
export const nearbyHorse = writable<HorseState | null>(null);

// ─── Cats ──────────────────────────────────────────────────
export interface CatState {
  id: number; name: string; color: number; pattern: string;
  hunger: number; thirst: number; happiness: number; health: number;
  attention: number; fleaCollar: number;
}
export const cats = writable<CatState[]>([]);
export const nearbyCat = writable<CatState | null>(null);

// ─── Visited Animals (Journal) ─────────────────────────────
export interface VisitedAnimal {
  type: 'chicken' | 'goat' | 'horse' | 'cat';
  id: number;
  name: string;
  stats: Record<string, number | string | boolean>;
  lastSeen: number; // timestamp
}
export const visitedAnimals = writable<VisitedAnimal[]>([]);
export const journalOpen = writable(false);

// ─── Notification Log ──────────────────────────────────────
export const notificationLogOpen = writable(false);

// ─── Water Levels ─────────────────────────────────────────
// Tracks fill % (0-100) for each waterer/trough by interactable ID
export const waterLevels = writable<Record<string, number>>({
  'chicken-waterer': 50,
  'goat-waterer': 50,
  'horse-water': 50,
  'cat-water': 50,
});

// ─── Gates ────────────────────────────────────────────────
export const gateStates = writable<Record<string, boolean>>({
  'gate-chicken-yard': false,
  'gate-paddock': false,
  'gate-goat-pen': false,
  'gate-coop': false,
  'gate-farmhouse': false,
});

// ─── Character ────────────────────────────────────────────
export type CharacterType = 'farmer' | 'farmer-girl';
export const playerCharacter = writable<CharacterType>('farmer-girl');

// ─── Fences ────────────────────────────────────────────────
export const fenceSections = writable<number[]>(new Array(20).fill(100));

// ─── Coop Cleanliness ──────────────────────────────────────
export const coopCleanliness = writable(80);

// ─── Overnight Events ──────────────────────────────────────
export const overnightEvents = writable<string[]>([]);

// ─── Chicks ────────────────────────────────────────────────
export const chickCount = writable(0);

// ─── Rooster ───────────────────────────────────────────────
export const dailyCrowCount = writable(0);

// ─── Settings ──────────────────────────────────────────────
export const musicVolume = writable(0.5);
export const sfxVolume = writable(0.5);
export const currentSaveSlot = writable(0);

// ─── Mobile Joystick ──────────────────────────────────────
export const joystickDirection = writable({ x: 0, y: 0 });
export const joystickInteract = writable(false);

// ─── Pause Menu ────────────────────────────────────────────
export const pauseMenuOpen = writable(false);

// ─── Event Bus ─────────────────────────────────────────────
class GameEventBus extends EventTarget {
  emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }

  on(event: string, callback: (detail: unknown) => void) {
    const handler = (e: Event) => callback((e as CustomEvent).detail);
    this.addEventListener(event, handler);
    return () => this.removeEventListener(event, handler);
  }
}

export const gameEvents = new GameEventBus();

// Re-export get for convenience in Phaser code
export { get };

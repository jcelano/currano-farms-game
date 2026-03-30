import {
  gameTime, currentWeather, chickens, eggs, collectedEggs,
  coopDoorOpen, coopCleanliness, playerStamina, playerMoney,
  dailyCrowCount, chickCount, playerPosition, gameSpeedMultiplier,
  get,
  type GameTimeState, type WeatherState, type ChickenState, type EggState,
} from '$lib/stores/gameStore';

export interface SaveSlotMeta {
  slot: number;
  day: number;
  season: string;
  totalDays: number;
  money: number;
  chickenCount: number;
  timestamp: number;
}

export interface SaveData {
  version: 1;
  meta: SaveSlotMeta;
  state: {
    gameTime: GameTimeState;
    currentWeather: WeatherState;
    chickens: ChickenState[];
    eggs: EggState[];
    collectedEggs: { white: number; blue: number };
    coopDoorOpen: boolean;
    coopCleanliness: number;
    playerStamina: number;
    playerMoney: number;
    dailyCrowCount: number;
    chickCount: number;
    playerPosition: { x: number; y: number };
    gameSpeedMultiplier: number;
  };
}

const DB_NAME = 'currano-farms';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class SaveSystem {
  async save(slot: number): Promise<void> {
    const time = get(gameTime);
    const data: SaveData = {
      version: 1,
      meta: {
        slot,
        day: time.day,
        season: time.season,
        totalDays: time.totalDays,
        money: get(playerMoney),
        chickenCount: get(chickens).length,
        timestamp: Date.now(),
      },
      state: {
        gameTime: time,
        currentWeather: get(currentWeather),
        chickens: get(chickens),
        eggs: get(eggs),
        collectedEggs: get(collectedEggs),
        coopDoorOpen: get(coopDoorOpen),
        coopCleanliness: get(coopCleanliness),
        playerStamina: get(playerStamina),
        playerMoney: get(playerMoney),
        dailyCrowCount: get(dailyCrowCount),
        chickCount: get(chickCount),
        playerPosition: get(playerPosition),
        gameSpeedMultiplier: get(gameSpeedMultiplier),
      },
    };

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(data);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  async load(slot: number): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(slot);
      request.onsuccess = () => {
        db.close();
        const data = request.result as SaveData | undefined;
        if (!data) { resolve(false); return; }
        this.restoreState(data.state);
        resolve(true);
      };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }

  async getSlotInfo(): Promise<(SaveSlotMeta | null)[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        db.close();
        const saves = request.result as SaveData[];
        const slots: (SaveSlotMeta | null)[] = [null, null, null];
        for (const save of saves) {
          if (save.meta.slot >= 0 && save.meta.slot < 3) {
            slots[save.meta.slot] = save.meta;
          }
        }
        resolve(slots);
      };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }

  async deleteSave(slot: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(slot);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  private restoreState(state: SaveData['state']) {
    gameTime.set(state.gameTime);
    currentWeather.set(state.currentWeather);
    chickens.set(state.chickens);
    eggs.set(state.eggs);
    collectedEggs.set(state.collectedEggs);
    coopDoorOpen.set(state.coopDoorOpen);
    coopCleanliness.set(state.coopCleanliness);
    playerStamina.set(state.playerStamina);
    playerMoney.set(state.playerMoney);
    dailyCrowCount.set(state.dailyCrowCount);
    chickCount.set(state.chickCount);
    playerPosition.set(state.playerPosition);
    gameSpeedMultiplier.set(state.gameSpeedMultiplier);
  }
}

export const saveSystem = new SaveSystem();

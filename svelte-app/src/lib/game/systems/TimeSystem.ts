import { CONFIG, SEASONS, type DayPhase, type Season } from '../config';
import {
  gameTime,
  timePhase,
  gameSpeedMultiplier,
  gamePaused,
  gameEvents,
  get,
} from '$lib/stores/gameStore';

export class TimeSystem {
  private accumulatorMs = 0;
  private currentSpeed = 1;
  private paused = false;
  private sleepTriggered = false; // Prevent multiple sleep triggers per night

  constructor() {
    // Subscribe to speed/pause stores
    gameSpeedMultiplier.subscribe(v => this.currentSpeed = v);
    gamePaused.subscribe(v => this.paused = v);

    // Listen for sleep event from SleepOverlay
    gameEvents.on('do-sleep', () => {
      this.skipToMorning();
    });
  }

  update(deltaMs: number) {
    if (this.paused) return;

    this.accumulatorMs += deltaMs * this.currentSpeed;

    const msPerMinute = CONFIG.time.msPerGameMinute;

    while (this.accumulatorMs >= msPerMinute) {
      this.accumulatorMs -= msPerMinute;
      this.advanceMinute();
    }
  }

  private advanceMinute() {
    const state = get(gameTime);
    let { hour, minute, day, season, year, totalDays } = state;

    minute++;
    if (minute >= 60) {
      minute = 0;
      hour++;

      if (hour >= 24) {
        hour = 0;
        this.advanceDay(state);
        return; // advanceDay handles the store update
      }
    }

    gameTime.set({ hour, minute, day, season, year, totalDays });
    this.updatePhase(hour);

    // Check for sleep time
    if (hour === CONFIG.time.playerSleepHour && minute === 0 && !this.sleepTriggered) {
      this.sleepTriggered = true;
      gameEvents.emit('sleep-prompt');
    }
  }

  private advanceDay(prev: { day: number; season: Season; year: number; totalDays: number }) {
    let { day, season, year, totalDays } = prev;
    day++;
    totalDays++;
    this.sleepTriggered = false;

    if (day > CONFIG.time.daysPerSeason) {
      day = 1;
      const seasonIdx = SEASONS.indexOf(season);
      if (seasonIdx >= SEASONS.length - 1) {
        season = SEASONS[0];
        year++;
        gameEvents.emit('year-change', { year });
      } else {
        season = SEASONS[seasonIdx + 1];
      }
      gameEvents.emit('season-change', { season });
    }

    gameTime.set({
      hour: CONFIG.time.playerWakeHour,
      minute: 0,
      day,
      season,
      year,
      totalDays,
    });
    this.updatePhase(CONFIG.time.playerWakeHour);
    gameEvents.emit('new-day', { day, season, year, totalDays });
  }

  /** Force advance to next morning (called by sleep system) */
  skipToMorning() {
    const state = get(gameTime);
    this.advanceDay(state);
  }

  private updatePhase(hour: number) {
    const phases = CONFIG.time.phases;
    let current: DayPhase = 'night';

    for (const [phase, range] of Object.entries(phases) as [DayPhase, { start: number; end: number }][]) {
      if (range.start < range.end) {
        // Normal range (e.g., dawn: 5-7)
        if (hour >= range.start && hour < range.end) {
          current = phase;
          break;
        }
      } else {
        // Wrapping range (e.g., night: 20-5)
        if (hour >= range.start || hour < range.end) {
          current = phase;
          break;
        }
      }
    }

    timePhase.set(current);
  }

  /** Get interpolation factor (0-1) within the current phase */
  getPhaseProgress(): number {
    const state = get(gameTime);
    const phase = get(timePhase);
    const range = CONFIG.time.phases[phase];
    const currentMinutes = state.hour * 60 + state.minute;

    let startMinutes = range.start * 60;
    let endMinutes = range.end * 60;

    // Handle wrapping (night: 20:00 to 5:00)
    if (range.start > range.end) {
      endMinutes += 24 * 60;
      const adjustedCurrent = currentMinutes < range.start
        ? currentMinutes + 24 * 60
        : currentMinutes;
      return (adjustedCurrent - startMinutes) / (endMinutes - startMinutes);
    }

    return (currentMinutes - startMinutes) / (endMinutes - startMinutes);
  }
}

import { CONFIG, type Season, type WeatherCondition } from '../config';
import { currentWeather, morningSummary, gameEvents, get } from '$lib/stores/gameStore';

export class WeatherSystem {
  constructor() {
    // Listen for new day to generate weather
    gameEvents.on('new-day', (detail) => {
      const { day, season } = detail as { day: number; season: Season };
      this.generateWeather(season, day);
    });

    // Generate initial weather
    this.generateWeather('spring', 1);
  }

  private generateWeather(season: Season, day: number) {
    const state = get(currentWeather);

    // Check if heat wave persists
    if (state.heatWaveDaysLeft > 1) {
      currentWeather.set({
        condition: 'heatWave',
        isMuddy: false,
        heatWaveDaysLeft: state.heatWaveDaysLeft - 1,
        speedMultiplier: CONFIG.weather.effects.heatWave.playerSpeedMultiplier,
      });
      morningSummary.set({ day, season, weather: 'heatWave' });
      return;
    }

    // Track if yesterday was rainy (for mud)
    const wasRainy = state.condition === 'rain' || state.condition === 'thunderstorm';

    // Roll new weather from probability table
    const condition = this.rollWeather(season);

    // Heat wave duration
    let heatWaveDays = 0;
    if (condition === 'heatWave') {
      const range = CONFIG.weather.effects.heatWave.durationDays as { min: number; max: number };
      heatWaveDays = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    const effects = CONFIG.weather.effects[condition];
    const speedMult = effects?.playerSpeedMultiplier ?? 1.0;

    currentWeather.set({
      condition,
      isMuddy: wasRainy && condition !== 'rain' && condition !== 'thunderstorm',
      heatWaveDaysLeft: heatWaveDays,
      speedMultiplier: speedMult,
    });

    gameEvents.emit('weather-change', { condition, isMuddy: wasRainy });
    morningSummary.set({ day, season, weather: condition });
  }

  private rollWeather(season: Season): WeatherCondition {
    const probs = CONFIG.weather.probabilities[season];
    const roll = Math.random();
    let cumulative = 0;

    for (const [condition, probability] of Object.entries(probs)) {
      cumulative += probability;
      if (roll <= cumulative) {
        return condition as WeatherCondition;
      }
    }

    return 'clear';
  }

  getSpeedMultiplier(): number {
    const state = get(currentWeather);
    let mult = state.speedMultiplier;
    if (state.isMuddy) mult *= 0.90;
    return mult;
  }
}

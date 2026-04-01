<script lang="ts">
  import { gameTime, currentWeather, gameSpeedMultiplier, gamePaused, pauseMenuOpen, musicVolume, sfxVolume, gameReady } from '$lib/stores/gameStore';
  import type { WeatherCondition } from '$lib/game/config';

  let muted = $state(false);

  const weatherIcons: Record<WeatherCondition, string> = {
    clear: 'Clear',
    cloudy: 'Cloudy',
    rain: 'Rain',
    thunderstorm: 'Storm',
    snow: 'Snow',
    iceStorm: 'Ice',
    heatWave: 'Heat',
    fog: 'Fog',
  };

  function formatTime(hour: number, minute: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  }

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const speeds = [1, 2, 5, 10];
  function toggleSpeed() {
    gameSpeedMultiplier.update(v => {
      const idx = speeds.indexOf(v);
      return speeds[(idx + 1) % speeds.length];
    });
  }

  function togglePause() {
    pauseMenuOpen.update(v => {
      const newVal = !v;
      gamePaused.set(newVal);
      return newVal;
    });
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      musicVolume.set(0);
      sfxVolume.set(0);
    } else {
      musicVolume.set(0.5);
      sfxVolume.set(0.5);
    }
  }
</script>

{#if $gameReady}
  <div class="time-hud">
    <span class="segment">Day {$gameTime.day}</span>
    <span class="divider">|</span>
    <span class="segment season">{capitalize($gameTime.season)}</span>
    <span class="divider">|</span>
    <span class="segment time">{formatTime($gameTime.hour, $gameTime.minute)}</span>
    <span class="divider">|</span>
    <span class="segment weather">
      {weatherIcons[$currentWeather.condition]}
      {#if $currentWeather.isMuddy}
        <span class="mud">(Mud)</span>
      {/if}
    </span>
    <span class="divider">|</span>
    <button class="control" onclick={toggleSpeed}>
      {$gameSpeedMultiplier}x
    </button>
    <button class="control" onclick={togglePause}>
      {$gamePaused ? 'Play' : 'Pause'}
    </button>
    <button class="control mute" onclick={toggleMute}>
      {muted ? 'Unmute' : 'Mute'}
    </button>
  </div>
{/if}

<style>
  .time-hud {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.75);
    color: #f0e68c;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 6px 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 100;
    white-space: nowrap;
    user-select: none;
  }

  .segment {
    color: #d0dae4;
  }

  .season {
    color: #90ee90;
  }

  .time {
    color: #f0e68c;
    font-weight: bold;
  }

  .weather {
    color: #87ceeb;
  }

  .mud {
    color: #a0825a;
    font-size: 11px;
  }

  .divider {
    color: #555;
  }

  .control {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #d0dae4;
    font-family: inherit;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
    pointer-events: all;
  }

  .control:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .mute {
    color: #ff9944;
    border-color: rgba(255, 153, 68, 0.3);
  }
</style>

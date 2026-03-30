<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playerPosition, currentZone, fps, devMode, gameTime, timePhase, currentWeather, gameSpeedMultiplier, playerStamina, chickens, eggs, coopDoorOpen, collectedEggs, playerMoney, dailyCrowCount, coopCleanliness, chickCount } from '$lib/stores/gameStore';

  function handleKey(e: KeyboardEvent) {
    if (e.key === '`') {
      devMode.update(v => !v);
    }
  }

  function formatTime(hour: number, minute: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKey);
  });
</script>

{#if $devMode}
  <div class="dev-hud">
    <div class="hud-row">FPS: {$fps}</div>
    <div class="hud-row">X: {$playerPosition.x} Y: {$playerPosition.y}</div>
    <div class="hud-row">Zone: {$currentZone || 'Outdoors'}</div>
    <div class="hud-section">--- Time ---</div>
    <div class="hud-row">{formatTime($gameTime.hour, $gameTime.minute)}</div>
    <div class="hud-row">Day {$gameTime.day} / {$gameTime.season} / Y{$gameTime.year}</div>
    <div class="hud-row">Phase: {$timePhase}</div>
    <div class="hud-row">Speed: {$gameSpeedMultiplier}x</div>
    <div class="hud-section">--- Weather ---</div>
    <div class="hud-row">Condition: {$currentWeather.condition}</div>
    <div class="hud-row">Speed Mod: {$currentWeather.speedMultiplier.toFixed(2)}x</div>
    {#if $currentWeather.isMuddy}
      <div class="hud-row mud">MUDDY (-10%)</div>
    {/if}
    <div class="hud-section">--- Player ---</div>
    <div class="hud-row">Stamina: {Math.round($playerStamina)}/100</div>
    <div class="hud-row">Money: ${$playerMoney}</div>
    <div class="hud-section">--- Coop ---</div>
    <div class="hud-row">Door: {$coopDoorOpen ? 'OPEN' : 'CLOSED'}</div>
    <div class="hud-row">Clean: {Math.round($coopCleanliness)}%</div>
    <div class="hud-row">Eggs: {$eggs.length} in nest | {$collectedEggs.white}w {$collectedEggs.blue}b collected</div>
    <div class="hud-row">Chicks: {$chickCount}</div>
    <div class="hud-row">Crows: {$dailyCrowCount}/8</div>
    <div class="hud-section">--- Chickens ({$chickens.length}) ---</div>
    {#each $chickens.slice(0, 3) as c}
      <div class="hud-row">{c.name}: H{c.hunger} T{c.thirst} J{c.happiness}</div>
    {/each}
    {#if $chickens.length > 3}
      <div class="hud-row hint">...+{$chickens.length - 3} more</div>
    {/if}
    <div class="hud-row hint">Press ` to toggle</div>
  </div>
{/if}

<style>
  .dev-hud {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.75);
    color: #4caf50;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 100;
    line-height: 1.5;
  }

  .hud-row {
    white-space: nowrap;
  }

  .hud-section {
    color: #888;
    font-size: 10px;
    margin-top: 4px;
  }

  .mud {
    color: #a0825a;
  }

  .hint {
    color: #666;
    font-size: 10px;
    margin-top: 4px;
  }
</style>

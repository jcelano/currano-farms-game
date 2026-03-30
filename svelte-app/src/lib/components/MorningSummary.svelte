<script lang="ts">
  import { morningSummary, overnightEvents, collectedEggs, chickens, coopCleanliness, gameReady } from '$lib/stores/gameStore';

  function getHealthWarnings(): string[] {
    const warnings: string[] = [];
    for (const c of $chickens) {
      if (c.health < 20) warnings.push(`${c.name} is in poor health (${c.health})`);
      else if (c.hunger < 10) warnings.push(`${c.name} is very hungry`);
      else if (c.thirst < 10) warnings.push(`${c.name} is very thirsty`);
    }
    return warnings;
  }
</script>

{#if $gameReady && $morningSummary}
  <div class="summary-section">
    <div class="summary-row weather">
      Today: {$morningSummary.weather.charAt(0).toUpperCase() + $morningSummary.weather.slice(1)}
    </div>

    {#if $overnightEvents.length > 0}
      <div class="summary-section-label">Overnight</div>
      {#each $overnightEvents as event}
        <div class="summary-row event">{event}</div>
      {/each}
    {/if}

    {#if getHealthWarnings().length > 0}
      <div class="summary-section-label">Health Alerts</div>
      {#each getHealthWarnings() as warning}
        <div class="summary-row warning">{warning}</div>
      {/each}
    {/if}

    {#if $coopCleanliness < 40}
      <div class="summary-row warning">The coop needs cleaning ({Math.round($coopCleanliness)}%)</div>
    {/if}
  </div>
{/if}

<style>
  .summary-section {
    margin-top: 8px;
    text-align: left;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
  }

  .summary-section-label {
    font-size: 10px;
    color: #888;
    margin-top: 6px;
    text-transform: uppercase;
  }

  .summary-row {
    font-size: 12px;
    margin: 2px 0;
    color: #d0dae4;
  }

  .weather {
    color: #87ceeb;
    font-size: 14px;
  }

  .event {
    color: #f39c12;
  }

  .warning {
    color: #e74c3c;
  }
</style>

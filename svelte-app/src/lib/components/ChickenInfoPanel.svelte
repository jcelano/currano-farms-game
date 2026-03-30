<script lang="ts">
  import { nearbyChicken, gameReady } from '$lib/stores/gameStore';

  function statColor(value: number): string {
    if (value <= 5) return '#e74c3c';
    if (value <= 20) return '#f39c12';
    if (value <= 50) return '#f1c40f';
    return '#27ae60';
  }

  const statLabels = [
    { key: 'hunger', label: 'Hunger', icon: 'H' },
    { key: 'thirst', label: 'Thirst', icon: 'T' },
    { key: 'happiness', label: 'Happy', icon: 'J' },
    { key: 'health', label: 'Health', icon: '+' },
  ] as const;
</script>

{#if $gameReady && $nearbyChicken}
  <div class="chicken-panel">
    <div class="chicken-name">{$nearbyChicken.name}</div>
    <div class="chicken-breed">{$nearbyChicken.breed} ({$nearbyChicken.role})</div>
    <div class="stats">
      {#each statLabels as stat}
        <div class="stat-row">
          <span class="stat-icon">{stat.icon}</span>
          <div class="stat-bar-bg">
            <div
              class="stat-bar-fill"
              style="width: {$nearbyChicken[stat.key]}%; background: {statColor($nearbyChicken[stat.key])}"
            ></div>
          </div>
          <span class="stat-val">{$nearbyChicken[stat.key]}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .chicken-panel {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 100;
    font-family: 'Courier New', monospace;
    color: #d0dae4;
    min-width: 140px;
    animation: slideIn 0.15s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .chicken-name {
    font-size: 13px;
    font-weight: bold;
    color: #f0e68c;
    margin-bottom: 2px;
  }

  .chicken-breed {
    font-size: 9px;
    color: #888;
    margin-bottom: 6px;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat-icon {
    font-size: 9px;
    color: #aaa;
    width: 10px;
  }

  .stat-bar-bg {
    flex: 1;
    height: 6px;
    background: #333;
    border-radius: 3px;
    overflow: hidden;
  }

  .stat-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .stat-val {
    font-size: 9px;
    width: 20px;
    text-align: right;
    color: #aaa;
  }
</style>

<script lang="ts">
  import { nearbyGoat, nearbyHorse, nearbyCat, gameReady } from '$lib/stores/gameStore';

  function statColor(value: number): string {
    if (value <= 5) return '#e74c3c';
    if (value <= 20) return '#f39c12';
    if (value <= 50) return '#f1c40f';
    return '#27ae60';
  }

  function mischiefColor(value: number): string {
    if (value >= 60) return '#e74c3c';
    if (value >= 40) return '#f39c12';
    return '#27ae60';
  }

  interface StatDef { key: string; icon: string; label: string; colorFn?: (v: number) => string; }

  const goatStats: StatDef[] = [
    { key: 'hunger', icon: 'H', label: 'Hunger' },
    { key: 'thirst', icon: 'T', label: 'Thirst' },
    { key: 'happiness', icon: 'J', label: 'Happiness' },
    { key: 'health', icon: '+', label: 'Health' },
    { key: 'mischief', icon: 'M', label: 'Mischief (lower is better)', colorFn: mischiefColor },
  ];

  const horseStats: StatDef[] = [
    { key: 'hunger', icon: 'H', label: 'Hunger' },
    { key: 'thirst', icon: 'T', label: 'Thirst' },
    { key: 'happiness', icon: 'J', label: 'Happiness' },
    { key: 'health', icon: '+', label: 'Health' },
    { key: 'coat', icon: 'C', label: 'Coat condition' },
    { key: 'hoofCondition', icon: 'Hf', label: 'Hoof condition' },
    { key: 'training', icon: 'Tr', label: 'Training level' },
  ];

  const catStats: StatDef[] = [
    { key: 'hunger', icon: 'H', label: 'Hunger' },
    { key: 'thirst', icon: 'T', label: 'Thirst' },
    { key: 'happiness', icon: 'J', label: 'Happiness' },
    { key: 'health', icon: '+', label: 'Health' },
    { key: 'attention', icon: 'A', label: 'Attention (petting)' },
    { key: 'fleaCollar', icon: 'FC', label: 'Flea collar effectiveness' },
  ];
</script>

{#if $gameReady}
  {#if $nearbyGoat}
    <div class="info-panel">
      <div class="animal-name">{$nearbyGoat.name}</div>
      <div class="animal-breed">Nigerian Dwarf ({$nearbyGoat.personality}){$nearbyGoat.escaped ? ' - ESCAPED!' : ''}</div>
      <div class="stats">
        {#each goatStats as stat}
          {@const val = $nearbyGoat[stat.key as keyof typeof $nearbyGoat] as number}
          <div class="stat-row">
            <span class="stat-label" class:mischief-label={stat.key === 'mischief'} title={stat.label}>{stat.icon}</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{val}%;background:{(stat.colorFn || statColor)(val)}"></div></div>
            <span class="stat-val">{val}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if $nearbyHorse}
    <div class="info-panel horse-panel">
      <div class="animal-name">{$nearbyHorse.name}</div>
      <div class="animal-breed">{$nearbyHorse.breed}</div>
      <div class="stats">
        {#each horseStats as stat}
          {@const val = $nearbyHorse[stat.key as keyof typeof $nearbyHorse] as number}
          <div class="stat-row">
            <span class="stat-label" title={stat.label}>{stat.icon}</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{val}%;background:{statColor(val)}"></div></div>
            <span class="stat-val">{val}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if $nearbyCat}
    <div class="info-panel cat-panel">
      <div class="animal-name">{$nearbyCat.name}</div>
      <div class="animal-breed">{$nearbyCat.pattern} cat</div>
      <div class="stats">
        {#each catStats as stat}
          {@const val = $nearbyCat[stat.key as keyof typeof $nearbyCat] as number}
          <div class="stat-row">
            <span class="stat-label" title={stat.label}>{stat.icon}</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{val}%;background:{statColor(val)}"></div></div>
            <span class="stat-val">{val}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/if}

<style>
  .info-panel {
    position: absolute;
    bottom: 60px;
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

  .horse-panel { bottom: 80px; }
  .cat-panel { bottom: 100px; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animal-name { font-size: 13px; font-weight: bold; color: #f0e68c; margin-bottom: 2px; }
  .animal-breed { font-size: 9px; color: #888; margin-bottom: 6px; }
  .stats { display: flex; flex-direction: column; gap: 3px; }
  .stat-row { display: flex; align-items: center; gap: 4px; }
  .stat-label { font-size: 9px; color: #aaa; width: 14px; cursor: help; }
  .mischief-label { color: #ff8800; }
  .stat-bar-bg { flex: 1; height: 6px; background: #333; border-radius: 3px; overflow: hidden; }
  .stat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .stat-val { font-size: 9px; width: 20px; text-align: right; color: #aaa; }
</style>

<script lang="ts">
  import { visitedAnimals, journalOpen, gameReady } from '$lib/stores/gameStore';

  function statColor(value: number): string {
    if (value <= 5) return '#e74c3c';
    if (value <= 20) return '#f39c12';
    if (value <= 50) return '#f1c40f';
    return '#27ae60';
  }

  function toggle() {
    journalOpen.update(v => !v);
  }

  function timeSince(ts: number): string {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  }

  const statNames: Record<string, string> = {
    hunger: 'H', thirst: 'T', happiness: 'J', health: '+',
    mischief: 'M', coat: 'C', hoofCondition: 'Hf', training: 'Tr',
    attention: 'A', fleaCollar: 'FC', cleanliness: 'Cl',
  };

  const statTooltips: Record<string, string> = {
    hunger: 'Hunger', thirst: 'Thirst', happiness: 'Happiness', health: 'Health',
    mischief: 'Mischief', coat: 'Coat', hoofCondition: 'Hoof condition', training: 'Training',
    attention: 'Attention', fleaCollar: 'Flea collar', cleanliness: 'Cleanliness',
  };

  const displayStats = ['hunger', 'thirst', 'happiness', 'health'];
</script>

{#if $gameReady}
  <button class="journal-toggle" onclick={toggle} title="Animal Journal">
    {$journalOpen ? '✕' : '🐾'}
  </button>

  {#if $journalOpen}
    <div class="journal-panel">
      <div class="journal-header">Animal Journal</div>
      <div class="journal-body">
        {#if $visitedAnimals.length === 0}
          <div class="journal-empty">Walk near animals to record their stats.</div>
        {:else}
          {#each $visitedAnimals as animal (animal.type + '-' + animal.id)}
            <div class="animal-card">
              <div class="card-header">
                <span class="card-name">{animal.name}</span>
                <span class="card-type">{animal.type}</span>
                <span class="card-time">{timeSince(animal.lastSeen)}</span>
              </div>
              <div class="card-stats">
                {#each Object.entries(animal.stats) as [key, val]}
                  {#if typeof val === 'number' && statNames[key]}
                    <div class="mini-stat" title={statTooltips[key] || key}>
                      <span class="mini-label">{statNames[key]}</span>
                      <span class="mini-val" style="color: {statColor(val as number)}">{val}</span>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .journal-toggle {
    position: absolute;
    top: 8px;
    right: 200px;
    z-index: 101;
    background: rgba(0, 0, 0, 0.7);
    color: #d0dae4;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 14px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
  }

  .journal-toggle:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  @media (max-width: 600px) {
    .journal-toggle {
      top: auto;
      bottom: 140px;
      right: 50px;
      min-width: 36px;
      min-height: 36px;
    }
    .journal-panel {
      top: auto;
      bottom: 180px;
      right: 8px;
      width: min(260px, 80vw);
      max-height: 200px;
    }
  }

  .journal-panel {
    position: absolute;
    top: 40px;
    right: 160px;
    z-index: 101;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    width: 280px;
    max-height: 350px;
    font-family: 'Courier New', monospace;
    animation: slideIn 0.15s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .journal-header {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: bold;
    color: #f0e68c;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .journal-body {
    overflow-y: auto;
    max-height: 310px;
    padding: 4px;
  }

  .journal-empty {
    padding: 12px;
    color: #666;
    font-size: 10px;
    text-align: center;
  }

  .animal-card {
    padding: 6px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
  }

  .card-name {
    font-size: 11px;
    font-weight: bold;
    color: #f0e68c;
  }

  .card-type {
    font-size: 8px;
    color: #888;
    text-transform: uppercase;
  }

  .card-time {
    font-size: 8px;
    color: #555;
    margin-left: auto;
  }

  .card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .mini-stat {
    display: flex;
    gap: 2px;
    align-items: center;
    cursor: help;
  }

  .mini-label {
    font-size: 8px;
    color: #777;
  }

  .mini-val {
    font-size: 9px;
    font-weight: bold;
  }
</style>

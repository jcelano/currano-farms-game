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
</script>

{#if $gameReady}
  {#if $nearbyGoat}
    <div class="info-panel">
      <div class="animal-name">{$nearbyGoat.name}</div>
      <div class="animal-breed">Nigerian Dwarf ({$nearbyGoat.personality}){$nearbyGoat.escaped ? ' - ESCAPED!' : ''}</div>
      <div class="stats">
        <div class="stat-row"><span class="stat-label">H</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyGoat.hunger}%;background:{statColor($nearbyGoat.hunger)}"></div></div><span class="stat-val">{$nearbyGoat.hunger}</span></div>
        <div class="stat-row"><span class="stat-label">T</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyGoat.thirst}%;background:{statColor($nearbyGoat.thirst)}"></div></div><span class="stat-val">{$nearbyGoat.thirst}</span></div>
        <div class="stat-row"><span class="stat-label">J</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyGoat.happiness}%;background:{statColor($nearbyGoat.happiness)}"></div></div><span class="stat-val">{$nearbyGoat.happiness}</span></div>
        <div class="stat-row"><span class="stat-label">+</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyGoat.health}%;background:{statColor($nearbyGoat.health)}"></div></div><span class="stat-val">{$nearbyGoat.health}</span></div>
        <div class="stat-row"><span class="stat-label mischief-label">M</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyGoat.mischief}%;background:{mischiefColor($nearbyGoat.mischief)}"></div></div><span class="stat-val">{$nearbyGoat.mischief}</span></div>
      </div>
    </div>
  {/if}

  {#if $nearbyHorse}
    <div class="info-panel horse-panel">
      <div class="animal-name">{$nearbyHorse.name}</div>
      <div class="animal-breed">{$nearbyHorse.breed}</div>
      <div class="stats">
        <div class="stat-row"><span class="stat-label">H</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.hunger}%;background:{statColor($nearbyHorse.hunger)}"></div></div><span class="stat-val">{$nearbyHorse.hunger}</span></div>
        <div class="stat-row"><span class="stat-label">T</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.thirst}%;background:{statColor($nearbyHorse.thirst)}"></div></div><span class="stat-val">{$nearbyHorse.thirst}</span></div>
        <div class="stat-row"><span class="stat-label">J</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.happiness}%;background:{statColor($nearbyHorse.happiness)}"></div></div><span class="stat-val">{$nearbyHorse.happiness}</span></div>
        <div class="stat-row"><span class="stat-label">+</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.health}%;background:{statColor($nearbyHorse.health)}"></div></div><span class="stat-val">{$nearbyHorse.health}</span></div>
        <div class="stat-row"><span class="stat-label">C</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.coat}%;background:{statColor($nearbyHorse.coat)}"></div></div><span class="stat-val">{$nearbyHorse.coat}</span></div>
        <div class="stat-row"><span class="stat-label">Hf</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.hoofCondition}%;background:{statColor($nearbyHorse.hoofCondition)}"></div></div><span class="stat-val">{$nearbyHorse.hoofCondition}</span></div>
        <div class="stat-row"><span class="stat-label">Tr</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyHorse.training}%;background:{statColor($nearbyHorse.training)}"></div></div><span class="stat-val">{$nearbyHorse.training}</span></div>
      </div>
    </div>
  {/if}

  {#if $nearbyCat}
    <div class="info-panel cat-panel">
      <div class="animal-name">{$nearbyCat.name}</div>
      <div class="animal-breed">{$nearbyCat.pattern} cat</div>
      <div class="stats">
        <div class="stat-row"><span class="stat-label">H</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.hunger}%;background:{statColor($nearbyCat.hunger)}"></div></div><span class="stat-val">{$nearbyCat.hunger}</span></div>
        <div class="stat-row"><span class="stat-label">T</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.thirst}%;background:{statColor($nearbyCat.thirst)}"></div></div><span class="stat-val">{$nearbyCat.thirst}</span></div>
        <div class="stat-row"><span class="stat-label">J</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.happiness}%;background:{statColor($nearbyCat.happiness)}"></div></div><span class="stat-val">{$nearbyCat.happiness}</span></div>
        <div class="stat-row"><span class="stat-label">+</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.health}%;background:{statColor($nearbyCat.health)}"></div></div><span class="stat-val">{$nearbyCat.health}</span></div>
        <div class="stat-row"><span class="stat-label">A</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.attention}%;background:{statColor($nearbyCat.attention)}"></div></div><span class="stat-val">{$nearbyCat.attention}</span></div>
        <div class="stat-row"><span class="stat-label">FC</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:{$nearbyCat.fleaCollar}%;background:{statColor($nearbyCat.fleaCollar)}"></div></div><span class="stat-val">{$nearbyCat.fleaCollar}</span></div>
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
  .stat-label { font-size: 9px; color: #aaa; width: 14px; }
  .mischief-label { color: #ff8800; }
  .stat-bar-bg { flex: 1; height: 6px; background: #333; border-radius: 3px; overflow: hidden; }
  .stat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .stat-val { font-size: 9px; width: 20px; text-align: right; color: #aaa; }
</style>

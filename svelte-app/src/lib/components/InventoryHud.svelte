<script lang="ts">
  import { playerInventory, gameReady, MAX_INVENTORY } from '$lib/stores/gameStore';
</script>

{#if $gameReady && $playerInventory.length > 0}
  <div class="inventory-hud">
    <div class="inv-label">Carrying:</div>
    <div class="inv-slots">
      {#each $playerInventory as item (item.id)}
        <div class="inv-slot" title={item.label}>
          <span class="inv-icon">{
            item.id === 'water-bucket' ? '🪣' :
            item.id === 'brush' ? '🪮' :
            item.id === 'pitchfork' ? '🔱' :
            '📦'
          }</span>
          <span class="inv-name">{item.label}</span>
        </div>
      {/each}
      {#each Array(MAX_INVENTORY - $playerInventory.length) as _}
        <div class="inv-slot empty"></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .inventory-hud {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px 10px;
    font-family: 'Courier New', monospace;
    color: #d0dae4;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.2s ease-out;
    pointer-events: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(5px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .inv-label {
    font-size: 9px;
    color: #888;
  }

  .inv-slots {
    display: flex;
    gap: 4px;
  }

  .inv-slot {
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    padding: 2px 6px;
    min-width: 24px;
    min-height: 20px;
  }

  .inv-slot.empty {
    opacity: 0.2;
  }

  .inv-icon {
    font-size: 12px;
  }

  .inv-name {
    font-size: 9px;
    color: #f0e68c;
  }
</style>

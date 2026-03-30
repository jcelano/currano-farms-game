<script lang="ts">
  import { collectedEggs, playerMoney, gameReady } from '$lib/stores/gameStore';
</script>

{#if $gameReady}
  <div class="egg-counter">
    <span class="money">${$playerMoney}</span>
    <span class="divider">|</span>
    <span class="eggs">Eggs: {$collectedEggs.white}w {$collectedEggs.blue}b</span>
  </div>
{/if}

<style>
  .egg-counter {
    position: absolute;
    bottom: 46px;
    right: 16px;
    background: rgba(0, 0, 0, 0.75);
    padding: 4px 10px;
    border-radius: 4px;
    z-index: 100;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #d0dae4;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .money {
    color: #4caf50;
    font-weight: bold;
  }

  .divider {
    color: #555;
  }

  .eggs {
    color: #f0e68c;
  }
</style>

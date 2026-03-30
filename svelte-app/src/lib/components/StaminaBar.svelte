<script lang="ts">
  import { playerStamina, gameReady } from '$lib/stores/gameStore';
  import { CONFIG } from '$lib/game/config';

  function getColor(value: number): string {
    if (value <= 0) return '#666';
    if (value <= 20) return '#e74c3c';
    if (value <= 50) return '#f39c12';
    return '#27ae60';
  }
</script>

{#if $gameReady}
  <div class="stamina-container">
    <div class="stamina-label">Stamina</div>
    <div class="stamina-bar-bg">
      <div
        class="stamina-bar-fill"
        style="width: {($playerStamina / CONFIG.stamina.max) * 100}%; background: {getColor($playerStamina)}"
      ></div>
    </div>
    <div class="stamina-value">{Math.round($playerStamina)}</div>
  </div>
{/if}

<style>
  .stamina-container {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.75);
    padding: 6px 12px;
    border-radius: 6px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #d0dae4;
  }

  .stamina-label {
    color: #888;
  }

  .stamina-bar-bg {
    width: 100px;
    height: 10px;
    background: #333;
    border-radius: 5px;
    overflow: hidden;
  }

  .stamina-bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s ease, background 0.3s ease;
  }

  .stamina-value {
    width: 24px;
    text-align: right;
    color: #f0e68c;
  }
</style>

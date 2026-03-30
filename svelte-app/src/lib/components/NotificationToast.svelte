<script lang="ts">
  import { notifications, gameReady } from '$lib/stores/gameStore';

  const categoryColors: Record<string, string> = {
    info: '#3498db',
    warning: '#f39c12',
    danger: '#e74c3c',
    positive: '#27ae60',
  };
</script>

{#if $gameReady && $notifications.length > 0}
  <div class="toast-container">
    {#each $notifications.slice(-3) as notif (notif.id)}
      <div
        class="toast"
        style="border-left-color: {categoryColors[notif.category] || '#888'}"
      >
        {notif.message}
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: absolute;
    top: 50px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 110;
    pointer-events: none;
  }

  .toast {
    background: rgba(0, 0, 0, 0.85);
    color: #d0dae4;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 8px 14px;
    border-radius: 4px;
    border-left: 3px solid #888;
    max-width: 300px;
    animation: slideIn 0.25s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>

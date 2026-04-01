<script lang="ts">
  import { notificationHistory, notificationLogOpen, gameReady } from '$lib/stores/gameStore';

  const categoryColors: Record<string, string> = {
    info: '#3498db',
    warning: '#f39c12',
    danger: '#e74c3c',
    positive: '#27ae60',
  };

  function formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function toggle() {
    notificationLogOpen.update(v => !v);
  }
</script>

{#if $gameReady}
  <button class="log-toggle" onclick={toggle} title="Event History">
    {$notificationLogOpen ? '✕' : '📋'}
  </button>

  {#if $notificationLogOpen}
    <div class="log-panel">
      <div class="log-header">Event History</div>
      <div class="log-body">
        {#if $notificationHistory.length === 0}
          <div class="log-empty">No events yet.</div>
        {:else}
          {#each [...$notificationHistory].reverse() as notif (notif.id)}
            <div class="log-entry" style="border-left-color: {categoryColors[notif.category] || '#888'}">
              <span class="log-time">{formatTime(notif.timestamp)}</span>
              <span class="log-msg">{notif.message}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .log-toggle {
    position: absolute;
    top: 8px;
    right: 160px;
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

  .log-toggle:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  @media (max-width: 600px) {
    .log-toggle {
      top: auto;
      bottom: 140px;
      right: 8px;
      min-width: 36px;
      min-height: 36px;
    }
    .log-panel {
      top: auto;
      bottom: 180px;
      right: 8px;
      width: min(260px, 80vw);
      max-height: 200px;
    }
  }

  .log-panel {
    position: absolute;
    top: 40px;
    right: 160px;
    z-index: 101;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    width: 280px;
    max-height: 300px;
    font-family: 'Courier New', monospace;
    animation: slideIn 0.15s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .log-header {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: bold;
    color: #f0e68c;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .log-body {
    overflow-y: auto;
    max-height: 260px;
    padding: 4px;
  }

  .log-empty {
    padding: 12px;
    color: #666;
    font-size: 10px;
    text-align: center;
  }

  .log-entry {
    display: flex;
    gap: 6px;
    padding: 3px 6px;
    border-left: 2px solid #888;
    margin-bottom: 2px;
    font-size: 10px;
    color: #d0dae4;
  }

  .log-time {
    color: #666;
    flex-shrink: 0;
    font-size: 9px;
  }

  .log-msg {
    flex: 1;
  }
</style>

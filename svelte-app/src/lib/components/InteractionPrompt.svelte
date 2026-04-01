<script lang="ts">
  import { interactionPrompt, gameReady } from '$lib/stores/gameStore';

  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
</script>

{#if $gameReady && $interactionPrompt}
  <div class="prompt" class:unavailable={!$interactionPrompt.available}>
    <span class="key">{isMobile ? '[Tap]' : '[Space]'}</span>
    <span class="label">{$interactionPrompt.label}</span>
    {#if $interactionPrompt.cost > 0}
      <span class="cost">(-{$interactionPrompt.cost} stamina)</span>
    {/if}
    {#if $interactionPrompt.warning}
      <span class="warning">{$interactionPrompt.warning}</span>
    {/if}
  </div>
{/if}

<style>
  .prompt {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #d0dae4;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    animation: fadeIn 0.15s ease-out;
  }

  @media (max-width: 600px) {
    .prompt {
      bottom: 120px;
      font-size: 11px;
      padding: 6px 12px;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(5px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .key {
    color: #f0e68c;
    font-weight: bold;
  }

  .cost {
    color: #ff9944;
    font-size: 11px;
  }

  .unavailable {
    border-color: #e74c3c44;
  }

  .warning {
    color: #e74c3c;
    font-size: 11px;
  }
</style>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sleepActive, morningSummary, overnightEvents, gameEvents, gameReady } from '$lib/stores/gameStore';
  import MorningSummary from './MorningSummary.svelte';

  let phase: 'hidden' | 'fading-in' | 'sleeping' | 'summary' | 'fading-out' = $state('hidden');
  let opacity = $state(0);
  let animFrame = 0;

  function handleSleepPrompt() {
    if (phase !== 'hidden') return;
    startSleep();
  }

  function startSleep() {
    phase = 'fading-in';
    sleepActive.set(true);
    fadeIn();
  }

  function fadeIn() {
    if (opacity < 1) {
      opacity = Math.min(1, opacity + 0.03);
      animFrame = requestAnimationFrame(fadeIn);
    } else {
      phase = 'sleeping';
      // Wait a beat then advance time and show summary
      setTimeout(() => {
        gameEvents.emit('do-sleep'); // TimeSystem listens for this to skip to morning
        phase = 'summary';
      }, 1200);
    }
  }

  function dismiss() {
    if (phase !== 'summary') return;
    phase = 'fading-out';
    morningSummary.set(null);
    overnightEvents.set([]);
    fadeOut();
  }

  function fadeOut() {
    if (opacity > 0) {
      opacity = Math.max(0, opacity - 0.04);
      animFrame = requestAnimationFrame(fadeOut);
    } else {
      phase = 'hidden';
      sleepActive.set(false);
    }
  }

  let unsub: (() => void) | undefined;

  onMount(() => {
    unsub = gameEvents.on('sleep-prompt', handleSleepPrompt);
  });

  onDestroy(() => {
    unsub?.();
    if (animFrame) cancelAnimationFrame(animFrame);
  });
</script>

{#if $gameReady && phase !== 'hidden'}
  <div class="sleep-overlay" style="opacity: {opacity}">
    {#if phase === 'sleeping'}
      <div class="sleep-text">Zzz...</div>
    {/if}

    {#if phase === 'summary'}
      <div class="summary">
        <h2>Good Morning!</h2>
        {#if $morningSummary}
          <p>Day {$morningSummary.day} - {$morningSummary.season.charAt(0).toUpperCase() + $morningSummary.season.slice(1)}</p>
        {/if}
        <MorningSummary />
        <button onclick={dismiss}>Start the Day</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .sleep-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: #0a0a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .sleep-text {
    color: #8888cc;
    font-family: 'Courier New', monospace;
    font-size: 3rem;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .summary {
    text-align: center;
    color: #f0e68c;
    font-family: 'Courier New', monospace;
  }

  .summary h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #ffd700;
  }

  .summary p {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #d0dae4;
  }

  .summary .weather {
    color: #87ceeb;
  }

  .summary button {
    margin-top: 1.5rem;
    padding: 0.8rem 2rem;
    background: #4caf50;
    border: none;
    color: white;
    font-size: 1.1rem;
    font-family: inherit;
    border-radius: 6px;
    cursor: pointer;
  }

  .summary button:hover {
    background: #388e3c;
  }
</style>

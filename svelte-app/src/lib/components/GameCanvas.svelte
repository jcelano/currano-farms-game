<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameReady } from '$lib/stores/gameStore';

  let container: HTMLDivElement;
  let game: import('phaser').Game | null = null;

  onMount(async () => {
    const { createGame } = await import('$lib/game/main');
    game = createGame(container);
  });

  onDestroy(() => {
    if (game) {
      game.destroy(true);
      game = null;
      gameReady.set(false);
    }
  });
</script>

<div class="game-wrapper">
  <div class="game-container" bind:this={container}></div>
  {#if !$gameReady}
    <div class="loading">Loading farm...</div>
  {/if}
</div>

<style>
  .game-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a2e;
  }

  .game-container {
    width: 100%;
    height: 100%;
  }

  .game-container :global(canvas) {
    display: block;
    image-rendering: pixelated;
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #d0dae4;
    font-family: monospace;
    font-size: 1.2rem;
  }
</style>

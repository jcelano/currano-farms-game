<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { saveSystem, type SaveSlotMeta } from '$lib/game/systems/SaveSystem';
  import SaveSlotPicker from '$lib/components/SaveSlotPicker.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import { currentSaveSlot } from '$lib/stores/gameStore';

  let view = $state<'menu' | 'load' | 'settings'>('menu');
  let hasAutosave = $state(false);

  onMount(async () => {
    const slots = await saveSystem.getSlotInfo();
    hasAutosave = slots[0] !== null;
  });

  function newGame() {
    currentSaveSlot.set(0);
    goto('/play');
  }

  function continueGame() {
    currentSaveSlot.set(0);
    goto('/play?load=0');
  }

  async function loadSlot(slot: number) {
    currentSaveSlot.set(slot);
    goto(`/play?load=${slot}`);
  }
</script>

<svelte:head>
  <title>Currano Farms</title>
</svelte:head>

<main>
  <div class="title-container">
    {#if view === 'menu'}
      <h1>Currano Farms</h1>
      <p class="tagline">A cozy New England farm sim</p>
      <div class="menu-buttons">
        <button class="menu-btn primary" onclick={newGame}>New Game</button>
        <button class="menu-btn" onclick={continueGame} disabled={!hasAutosave}>
          Continue
        </button>
        <button class="menu-btn" onclick={() => view = 'load'}>Load Game</button>
        <button class="menu-btn" onclick={() => view = 'settings'}>Settings</button>
      </div>
    {:else if view === 'load'}
      <SaveSlotPicker mode="load" onSelect={loadSlot} onClose={() => view = 'menu'} />
    {:else if view === 'settings'}
      <SettingsPanel onClose={() => view = 'menu'} />
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    background: linear-gradient(135deg, #1a3d0a 0%, #2d5016 40%, #1a1a2e 100%);
    color: #d0dae4;
    font-family: 'Courier New', monospace;
  }

  .title-container {
    text-align: center;
    padding: 2rem;
    min-width: 320px;
  }

  h1 {
    font-size: 3rem;
    color: #f0e68c;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
    margin-bottom: 0.3rem;
  }

  .tagline {
    font-size: 1rem;
    color: #90ee90;
    margin-bottom: 2.5rem;
    opacity: 0.8;
  }

  .menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .menu-btn {
    width: 220px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #d0dae4;
    font-family: inherit;
    font-size: 1.1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .menu-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .menu-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .menu-btn.primary {
    background: rgba(76, 175, 80, 0.3);
    border-color: #4caf50;
    color: #4caf50;
    font-weight: bold;
  }

  .menu-btn.primary:hover {
    background: rgba(76, 175, 80, 0.5);
  }
</style>

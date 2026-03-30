<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { pauseMenuOpen, gamePaused, currentSaveSlot, gameReady } from '$lib/stores/gameStore';
  import { saveSystem } from '$lib/game/systems/SaveSystem';
  import SaveSlotPicker from './SaveSlotPicker.svelte';
  import SettingsPanel from './SettingsPanel.svelte';

  let view = $state<'menu' | 'save' | 'settings'>('menu');
  let saveConfirm = $state('');

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (view !== 'menu') {
        view = 'menu';
      } else {
        togglePause();
      }
    }
  }

  function togglePause() {
    pauseMenuOpen.update(v => {
      const newVal = !v;
      gamePaused.set(newVal);
      return newVal;
    });
    view = 'menu';
    saveConfirm = '';
  }

  async function saveToSlot(slot: number) {
    currentSaveSlot.set(slot);
    await saveSystem.save(slot);
    saveConfirm = `Saved to Slot ${slot + 1}!`;
    setTimeout(() => { saveConfirm = ''; view = 'menu'; }, 1500);
  }

  function quitToTitle() {
    pauseMenuOpen.set(false);
    gamePaused.set(false);
    goto('/title');
  }

  onMount(() => window.addEventListener('keydown', handleKey));
  onDestroy(() => window.removeEventListener('keydown', handleKey));
</script>

{#if $gameReady && $pauseMenuOpen}
  <div class="pause-overlay">
    <div class="pause-card">
      {#if view === 'menu'}
        <h2>Paused</h2>
        <div class="menu-buttons">
          <button onclick={togglePause}>Resume</button>
          <button onclick={() => view = 'save'}>Save Game</button>
          <button onclick={() => view = 'settings'}>Settings</button>
          <button class="quit" onclick={quitToTitle}>Quit to Title</button>
        </div>
      {:else if view === 'save'}
        {#if saveConfirm}
          <div class="confirm">{saveConfirm}</div>
        {:else}
          <SaveSlotPicker mode="save" onSelect={saveToSlot} onClose={() => view = 'menu'} />
        {/if}
      {:else if view === 'settings'}
        <SettingsPanel onClose={() => view = 'menu'} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .pause-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100dvh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
  }

  .pause-card {
    background: #0d1117;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 2rem;
    min-width: 280px;
    font-family: 'Courier New', monospace;
    color: #d0dae4;
  }

  h2 {
    text-align: center;
    color: #f0e68c;
    margin-bottom: 1.5rem;
  }

  .menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .menu-buttons button {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #d0dae4;
    font-family: inherit;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .menu-buttons button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .quit {
    color: #e74c3c !important;
    border-color: rgba(231, 76, 60, 0.3) !important;
  }

  .confirm {
    text-align: center;
    color: #4caf50;
    font-size: 1.2rem;
    padding: 2rem;
  }
</style>

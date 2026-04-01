<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import GameCanvas from '$lib/components/GameCanvas.svelte';
  import DevHud from '$lib/components/DevHud.svelte';
  import TimeHud from '$lib/components/TimeHud.svelte';
  import SleepOverlay from '$lib/components/SleepOverlay.svelte';
  import InteractionPrompt from '$lib/components/InteractionPrompt.svelte';
  import StaminaBar from '$lib/components/StaminaBar.svelte';
  import ChickenInfoPanel from '$lib/components/ChickenInfoPanel.svelte';
  import AnimalInfoPanel from '$lib/components/AnimalInfoPanel.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import NotificationLog from '$lib/components/NotificationLog.svelte';
  import EggCounter from '$lib/components/EggCounter.svelte';
  import PauseMenu from '$lib/components/PauseMenu.svelte';
  import VirtualJoystick from '$lib/components/VirtualJoystick.svelte';
  import Minimap from '$lib/components/Minimap.svelte';
  import AnimalJournal from '$lib/components/AnimalJournal.svelte';
  import HelpPanel from '$lib/components/HelpPanel.svelte';
  import InventoryHud from '$lib/components/InventoryHud.svelte';
  import { saveSystem } from '$lib/game/systems/SaveSystem';
  import { addNotification } from '$lib/stores/gameStore';
  import { VERSION_LABEL } from '$lib/version';

  onMount(async () => {
    // Check if we should load a save
    const loadSlot = page.url.searchParams.get('load');
    if (loadSlot !== null) {
      const slot = parseInt(loadSlot, 10);
      const loaded = await saveSystem.load(slot);
      if (loaded) {
        addNotification(`Loaded save from slot ${slot + 1}`, 'info');
      }
    }
  });
</script>

<svelte:head>
  <title>Currano Farms</title>
</svelte:head>

<div class="play-page">
  <GameCanvas />
  <TimeHud />
  <Minimap />
  <NotificationLog />
  <AnimalJournal />
  <HelpPanel />
  <EggCounter />
  <StaminaBar />
  <InteractionPrompt />
  <InventoryHud />
  <ChickenInfoPanel />
  <AnimalInfoPanel />
  <NotificationToast />
  <DevHud />
  <PauseMenu />
  <VirtualJoystick />
  <SleepOverlay />
  <span class="version-badge">{VERSION_LABEL}</span>
</div>

<style>
  .play-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
    background: #1a1a2e;
  }

  .version-badge {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-family: 'Courier New', monospace;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.18);
    pointer-events: none;
    z-index: 5;
    letter-spacing: 0.03em;
  }
</style>

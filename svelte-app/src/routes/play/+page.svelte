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
  import EggCounter from '$lib/components/EggCounter.svelte';
  import PauseMenu from '$lib/components/PauseMenu.svelte';
  import VirtualJoystick from '$lib/components/VirtualJoystick.svelte';
  import { saveSystem } from '$lib/game/systems/SaveSystem';
  import { addNotification } from '$lib/stores/gameStore';

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
  <EggCounter />
  <StaminaBar />
  <InteractionPrompt />
  <ChickenInfoPanel />
  <AnimalInfoPanel />
  <NotificationToast />
  <DevHud />
  <PauseMenu />
  <VirtualJoystick />
  <SleepOverlay />
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
</style>

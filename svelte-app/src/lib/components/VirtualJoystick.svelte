<script lang="ts">
  import { onMount } from 'svelte';
  import { joystickDirection, joystickInteract, gameReady } from '$lib/stores/gameStore';

  let isTouchDevice = $state(false);
  let joystickActive = $state(false);
  let knobX = $state(0);
  let knobY = $state(0);
  let centerX = 0;
  let centerY = 0;
  const radius = 50;

  onMount(() => {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  function handleStart(e: TouchEvent) {
    e.preventDefault();
    joystickActive = true;
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).closest('.joystick-zone')!.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    updateKnob(touch.clientX, touch.clientY);
  }

  function handleMove(e: TouchEvent) {
    if (!joystickActive) return;
    e.preventDefault();
    updateKnob(e.touches[0].clientX, e.touches[0].clientY);
  }

  function handleEnd() {
    joystickActive = false;
    knobX = 0;
    knobY = 0;
    joystickDirection.set({ x: 0, y: 0 });
  }

  function updateKnob(touchX: number, touchY: number) {
    let dx = touchX - centerX;
    let dy = touchY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }

    knobX = dx;
    knobY = dy;

    // Normalize to -1..1
    joystickDirection.set({
      x: dx / radius,
      y: dy / radius,
    });
  }

  function handleInteract() {
    joystickInteract.set(true);
    setTimeout(() => joystickInteract.set(false), 100);
  }
</script>

{#if $gameReady && isTouchDevice}
  <div class="joystick-zone"
    ontouchstart={handleStart}
    ontouchmove={handleMove}
    ontouchend={handleEnd}
  >
    <div class="joystick-base">
      <div class="joystick-knob" style="transform: translate({knobX}px, {knobY}px)"></div>
    </div>
  </div>

  <button class="interact-btn" ontouchstart={handleInteract}>
    Action
  </button>
{/if}

<style>
  .joystick-zone {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 130px;
    height: 130px;
    z-index: 150;
    touch-action: none;
  }

  .joystick-base {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    position: absolute;
    bottom: 15px;
    left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .joystick-knob {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.4);
    transition: transform 0.05s;
  }

  .interact-btn {
    position: fixed;
    bottom: 40px;
    right: 20px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(76, 175, 80, 0.3);
    border: 3px solid rgba(76, 175, 80, 0.6);
    color: #4caf50;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    font-weight: bold;
    z-index: 150;
    touch-action: none;
    cursor: pointer;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { playerPosition, gameReady, currentZone } from '$lib/stores/gameStore';
  import { ZONE_DEFS } from '$lib/game/systems/ZoneManager';

  const MAP_W = 80;
  const MAP_H = 60;
  const MINI_W = 140;
  const MINI_H = Math.round(MINI_W * (MAP_H / MAP_W));
  const TILE_SIZE = 32;

  let canvas: HTMLCanvasElement | undefined = $state();

  function drawBase(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, MINI_W, MINI_H);

    for (const zone of ZONE_DEFS) {
      const x = (zone.x / MAP_W) * MINI_W;
      const y = (zone.y / MAP_H) * MINI_H;
      const w = (zone.width / MAP_W) * MINI_W;
      const h = (zone.height / MAP_H) * MINI_H;

      ctx.fillStyle = '#' + zone.color.toString(16).padStart(6, '0');
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, w, h);
    }
  }

  $effect(() => {
    if (!canvas || !$gameReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Access reactive values to trigger re-render
    const px = $playerPosition.x;
    const py = $playerPosition.y;
    const _zone = $currentZone; // trigger on zone change too

    drawBase(ctx);

    // Player dot
    const dotX = (px / (MAP_W * TILE_SIZE)) * MINI_W;
    const dotY = (py / (MAP_H * TILE_SIZE)) * MINI_H;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f0e68c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.stroke();
  });
</script>

{#if $gameReady}
  <div class="minimap-container">
    <canvas bind:this={canvas} width={MINI_W} height={MINI_H}></canvas>
    <div class="zone-label">{$currentZone || 'Outdoors'}</div>
  </div>
{/if}

<style>
  .minimap-container {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 100;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.6);
    pointer-events: none;
  }

  canvas {
    display: block;
  }

  .zone-label {
    text-align: center;
    font-family: 'Courier New', monospace;
    font-size: 9px;
    color: #d0dae4;
    background: rgba(0, 0, 0, 0.7);
    padding: 2px 4px;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { saveSystem, type SaveSlotMeta } from '$lib/game/systems/SaveSystem';

  let { mode = 'load', onSelect, onClose }: {
    mode?: 'load' | 'save';
    onSelect: (slot: number) => void;
    onClose: () => void;
  } = $props();

  let slots = $state<(SaveSlotMeta | null)[]>([null, null, null]);

  onMount(async () => {
    slots = await saveSystem.getSlotInfo();
  });

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async function handleDelete(slot: number, e: Event) {
    e.stopPropagation();
    await saveSystem.deleteSave(slot);
    slots = await saveSystem.getSlotInfo();
  }
</script>

<div class="slot-picker">
  <h3>{mode === 'save' ? 'Save Game' : 'Load Game'}</h3>
  <div class="slots">
    {#each slots as slot, i}
      <button class="slot" onclick={() => onSelect(i)} disabled={mode === 'load' && !slot}>
        <div class="slot-header">Slot {i + 1}{i === 0 ? ' (Auto)' : ''}</div>
        {#if slot}
          <div class="slot-info">Day {slot.day} - {capitalize(slot.season)}</div>
          <div class="slot-detail">${slot.money} | {slot.chickenCount} chickens</div>
          <div class="slot-time">{formatDate(slot.timestamp)}</div>
          <button class="delete-btn" onclick={(e) => handleDelete(i, e)}>X</button>
        {:else}
          <div class="slot-empty">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
  <button class="back-btn" onclick={onClose}>Back</button>
</div>

<style>
  .slot-picker {
    text-align: center;
  }

  h3 {
    color: #f0e68c;
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  .slots {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .slot {
    position: relative;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #d0dae4;
    padding: 12px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    text-align: left;
    transition: background 0.2s;
  }

  .slot:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .slot:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .slot-header {
    font-weight: bold;
    color: #f0e68c;
    font-size: 13px;
  }

  .slot-info {
    color: #90ee90;
    font-size: 12px;
  }

  .slot-detail {
    color: #87ceeb;
    font-size: 11px;
  }

  .slot-time {
    color: #888;
    font-size: 10px;
  }

  .slot-empty {
    color: #555;
    font-style: italic;
    font-size: 12px;
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(231, 76, 60, 0.3);
    border: none;
    color: #e74c3c;
    font-size: 10px;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    cursor: pointer;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #d0dae4;
    padding: 8px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
  }
</style>

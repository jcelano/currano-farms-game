<script lang="ts">
  import { musicVolume, sfxVolume, gameSpeedMultiplier } from '$lib/stores/gameStore';

  let { onClose }: { onClose: () => void } = $props();
</script>

<div class="settings">
  <h3>Settings</h3>

  <div class="setting-row">
    <label>Music Volume</label>
    <input type="range" min="0" max="100" value={Math.round($musicVolume * 100)}
      oninput={(e) => musicVolume.set(Number((e.target as HTMLInputElement).value) / 100)} />
    <span class="value">{Math.round($musicVolume * 100)}%</span>
  </div>

  <div class="setting-row">
    <label>SFX Volume</label>
    <input type="range" min="0" max="100" value={Math.round($sfxVolume * 100)}
      oninput={(e) => sfxVolume.set(Number((e.target as HTMLInputElement).value) / 100)} />
    <span class="value">{Math.round($sfxVolume * 100)}%</span>
  </div>

  <div class="setting-row">
    <label>Game Speed</label>
    <button class="speed-btn" onclick={() => gameSpeedMultiplier.update(v => v === 1 ? 2 : 1)}>
      {$gameSpeedMultiplier}x
    </button>
  </div>

  <div class="controls-section">
    <h4>Controls</h4>
    <div class="control-row"><span class="key">WASD / Arrows</span> Move</div>
    <div class="control-row"><span class="key">Shift</span> Run</div>
    <div class="control-row"><span class="key">Space</span> Interact</div>
    <div class="control-row"><span class="key">ESC</span> Pause Menu</div>
    <div class="control-row"><span class="key">` (backtick)</span> Dev HUD</div>
  </div>

  <button class="back-btn" onclick={onClose}>Back</button>
</div>

<style>
  .settings { text-align: center; max-width: 300px; margin: 0 auto; }
  h3 { color: #f0e68c; font-size: 1.4rem; margin-bottom: 1rem; }
  h4 { color: #888; font-size: 11px; text-transform: uppercase; margin: 16px 0 8px; }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
    color: #d0dae4;
  }

  .setting-row label { flex: 0 0 100px; text-align: right; }
  .setting-row input[type="range"] { flex: 1; }
  .value { width: 40px; text-align: right; color: #87ceeb; font-size: 12px; }

  .speed-btn {
    background: rgba(76, 175, 80, 0.3);
    border: 1px solid #4caf50;
    color: #4caf50;
    padding: 4px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
  }

  .controls-section { text-align: left; font-family: 'Courier New', monospace; }
  .control-row { font-size: 11px; color: #888; margin: 4px 0; }
  .key { color: #f0e68c; display: inline-block; min-width: 120px; }

  .back-btn {
    margin-top: 16px;
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

<script lang="ts">
  import { musicVolume, sfxVolume, gameSpeedMultiplier, playerCharacter } from '$lib/stores/gameStore';

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
    <button class="speed-btn" onclick={() => gameSpeedMultiplier.update(v => {
      const speeds = [1, 2, 5, 10];
      const idx = speeds.indexOf(v);
      return speeds[(idx + 1) % speeds.length];
    })}>
      {$gameSpeedMultiplier}x
    </button>
  </div>

  <div class="character-section">
    <h4>Character</h4>
    <div class="char-options">
      <button
        class="char-btn"
        class:selected={$playerCharacter === 'farmer'}
        onclick={() => playerCharacter.set('farmer')}
      >
        <div class="char-preview farmer-preview"></div>
        <span>Farmer</span>
      </button>
      <button
        class="char-btn"
        class:selected={$playerCharacter === 'farmer-girl'}
        onclick={() => playerCharacter.set('farmer-girl')}
      >
        <div class="char-preview girl-preview"></div>
        <span>Farmer Girl</span>
      </button>
    </div>
  </div>

  <div class="controls-section">
    <h4>Controls</h4>
    <div class="control-row"><span class="key">WASD / Arrows</span> Move</div>
    <div class="control-row"><span class="key">Shift</span> Run</div>
    <div class="control-row"><span class="key">Space</span> Interact</div>
    <div class="control-row"><span class="key">ESC</span> Pause Menu</div>
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

  .character-section { text-align: center; }

  .char-options {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .char-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    color: #d0dae4;
    font-family: inherit;
    font-size: 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: border-color 0.2s;
  }

  .char-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }

  .char-btn.selected {
    border-color: #f0e68c;
    background: rgba(240, 230, 140, 0.1);
  }

  .char-preview {
    width: 24px;
    height: 32px;
    border-radius: 3px;
    image-rendering: pixelated;
  }

  .farmer-preview {
    background: linear-gradient(
      to bottom,
      #a07828 0%, #a07828 8%,
      #6b3a2a 8%, #6b3a2a 15%,
      #f5cba7 15%, #f5cba7 35%,
      #cc4444 35%, #cc4444 60%,
      #4a6fa5 60%, #4a6fa5 82%,
      #5c3a1e 82%, #5c3a1e 100%
    );
  }

  .girl-preview {
    background: linear-gradient(
      to bottom,
      #cc3318 0%, #cc3318 15%,
      #f5cba7 15%, #f5cba7 35%,
      #4a6fa5 35%, #4a6fa5 60%,
      #4a6fa5 60%, #4a6fa5 82%,
      #5c3a1e 82%, #5c3a1e 100%
    );
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

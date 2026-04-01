<script lang="ts">
  import { gameReady } from '$lib/stores/gameStore';

  let open = $state(false);

  function toggle() {
    open = !open;
  }
</script>

{#if $gameReady}
  <button class="help-toggle" onclick={toggle} title="How to Play">?</button>

  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="help-backdrop" onclick={toggle}></div>
    <div class="help-panel">
      <div class="help-header">
        <span>How to Play</span>
        <button class="close-btn" onclick={toggle}>✕</button>
      </div>
      <div class="help-body">
        <section>
          <h3>🎮 Controls</h3>
          <div class="control-row"><kbd>W A S D</kbd> or <kbd>Arrow Keys</kbd> — Move</div>
          <div class="control-row"><kbd>Shift</kbd> — Run (uses stamina faster)</div>
          <div class="control-row"><kbd>Space</kbd> — Interact with nearby objects</div>
          <div class="control-row"><kbd>Esc</kbd> — Pause / Menu</div>
          <div class="hint">On mobile, use the on-screen joystick and interact button.</div>
        </section>

        <section>
          <h3>🪣 Carrying Tools & Water</h3>
          <ul>
            <li>Some tasks require you to <b>carry items</b> — pick them up with <kbd>Space</kbd></li>
            <li>Fill a <b>water bucket</b> at the <b>Well</b> (center of farm), then carry it to any waterer or trough</li>
            <li>Pick up the <b>brush</b> at the barn door, carry it to the paddock to brush horses</li>
            <li>Pick up the <b>pitchfork</b> in the coop, then use it to clean the coop</li>
            <li>You can carry up to <b>3 items</b> at once — what you're carrying shows above your head</li>
            <li>Items are used automatically when you press <kbd>Space</kbd> at the right spot</li>
          </ul>
        </section>

        <section>
          <h3>🐔 Chickens</h3>
          <ul>
            <li>Open the <b>coop door</b> gate to enter the coop</li>
            <li>Walk near the feeder and press <kbd>Space</kbd> to feed</li>
            <li>To water: fill a bucket at the <b>Well</b>, then bring it to the coop waterer</li>
            <li><b>Eggs</b> appear in the coop — walk over them to pick them up</li>
            <li>Don't let eggs sit too long or they'll spoil!</li>
            <li>Opening the coop door lets chickens free-range (happier but vulnerable)</li>
            <li>Close the door before night to protect from predators</li>
          </ul>
        </section>

        <section>
          <h3>🐴 Horses</h3>
          <ul>
            <li>Open the <b>paddock gate</b> to enter</li>
            <li>The hay rack is at the <b>barn door</b> — press <kbd>Space</kbd> to feed hay</li>
            <li>Pick up the <b>brush</b> at the barn door, then carry it to the paddock to groom</li>
            <li>Fill a bucket at the <b>Well</b>, then bring it to the horse trough in the paddock</li>
          </ul>
        </section>

        <section>
          <h3>🐐 Goats</h3>
          <ul>
            <li>Open the <b>goat pen gate</b> to enter — but close it behind you!</li>
            <li>Feed and give treats directly in the <b>Goat Pen</b></li>
            <li>To water: fill a bucket at the <b>Well</b>, bring it to the goat waterer</li>
            <li>Treats reduce <b>mischief</b> — high mischief means escape attempts!</li>
            <li>If a goat escapes, grab the <b>leash</b> (near barn), walk to the goat, and press <kbd>Space</kbd></li>
            <li>Leaving gates open too long lets animals wander out!</li>
          </ul>
        </section>

        <section>
          <h3>🐱 Cats</h3>
          <ul>
            <li>Cat food and water are near the <b>Barn</b></li>
            <li>To pet a cat, just walk up to it and press <kbd>Space</kbd></li>
            <li>To water: fill a bucket at the <b>Well</b>, bring it to the cat water bowl</li>
          </ul>
        </section>

        <section>
          <h3>💰 Economy</h3>
          <ul>
            <li>Sell eggs at the <b>Farmer's Market</b> (bottom-center of map)</li>
            <li>Spoiled eggs cost you money</li>
            <li>Fence repairs cost $25</li>
          </ul>
        </section>

        <section>
          <h3>💧 Water System</h3>
          <ul>
            <li>Waterers have a <b>fill level</b> shown by a blue bar beneath them</li>
            <li>Water drains slowly over time — keep an eye on levels!</li>
            <li>Animals drink automatically when there's water available</li>
            <li>Fill a bucket at the <b>Well</b> and pour it into waterers to refill them</li>
          </ul>
        </section>

        <section>
          <h3>🚪 Fences & Gates</h3>
          <ul>
            <li>Animal areas are fenced — you must <b>open a gate</b> to enter</li>
            <li>Walk up to a gate and press <kbd>Space</kbd> to open/close it</li>
            <li>Remember to close gates behind you!</li>
          </ul>
        </section>

        <section>
          <h3>⚡ Stamina & Time</h3>
          <ul>
            <li>Actions cost stamina — eat meals at the <b>Kitchen</b> (west of farmhouse) to restore it</li>
            <li>Go to bed at the farmhouse to sleep and start a new day</li>
            <li>Use the speed controls (top bar) to speed up or pause time</li>
          </ul>
        </section>

        <section>
          <h3>👤 Character</h3>
          <ul>
            <li>Open <b>Settings</b> (pause menu) to switch between <b>Farmer</b> and <b>Farmer Girl</b></li>
          </ul>
        </section>

        <section>
          <h3>🗺️ HUD Tips</h3>
          <ul>
            <li><b>Minimap</b> (top-right) — shows your position on the farm</li>
            <li><b>📋</b> button — event history log</li>
            <li><b>🐾</b> button — animal journal (stats of animals you've visited)</li>
          </ul>
        </section>
      </div>
    </div>
  {/if}
{/if}

<style>
  .help-toggle {
    position: absolute;
    top: 8px;
    right: 240px;
    z-index: 101;
    background: rgba(0, 0, 0, 0.7);
    color: #f0e68c;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 26px;
    height: 26px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .help-toggle:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: #f0e68c;
  }

  @media (max-width: 600px) {
    .help-toggle {
      top: auto;
      bottom: 140px;
      right: 92px;
      min-width: 36px;
      min-height: 36px;
    }
  }

  .help-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 199;
  }

  .help-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    background: rgba(15, 15, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    width: min(480px, 90vw);
    max-height: 80vh;
    font-family: 'Courier New', monospace;
    color: #d0dae4;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }

  .help-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 14px;
    font-weight: bold;
    color: #f0e68c;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
  }

  .close-btn:hover {
    color: #fff;
  }

  .help-body {
    overflow-y: auto;
    padding: 10px 14px;
    font-size: 11px;
    line-height: 1.5;
  }

  section {
    margin-bottom: 14px;
  }

  h3 {
    font-size: 12px;
    color: #f0e68c;
    margin: 0 0 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 3px;
  }

  ul {
    margin: 0;
    padding-left: 16px;
  }

  li {
    margin-bottom: 3px;
  }

  .control-row {
    margin-bottom: 4px;
  }

  kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    padding: 1px 5px;
    font-size: 10px;
    font-family: 'Courier New', monospace;
    color: #f0e68c;
  }

  b {
    color: #87ceeb;
  }

  .hint {
    margin-top: 4px;
    color: #666;
    font-size: 10px;
    font-style: italic;
  }
</style>

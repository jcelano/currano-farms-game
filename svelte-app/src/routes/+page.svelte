<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/title');
  });
</script>

<svelte:head>
  <title>Currano Farms</title>
</svelte:head>

<main>
  <div class="loading">
    <h1>Currano Farms</h1>
    <p>Loading...</p>
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    background: #1a1a2e;
    color: #d0dae4;
    font-family: 'Courier New', monospace;
  }

  .loading { text-align: center; }
  h1 { color: #f0e68c; }
</style>

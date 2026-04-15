<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Prescription Request</title>
</svelte:head>

{@render children()}

<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Prescription Request -- Clinician Dashboard</title>
</svelte:head>

{@render children()}

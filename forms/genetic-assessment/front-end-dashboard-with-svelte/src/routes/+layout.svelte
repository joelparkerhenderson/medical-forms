<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Genetic Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

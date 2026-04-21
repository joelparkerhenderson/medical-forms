<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Diabetes Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Psychiatry Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

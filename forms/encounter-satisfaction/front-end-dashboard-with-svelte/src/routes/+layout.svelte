<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Encounter Satisfaction — Clinician Dashboard</title>
</svelte:head>

{@render children()}

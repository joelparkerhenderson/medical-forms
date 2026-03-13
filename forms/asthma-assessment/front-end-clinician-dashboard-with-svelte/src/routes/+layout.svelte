<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Asthma Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

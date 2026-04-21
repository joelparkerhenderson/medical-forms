<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Allergy Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

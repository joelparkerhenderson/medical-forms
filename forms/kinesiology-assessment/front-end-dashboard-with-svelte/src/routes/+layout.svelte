<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Kinesiology Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

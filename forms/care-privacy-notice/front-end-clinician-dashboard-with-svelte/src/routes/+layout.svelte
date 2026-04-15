<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Care Privacy Notice — Clinician Dashboard</title>
</svelte:head>

{@render children()}

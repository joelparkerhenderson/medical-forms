<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>HRT Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

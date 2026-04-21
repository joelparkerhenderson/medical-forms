<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>PREVENT CVD Risk — Clinician Dashboard</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Heart Health Check — Clinician Dashboard</title>
</svelte:head>

{@render children()}

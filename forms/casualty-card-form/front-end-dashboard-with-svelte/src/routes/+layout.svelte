<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Casualty Card -- Clinician Dashboard</title>
</svelte:head>

{@render children()}

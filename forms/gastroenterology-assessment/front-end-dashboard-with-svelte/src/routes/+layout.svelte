<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Gastroenterology Assessment -- Clinician Dashboard</title>
</svelte:head>

{@render children()}

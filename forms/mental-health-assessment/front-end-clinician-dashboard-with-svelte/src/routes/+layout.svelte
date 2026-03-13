<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Mental Health Assessment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>SCORE2-Diabetes — Clinician Dashboard</title>
</svelte:head>

{@render children()}

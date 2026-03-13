<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Medical Records Release Permission — Clinician Dashboard</title>
</svelte:head>

{@render children()}

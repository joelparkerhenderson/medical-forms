<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Patient Intake -- Clinician Dashboard</title>
</svelte:head>

{@render children()}

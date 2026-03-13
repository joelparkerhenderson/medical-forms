<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Patient Intake</title>
</svelte:head>

{@render children()}

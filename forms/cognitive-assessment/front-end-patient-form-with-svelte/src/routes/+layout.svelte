<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Cognitive Assessment</title>
</svelte:head>

{@render children()}

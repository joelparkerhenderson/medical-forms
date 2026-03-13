<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Mobility Assessment</title>
</svelte:head>

{@render children()}

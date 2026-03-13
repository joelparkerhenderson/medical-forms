<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Psychiatry Assessment</title>
</svelte:head>

{@render children()}

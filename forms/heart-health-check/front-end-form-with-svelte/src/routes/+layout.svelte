<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Heart Health Check</title>
</svelte:head>

{@render children()}

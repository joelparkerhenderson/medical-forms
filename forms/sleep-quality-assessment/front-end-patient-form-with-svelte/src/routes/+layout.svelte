<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Sleep Quality Assessment</title>
</svelte:head>

{@render children()}

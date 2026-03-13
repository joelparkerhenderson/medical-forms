<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Gerontology Assessment</title>
</svelte:head>

{@render children()}

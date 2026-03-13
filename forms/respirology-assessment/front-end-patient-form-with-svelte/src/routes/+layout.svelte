<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Respirology Assessment</title>
</svelte:head>

{@render children()}

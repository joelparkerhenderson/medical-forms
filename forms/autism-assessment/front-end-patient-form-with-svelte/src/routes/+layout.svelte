<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Autism Assessment</title>
</svelte:head>

{@render children()}

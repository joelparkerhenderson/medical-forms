<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Pediatric Assessment</title>
</svelte:head>

{@render children()}

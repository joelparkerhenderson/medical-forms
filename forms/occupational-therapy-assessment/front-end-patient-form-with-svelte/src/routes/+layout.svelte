<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Occupational Therapy Assessment</title>
</svelte:head>

{@render children()}

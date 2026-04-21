<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Audiology Assessment</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Kinesiology Assessment</title>
</svelte:head>

{@render children()}

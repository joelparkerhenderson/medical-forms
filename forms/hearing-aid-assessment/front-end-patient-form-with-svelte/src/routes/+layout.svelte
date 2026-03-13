<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Hearing Aid Assessment</title>
</svelte:head>

{@render children()}

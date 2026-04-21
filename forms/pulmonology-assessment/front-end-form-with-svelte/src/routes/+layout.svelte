<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Pulmonology Assessment</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>HRT Assessment</title>
</svelte:head>

{@render children()}

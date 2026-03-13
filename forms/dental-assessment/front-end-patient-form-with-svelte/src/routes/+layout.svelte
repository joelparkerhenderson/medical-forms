<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Dental Assessment</title>
</svelte:head>

{@render children()}

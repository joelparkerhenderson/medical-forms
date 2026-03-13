<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Allergy Assessment</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Hematology Assessment</title>
</svelte:head>

{@render children()}

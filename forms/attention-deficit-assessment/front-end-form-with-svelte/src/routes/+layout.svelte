<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>ADHD Assessment</title>
</svelte:head>

{@render children()}

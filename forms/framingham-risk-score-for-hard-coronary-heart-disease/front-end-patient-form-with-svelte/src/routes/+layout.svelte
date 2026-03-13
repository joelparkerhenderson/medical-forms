<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Framingham Risk Score Calculator</title>
</svelte:head>

{@render children()}

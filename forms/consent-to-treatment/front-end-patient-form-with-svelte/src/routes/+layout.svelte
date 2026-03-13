<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Consent to Treatment</title>
</svelte:head>

{@render children()}

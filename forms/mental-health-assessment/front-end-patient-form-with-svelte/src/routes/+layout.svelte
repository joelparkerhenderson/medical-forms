<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Mental Health Assessment</title>
</svelte:head>

{@render children()}

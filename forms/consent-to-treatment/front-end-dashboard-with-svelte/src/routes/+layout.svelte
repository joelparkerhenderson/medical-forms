<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Consent to Treatment — Clinician Dashboard</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import '../app.css';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { saveToStorage } from '$lib/stores/autosave';

	let { children } = $props();

	let debounceTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const snapshot = JSON.stringify(assessment.data);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			saveToStorage(assessment.data);
		}, 500);
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Medical Records Release Permission</title>
</svelte:head>

{@render children()}

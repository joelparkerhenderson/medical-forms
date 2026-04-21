<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<svelte:head><title>PREVENT CVD Risk Calculator</title></svelte:head>
{@render children()}

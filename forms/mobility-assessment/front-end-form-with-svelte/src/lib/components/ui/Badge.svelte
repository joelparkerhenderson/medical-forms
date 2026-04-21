<script lang="ts">
	import { tinettiScoreLabel, tinettiScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(tinettiScoreColor(score));
	const label = $derived(tinettiScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

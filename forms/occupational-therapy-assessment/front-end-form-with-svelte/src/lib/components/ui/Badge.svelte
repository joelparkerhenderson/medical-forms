<script lang="ts">
	import { copmScoreLabel, copmScoreColor } from '$lib/engine/utils';

	let {
		score,
		type = 'Performance'
	}: {
		score: number;
		type?: 'Performance' | 'Satisfaction';
	} = $props();

	const colorClass = $derived(copmScoreColor(score));
	const label = $derived(copmScoreLabel(score, type));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

<script lang="ts">
	import { hhiesScoreLabel, hhiesScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(hhiesScoreColor(score));
	const label = $derived(hhiesScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

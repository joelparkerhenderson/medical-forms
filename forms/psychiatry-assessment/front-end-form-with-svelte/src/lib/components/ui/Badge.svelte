<script lang="ts">
	import { gafScoreColor, gafScoreLabel } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(gafScoreColor(score));
	const label = $derived(gafScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

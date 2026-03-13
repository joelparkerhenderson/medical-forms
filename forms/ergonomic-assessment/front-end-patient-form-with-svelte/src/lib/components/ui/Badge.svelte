<script lang="ts">
	import { rebaScoreLabel, rebaScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(rebaScoreColor(score));
	const label = $derived(rebaScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

<script lang="ts">
	import { fmsScoreLabel, fmsScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(fmsScoreColor(score));
	const label = $derived(fmsScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

<script lang="ts">
	import { aq10ScoreLabel, aq10ScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(aq10ScoreColor(score));
	const label = $derived(aq10ScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

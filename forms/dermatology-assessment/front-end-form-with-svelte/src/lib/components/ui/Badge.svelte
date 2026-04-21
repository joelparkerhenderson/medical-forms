<script lang="ts">
	import { dlqiScoreLabel, dlqiScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(dlqiScoreColor(score));
	const label = $derived(dlqiScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

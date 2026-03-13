<script lang="ts">
	import { dashScoreLabel, dashScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(dashScoreColor(score));
	const label = $derived(dashScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

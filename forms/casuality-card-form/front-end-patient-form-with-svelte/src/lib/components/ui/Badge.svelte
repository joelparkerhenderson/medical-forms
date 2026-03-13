<script lang="ts">
	import { news2ScoreColor } from '$lib/engine/utils';

	let {
		score,
		label
	}: {
		score: number;
		label: string;
	} = $props();

	const colorClass = $derived(news2ScoreColor(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

<script lang="ts">
	import { satisfactionScoreLabel, satisfactionScoreColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(satisfactionScoreColor(score));
	const label = $derived(satisfactionScoreLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

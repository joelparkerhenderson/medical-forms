<script lang="ts">
	import { completenessLabel, completenessColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(completenessColor(score));
	const label = $derived(completenessLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

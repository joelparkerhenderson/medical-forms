<script lang="ts">
	import { nihssSeverityLabel, nihssSeverityColor } from '$lib/engine/utils';

	let {
		score
	}: {
		score: number;
	} = $props();

	const colorClass = $derived(nihssSeverityColor(score));
	const label = $derived(nihssSeverityLabel(score));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	NIHSS {score} - {label}
</span>

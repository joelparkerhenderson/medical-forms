<script lang="ts">
	import { riskCategoryLabel, riskCategoryColor } from '$lib/engine/utils';

	let {
		level
	}: {
		level: string;
	} = $props();

	const colorClass = $derived(riskCategoryColor(level));
	const label = $derived(riskCategoryLabel(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

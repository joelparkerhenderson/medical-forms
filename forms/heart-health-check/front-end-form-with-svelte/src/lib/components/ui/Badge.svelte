<script lang="ts">
	import { riskCategoryColor } from '$lib/engine/utils';

	let {
		level,
		label
	}: {
		level: string;
		label: string;
	} = $props();

	const colorClass = $derived(riskCategoryColor(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

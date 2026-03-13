<script lang="ts">
	import { dmftCategoryLabel, dmftCategoryColor } from '$lib/engine/utils';
	import type { DMFTCategory } from '$lib/engine/types';

	let {
		category
	}: {
		category: DMFTCategory;
	} = $props();

	const colorClass = $derived(dmftCategoryColor(category));
	const label = $derived(dmftCategoryLabel(category));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

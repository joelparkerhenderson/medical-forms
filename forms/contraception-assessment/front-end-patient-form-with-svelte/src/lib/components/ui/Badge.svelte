<script lang="ts">
	import { ukmecLabel, ukmecColor } from '$lib/engine/utils';
	import type { UKMECCategory } from '$lib/engine/types';

	let {
		category
	}: {
		category: UKMECCategory;
	} = $props();

	const colorClass = $derived(ukmecColor(category));
	const label = $derived(ukmecLabel(category));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

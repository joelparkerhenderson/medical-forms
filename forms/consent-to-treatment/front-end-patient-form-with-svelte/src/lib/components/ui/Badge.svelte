<script lang="ts">
	import { completenessLabel, completenessColor } from '$lib/engine/utils';

	let {
		completeness
	}: {
		completeness: number;
	} = $props();

	const colorClass = $derived(completenessColor(completeness));
	const label = $derived(completenessLabel(completeness));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

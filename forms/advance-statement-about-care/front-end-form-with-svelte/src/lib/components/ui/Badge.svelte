<script lang="ts">
	import { completenessLevelLabel, completenessLevelColor } from '$lib/engine/utils';

	let {
		level
	}: {
		level: string;
	} = $props();

	const colorClass = $derived(completenessLevelColor(level));
	const label = $derived(completenessLevelLabel(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

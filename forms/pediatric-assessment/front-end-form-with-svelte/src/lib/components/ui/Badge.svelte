<script lang="ts">
	import { devScreenLabel, devScreenColor } from '$lib/engine/utils';

	let {
		result
	}: {
		result: string;
	} = $props();

	const colorClass = $derived(devScreenColor(result));
	const label = $derived(devScreenLabel(result));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

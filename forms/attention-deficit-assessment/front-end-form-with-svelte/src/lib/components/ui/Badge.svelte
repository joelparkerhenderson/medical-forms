<script lang="ts">
	import { asrsClassificationLabel, asrsClassificationColor } from '$lib/engine/utils';

	let {
		classification
	}: {
		classification: string;
	} = $props();

	const colorClass = $derived(asrsClassificationColor(classification));
	const label = $derived(asrsClassificationLabel(classification));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

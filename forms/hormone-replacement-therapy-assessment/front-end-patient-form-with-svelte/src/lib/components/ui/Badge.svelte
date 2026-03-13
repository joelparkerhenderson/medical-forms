<script lang="ts">
	import { mrsSeverityLabel, mrsSeverityColor } from '$lib/engine/utils';
	import type { MRSSeverity } from '$lib/engine/types';

	let {
		severity
	}: {
		severity: MRSSeverity;
	} = $props();

	const colorClass = $derived(mrsSeverityColor(severity));
	const label = $derived(mrsSeverityLabel(severity));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

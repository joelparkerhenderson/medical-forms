<script lang="ts">
	import { severityLabel, severityColor } from '$lib/engine/utils';
	import type { SeverityLevel } from '$lib/engine/types';

	let {
		level
	}: {
		level: SeverityLevel;
	} = $props();

	const colorClass = $derived(severityColor(level));
	const label = $derived(severityLabel(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

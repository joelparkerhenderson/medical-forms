<script lang="ts">
	import { severityColor, severityLabel } from '$lib/engine/utils';

	let {
		level
	}: {
		level: string;
	} = $props();

	const colorClass = $derived(severityColor(level));
	const label = $derived(severityLabel(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

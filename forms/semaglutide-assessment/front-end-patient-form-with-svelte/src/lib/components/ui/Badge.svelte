<script lang="ts">
	import { eligibilityLabel, eligibilityColor } from '$lib/engine/utils';

	let {
		status
	}: {
		status: string;
	} = $props();

	const colorClass = $derived(eligibilityColor(status));
	const label = $derived(eligibilityLabel(status));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

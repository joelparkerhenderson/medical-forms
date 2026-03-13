<script lang="ts">
	import { validityStatusLabel, validityStatusColor } from '$lib/engine/utils';

	let {
		status
	}: {
		status: string;
	} = $props();

	const colorClass = $derived(validityStatusColor(status));
	const label = $derived(validityStatusLabel(status));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

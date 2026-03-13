<script lang="ts">
	import { cardioClassLabel, cardioClassColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(cardioClassColor(grade));
	const label = $derived(cardioClassLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

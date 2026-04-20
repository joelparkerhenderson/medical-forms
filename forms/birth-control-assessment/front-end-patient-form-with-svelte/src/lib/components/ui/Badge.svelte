<script lang="ts">
	import { mecClassLabel, mecClassColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(mecClassColor(grade));
	const label = $derived(mecClassLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

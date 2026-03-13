<script lang="ts">
	import { mrcGradeLabel, mrcGradeColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(mrcGradeColor(grade));
	const label = $derived(mrcGradeLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

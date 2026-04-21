<script lang="ts">
	import { hearingGradeLabel, hearingGradeColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: string;
	} = $props();

	const colorClass = $derived(hearingGradeColor(grade));
	const label = $derived(hearingGradeLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

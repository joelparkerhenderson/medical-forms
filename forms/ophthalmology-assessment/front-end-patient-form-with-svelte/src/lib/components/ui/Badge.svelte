<script lang="ts">
	import { vaGradeLabel, vaGradeColor } from '$lib/engine/utils';
	import type { VAGrade } from '$lib/engine/types';

	let {
		grade
	}: {
		grade: VAGrade;
	} = $props();

	const colorClass = $derived(vaGradeColor(grade));
	const label = $derived(vaGradeLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

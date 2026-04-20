<script lang="ts">
	import { gradeLabel, gradeColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(gradeColor(grade));
	const label = $derived(gradeLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

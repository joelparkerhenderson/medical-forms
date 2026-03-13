<script lang="ts">
	import { ecogGradeLabel, ecogGradeColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(ecogGradeColor(grade));
	const label = $derived(ecogGradeLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

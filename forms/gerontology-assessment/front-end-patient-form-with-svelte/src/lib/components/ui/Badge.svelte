<script lang="ts">
	import { cfsScoreLabel, cfsScoreColor } from '$lib/engine/utils';

	let {
		grade
	}: {
		grade: number;
	} = $props();

	const colorClass = $derived(cfsScoreColor(grade));
	const label = $derived(cfsScoreLabel(grade));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
	{label}
</span>

<script lang="ts">
	import type { PclItemScore } from '$lib/engine/types';

	let {
		label,
		name,
		value = $bindable(null as PclItemScore)
	}: {
		label: string;
		name: string;
		value: PclItemScore;
	} = $props();

	const choices: { score: 0 | 1 | 2 | 3 | 4; label: string }[] = [
		{ score: 0, label: 'Not at all' },
		{ score: 1, label: 'A little bit' },
		{ score: 2, label: 'Moderately' },
		{ score: 3, label: 'Quite a bit' },
		{ score: 4, label: 'Extremely' }
	];
</script>

<fieldset class="mb-4 rounded-lg border border-gray-200 p-4">
	<legend class="px-2 text-sm font-medium text-gray-800">{label}</legend>
	<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
		{#each choices as c}
			<label class="flex cursor-pointer items-center gap-2 rounded border p-2 text-xs {value === c.score ? 'border-primary bg-blue-50 font-semibold' : 'border-gray-200 bg-white hover:bg-gray-50'}">
				<input type="radio" {name} bind:group={value} value={c.score} class="accent-primary" />
				<span><span class="font-mono text-gray-500">{c.score}</span> {c.label}</span>
			</label>
		{/each}
	</div>
</fieldset>

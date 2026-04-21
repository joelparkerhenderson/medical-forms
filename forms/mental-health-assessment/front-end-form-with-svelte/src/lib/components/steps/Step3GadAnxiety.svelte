<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import { gad7Questions, gadAnswerOptions } from '$lib/engine/mh-rules';
	import type { GadScore } from '$lib/engine/types';

	const g = assessment.data.gadResponses;

	const gadKeys: (keyof typeof g)[] = [
		'nervousness',
		'uncontrollableWorry',
		'excessiveWorry',
		'troubleRelaxing',
		'restlessness',
		'irritability',
		'fearfulness'
	];

	function setScore(key: keyof typeof g, value: number) {
		(g[key] as GadScore) = value as GadScore;
	}
</script>

<SectionCard
	title="GAD-7 Anxiety Screen"
	description="Over the last 2 weeks, how often have you been bothered by any of the following problems?"
>
	{#each gadKeys as key, i}
		<div class="mb-6 {i < gadKeys.length - 1 ? 'border-b border-gray-100 pb-6' : ''}">
			<p class="mb-3 text-sm font-medium text-gray-700">
				{i + 1}. {gad7Questions[i]}
			</p>
			<div class="flex flex-wrap gap-2">
				{#each gadAnswerOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors
							{g[key] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="gad_{key}"
							value={opt.value}
							checked={g[key] === opt.value}
							onchange={() => setScore(key, opt.value)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</div>
	{/each}
</SectionCard>

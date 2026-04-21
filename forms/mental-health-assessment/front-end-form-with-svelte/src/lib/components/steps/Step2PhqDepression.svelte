<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import { phq9Questions, phqAnswerOptions } from '$lib/engine/mh-rules';
	import type { PhqScore } from '$lib/engine/types';

	const p = assessment.data.phqResponses;

	const phqKeys: (keyof typeof p)[] = [
		'interest',
		'depression',
		'sleep',
		'energy',
		'appetite',
		'selfEsteem',
		'concentration',
		'psychomotor',
		'suicidalThoughts'
	];

	function setScore(key: keyof typeof p, value: number) {
		(p[key] as PhqScore) = value as PhqScore;
	}
</script>

<SectionCard
	title="PHQ-9 Depression Screen"
	description="Over the last 2 weeks, how often have you been bothered by any of the following problems?"
>
	{#each phqKeys as key, i}
		<div class="mb-6 {i < phqKeys.length - 1 ? 'border-b border-gray-100 pb-6' : ''}">
			<p class="mb-3 text-sm font-medium text-gray-700">
				{i + 1}. {phq9Questions[i]}
			</p>
			<div class="flex flex-wrap gap-2">
				{#each phqAnswerOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors
							{p[key] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="phq_{key}"
							value={opt.value}
							checked={p[key] === opt.value}
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

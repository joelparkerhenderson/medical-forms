<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { dlqiQuestions, dlqiResponseOptions } from '$lib/engine/dlqi-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { DLQIScore } from '$lib/engine/types';

	const q = assessment.data.dlqiQuestionnaire;

	const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const;

	function setScore(key: typeof questionKeys[number], value: number) {
		assessment.data.dlqiQuestionnaire[key] = value as DLQIScore;
	}
</script>

<SectionCard title="DLQI Questionnaire" description="Dermatology Life Quality Index - rate the impact of your skin condition over the last week">
	{#each dlqiQuestions as question, i}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 text-primary font-bold">{i + 1}.</span>
				{question.text}
			</p>
			<p class="mb-2 text-xs text-gray-400">Domain: {question.domain}</p>
			<div class="flex flex-wrap gap-2">
				{#each dlqiResponseOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{q[questionKeys[i]] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="dlqi-q{i + 1}"
							value={opt.value}
							checked={q[questionKeys[i]] === opt.value}
							onchange={() => setScore(questionKeys[i], opt.value)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</div>
	{/each}
</SectionCard>

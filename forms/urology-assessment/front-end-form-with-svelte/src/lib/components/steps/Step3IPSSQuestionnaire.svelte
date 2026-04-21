<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { ipssQuestions, ipssResponseOptions } from '$lib/engine/ipss-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { IPSSScore } from '$lib/engine/types';

	const q = assessment.data.ipssQuestionnaire;

	const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

	function setScore(key: typeof questionKeys[number], value: number) {
		assessment.data.ipssQuestionnaire[key] = value as IPSSScore;
	}
</script>

<SectionCard title="IPSS Questionnaire" description="International Prostate Symptom Score - rate your urinary symptoms over the past month">
	{#each ipssQuestions as question, i}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 text-primary font-bold">{i + 1}.</span>
				{question.text}
			</p>
			<p class="mb-2 text-xs text-gray-400">Domain: {question.domain}</p>
			<div class="flex flex-wrap gap-2">
				{#each ipssResponseOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{q[questionKeys[i]] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="ipss-q{i + 1}"
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

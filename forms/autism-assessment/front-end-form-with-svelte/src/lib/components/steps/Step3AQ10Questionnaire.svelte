<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { aq10Questions, aq10ResponseOptions, aq10ScoringDirections } from '$lib/engine/aq10-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { AQ10Score } from '$lib/engine/types';

	const q = assessment.data.aq10Questionnaire;

	const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const;

	// Store raw responses (the selected radio value) separately
	let rawResponses = $state<Record<string, string>>({});

	function handleResponse(key: typeof questionKeys[number], questionNumber: number, responseValue: string) {
		rawResponses[key] = responseValue;
		const direction = aq10ScoringDirections[questionNumber];
		const isAgree = responseValue === 'definitely-agree' || responseValue === 'slightly-agree';
		const isDisagree = responseValue === 'definitely-disagree' || responseValue === 'slightly-disagree';

		if (direction === 'agree') {
			assessment.data.aq10Questionnaire[key] = (isAgree ? 1 : 0) as AQ10Score;
		} else {
			assessment.data.aq10Questionnaire[key] = (isDisagree ? 1 : 0) as AQ10Score;
		}
	}
</script>

<SectionCard title="AQ-10 Questionnaire" description="Autism Spectrum Quotient-10 - indicate how strongly you agree or disagree with each statement">
	{#each aq10Questions as question, i}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 text-primary font-bold">{i + 1}.</span>
				{question.text}
			</p>
			<p class="mb-2 text-xs text-gray-400">Domain: {question.domain}</p>
			<div class="flex flex-wrap gap-2">
				{#each aq10ResponseOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{rawResponses[questionKeys[i]] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="aq10-q{i + 1}"
							value={opt.value}
							checked={rawResponses[questionKeys[i]] === opt.value}
							onchange={() => handleResponse(questionKeys[i], question.questionNumber, opt.value)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</div>
	{/each}
</SectionCard>

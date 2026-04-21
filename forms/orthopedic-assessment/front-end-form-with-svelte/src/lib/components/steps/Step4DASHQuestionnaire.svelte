<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { dashQuestions, getResponseOptions } from '$lib/engine/dash-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { DASHScore } from '$lib/engine/types';

	const q = assessment.data.dashQuestionnaire;

	const questionKeys = [
		'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
		'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20',
		'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30'
	] as const;

	function setScore(key: typeof questionKeys[number], value: number) {
		assessment.data.dashQuestionnaire[key] = value as DASHScore;
	}

	let currentDomain = $state('');

	function isDomainChange(i: number): boolean {
		if (i === 0) return true;
		return dashQuestions[i].domain !== dashQuestions[i - 1].domain;
	}
</script>

<SectionCard title="DASH Questionnaire" description="Disabilities of the Arm, Shoulder and Hand - rate your ability to perform the following activities in the past week (minimum 27 of 30 items required)">
	{#each dashQuestions as question, i}
		{#if isDomainChange(i)}
			<div class="mb-4 mt-6 first:mt-0">
				<h3 class="text-sm font-bold uppercase tracking-wide text-primary">{question.domain}</h3>
				<hr class="mt-1 border-gray-200" />
			</div>
		{/if}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 text-primary font-bold">{i + 1}.</span>
				{question.text}
			</p>
			<div class="flex flex-wrap gap-2">
				{#each getResponseOptions(question.questionNumber) as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{q[questionKeys[i]] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="dash-q{i + 1}"
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

<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { satisfactionQuestions, likertResponseOptions } from '$lib/engine/satisfaction-questions';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import type { LikertScore } from '$lib/engine/types';

	const section = assessment.data.overallSatisfaction;
	const questions = satisfactionQuestions.filter((q) => q.domain === 'Overall Satisfaction');

	function setScore(field: string, value: number) {
		(section as Record<string, LikertScore | null | string>)[field] = value as LikertScore;
	}
</script>

<SectionCard title="Overall Satisfaction" description="Rate your overall experience and provide any additional comments">
	{#each questions as question, i}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 font-bold text-primary">{i + 1}.</span>
				{question.text}
			</p>
			<div class="flex flex-wrap gap-2">
				{#each likertResponseOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{(section as Record<string, LikertScore | null | string>)[question.field] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="ess-{question.id}"
							value={opt.value}
							checked={(section as Record<string, LikertScore | null | string>)[question.field] === opt.value}
							onchange={() => setScore(question.field, opt.value)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</div>
	{/each}

	<TextArea
		label="Additional Comments"
		name="comments"
		bind:value={section.comments}
		placeholder="Please share any additional feedback about your experience..."
		rows={4}
	/>
</SectionCard>

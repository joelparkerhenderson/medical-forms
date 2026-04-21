<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { symptomResponseOptions } from '$lib/engine/symptom-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { SymptomScore } from '$lib/engine/types';

	const gs = assessment.data.gynecologicalSymptoms;

	const symptomQuestions = [
		{ key: 'pelvicPain' as const, label: 'Do you experience pelvic pain outside of menstruation?' },
		{ key: 'abnormalBleeding' as const, label: 'Do you experience bleeding between periods or after intercourse?' },
		{ key: 'discharge' as const, label: 'Do you experience abnormal vaginal discharge?' },
		{ key: 'urinarySymptoms' as const, label: 'Do you experience urinary frequency, urgency, or incontinence?' }
	];

	function setScore(key: keyof typeof gs, value: number) {
		assessment.data.gynecologicalSymptoms[key] = value as SymptomScore;
	}
</script>

<SectionCard title="Gynaecological Symptoms" description="Rate the severity of your current gynaecological symptoms">
	{#each symptomQuestions as question, i}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-3 text-sm font-medium text-gray-700">
				<span class="mr-1 text-primary font-bold">{i + 1}.</span>
				{question.label}
			</p>
			<div class="flex flex-wrap gap-2">
				{#each symptomResponseOptions as opt}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
							{gs[question.key] === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="symptom-{question.key}"
							value={opt.value}
							checked={gs[question.key] === opt.value}
							onchange={() => setScore(question.key, opt.value)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</div>
	{/each}
</SectionCard>

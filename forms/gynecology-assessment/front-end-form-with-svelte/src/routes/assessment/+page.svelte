<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateSymptomScore } from '$lib/engine/symptom-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3MenstrualHistory from '$lib/components/steps/Step3MenstrualHistory.svelte';
	import Step4GynecologicalSymptoms from '$lib/components/steps/Step4GynecologicalSymptoms.svelte';
	import Step5CervicalScreening from '$lib/components/steps/Step5CervicalScreening.svelte';
	import Step6ObstetricHistory from '$lib/components/steps/Step6ObstetricHistory.svelte';
	import Step7SexualHealth from '$lib/components/steps/Step7SexualHealth.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10FamilyHistory from '$lib/components/steps/Step10FamilyHistory.svelte';

	function submitAssessment() {
			const { symptomScore, symptomCategoryLabel, firedRules } = calculateSymptomScore(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				symptomScore,
				symptomCategory: symptomCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3MenstrualHistory />

<Step4GynecologicalSymptoms />

<Step5CervicalScreening />

<Step6ObstetricHistory />

<Step7SexualHealth />

<Step8MedicalHistory />

<Step9CurrentMedications />

<Step10FamilyHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateDLQI } from '$lib/engine/dlqi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { dlqiCategory } from '$lib/engine/utils';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DLQIQuestionnaire from '$lib/components/steps/Step3DLQIQuestionnaire.svelte';
	import Step4LesionCharacteristics from '$lib/components/steps/Step4LesionCharacteristics.svelte';
	import Step5MedicalHistory from '$lib/components/steps/Step5MedicalHistory.svelte';
	import Step6CurrentMedications from '$lib/components/steps/Step6CurrentMedications.svelte';
	import Step7Allergies from '$lib/components/steps/Step7Allergies.svelte';
	import Step8FamilyHistory from '$lib/components/steps/Step8FamilyHistory.svelte';
	import Step9SocialHistory from '$lib/components/steps/Step9SocialHistory.svelte';

	function submitAssessment() {
			const { dlqiScore, dlqiCategoryLabel, firedRules } = calculateDLQI(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				dlqiScore,
				dlqiCategory: dlqiCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3DLQIQuestionnaire />

<Step4LesionCharacteristics />

<Step5MedicalHistory />

<Step6CurrentMedications />

<Step7Allergies />

<Step8FamilyHistory />

<Step9SocialHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

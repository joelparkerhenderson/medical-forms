<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateGold } from '$lib/engine/gold-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3Spirometry from '$lib/components/steps/Step3Spirometry.svelte';
	import Step4SymptomAssessment from '$lib/components/steps/Step4SymptomAssessment.svelte';
	import Step5ExacerbationHistory from '$lib/components/steps/Step5ExacerbationHistory.svelte';
	import Step6CurrentMedications from '$lib/components/steps/Step6CurrentMedications.svelte';
	import Step7Allergies from '$lib/components/steps/Step7Allergies.svelte';
	import Step8Comorbidities from '$lib/components/steps/Step8Comorbidities.svelte';
	import Step9SmokingExposures from '$lib/components/steps/Step9SmokingExposures.svelte';
	import Step10FunctionalStatus from '$lib/components/steps/Step10FunctionalStatus.svelte';

	function submitAssessment() {
			const { goldStage, abcdGroup, firedRules } = calculateGold(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				goldStage,
				abcdGroup,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3Spirometry />

<Step4SymptomAssessment />

<Step5ExacerbationHistory />

<Step6CurrentMedications />

<Step7Allergies />

<Step8Comorbidities />

<Step9SmokingExposures />

<Step10FunctionalStatus />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

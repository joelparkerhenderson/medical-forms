<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateECOG } from '$lib/engine/ecog-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2CancerDiagnosis from '$lib/components/steps/Step2CancerDiagnosis.svelte';
	import Step3TreatmentHistory from '$lib/components/steps/Step3TreatmentHistory.svelte';
	import Step4CurrentTreatment from '$lib/components/steps/Step4CurrentTreatment.svelte';
	import Step5SymptomAssessment from '$lib/components/steps/Step5SymptomAssessment.svelte';
	import Step6SideEffects from '$lib/components/steps/Step6SideEffects.svelte';
	import Step7LaboratoryResults from '$lib/components/steps/Step7LaboratoryResults.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9Psychosocial from '$lib/components/steps/Step9Psychosocial.svelte';
	import Step10FunctionalNutritional from '$lib/components/steps/Step10FunctionalNutritional.svelte';

	function submitAssessment() {
			const { ecogGrade, firedRules } = calculateECOG(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				ecogGrade,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2CancerDiagnosis />

<Step3TreatmentHistory />

<Step4CurrentTreatment />

<Step5SymptomAssessment />

<Step6SideEffects />

<Step7LaboratoryResults />

<Step8CurrentMedications />

<Step9Psychosocial />

<Step10FunctionalNutritional />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

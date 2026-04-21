<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PregnancyDetails from '$lib/components/steps/Step2PregnancyDetails.svelte';
	import Step3ObstetricHistory from '$lib/components/steps/Step3ObstetricHistory.svelte';
	import Step4MedicalHistory from '$lib/components/steps/Step4MedicalHistory.svelte';
	import Step5CurrentSymptoms from '$lib/components/steps/Step5CurrentSymptoms.svelte';
	import Step6VitalSigns from '$lib/components/steps/Step6VitalSigns.svelte';
	import Step7LaboratoryResults from '$lib/components/steps/Step7LaboratoryResults.svelte';
	import Step8LifestyleNutrition from '$lib/components/steps/Step8LifestyleNutrition.svelte';
	import Step9MentalHealth from '$lib/components/steps/Step9MentalHealth.svelte';
	import Step10BirthPlan from '$lib/components/steps/Step10BirthPlan.svelte';

	function submitAssessment() {
			const { riskScore, riskLevel, firedRules } = calculateRisk(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				riskScore,
				riskLevel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2PregnancyDetails />

<Step3ObstetricHistory />

<Step4MedicalHistory />

<Step5CurrentSymptoms />

<Step6VitalSigns />

<Step7LaboratoryResults />

<Step8LifestyleNutrition />

<Step9MentalHealth />

<Step10BirthPlan />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

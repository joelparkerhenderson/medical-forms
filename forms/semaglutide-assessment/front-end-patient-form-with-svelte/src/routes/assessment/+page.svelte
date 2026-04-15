<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { evaluateEligibility } from '$lib/engine/eligibility-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2IndicationGoals from '$lib/components/steps/Step2IndicationGoals.svelte';
	import Step3BodyComposition from '$lib/components/steps/Step3BodyComposition.svelte';
	import Step4MetabolicProfile from '$lib/components/steps/Step4MetabolicProfile.svelte';
	import Step5CardiovascularRisk from '$lib/components/steps/Step5CardiovascularRisk.svelte';
	import Step6ContraindicationsScreening from '$lib/components/steps/Step6ContraindicationsScreening.svelte';
	import Step7GastrointestinalHistory from '$lib/components/steps/Step7GastrointestinalHistory.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9MentalHealthScreening from '$lib/components/steps/Step9MentalHealthScreening.svelte';
	import Step10TreatmentPlan from '$lib/components/steps/Step10TreatmentPlan.svelte';

	function submitAssessment() {
			const { eligibilityStatus, bmi, bmiCategoryLabel, absoluteContraindications, relativeContraindications } = evaluateEligibility(assessment.data);
			const monitoringFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				eligibilityStatus,
				bmi,
				bmiCategory: bmiCategoryLabel,
				absoluteContraindications,
				relativeContraindications,
				monitoringFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2IndicationGoals />

<Step3BodyComposition />

<Step4MetabolicProfile />

<Step5CardiovascularRisk />

<Step6ContraindicationsScreening />

<Step7GastrointestinalHistory />

<Step8CurrentMedications />

<Step9MentalHealthScreening />

<Step10TreatmentPlan />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2DemographicsEthnicity from '$lib/components/steps/Step2DemographicsEthnicity.svelte';
	import Step3BloodPressure from '$lib/components/steps/Step3BloodPressure.svelte';
	import Step4Cholesterol from '$lib/components/steps/Step4Cholesterol.svelte';
	import Step5MedicalConditions from '$lib/components/steps/Step5MedicalConditions.svelte';
	import Step6FamilyHistory from '$lib/components/steps/Step6FamilyHistory.svelte';
	import Step7SmokingAlcohol from '$lib/components/steps/Step7SmokingAlcohol.svelte';
	import Step8PhysicalActivityDiet from '$lib/components/steps/Step8PhysicalActivityDiet.svelte';
	import Step9BodyMeasurements from '$lib/components/steps/Step9BodyMeasurements.svelte';
	import Step10ReviewCalculate from '$lib/components/steps/Step10ReviewCalculate.svelte';

	function submitAssessment() {
			const risk = calculateRisk(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				riskCategory: risk.riskCategory,
				tenYearRiskPercent: risk.tenYearRiskPercent,
				heartAge: risk.heartAge,
				firedRules: risk.firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2DemographicsEthnicity />

<Step3BloodPressure />

<Step4Cholesterol />

<Step5MedicalConditions />

<Step6FamilyHistory />

<Step7SmokingAlcohol />

<Step8PhysicalActivityDiet />

<Step9BodyMeasurements />

<Step10ReviewCalculate />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2Demographics from '$lib/components/steps/Step2Demographics.svelte';
	import Step3SmokingHistory from '$lib/components/steps/Step3SmokingHistory.svelte';
	import Step4BloodPressure from '$lib/components/steps/Step4BloodPressure.svelte';
	import Step5Cholesterol from '$lib/components/steps/Step5Cholesterol.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7FamilyHistory from '$lib/components/steps/Step7FamilyHistory.svelte';
	import Step8LifestyleFactors from '$lib/components/steps/Step8LifestyleFactors.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10ReviewCalculate from '$lib/components/steps/Step10ReviewCalculate.svelte';

	function submitAssessment() {
			const { riskCategory, tenYearRiskPercent, firedRules } = calculateRisk(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				riskCategory,
				tenYearRiskPercent,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2Demographics />

<Step3SmokingHistory />

<Step4BloodPressure />

<Step5Cholesterol />

<Step6MedicalHistory />

<Step7FamilyHistory />

<Step8LifestyleFactors />

<Step9CurrentMedications />

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

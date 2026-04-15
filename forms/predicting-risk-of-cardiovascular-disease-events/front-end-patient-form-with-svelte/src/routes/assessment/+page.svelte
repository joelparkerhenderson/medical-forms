<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRisk } from '$lib/engine/risk-grader';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2Demographics from '$lib/components/steps/Step2Demographics.svelte';
	import Step3BloodPressure from '$lib/components/steps/Step3BloodPressure.svelte';
	import Step4CholesterolLipids from '$lib/components/steps/Step4CholesterolLipids.svelte';
	import Step5MetabolicHealth from '$lib/components/steps/Step5MetabolicHealth.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
	import Step7SmokingHistory from '$lib/components/steps/Step7SmokingHistory.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10ReviewCalculate from '$lib/components/steps/Step10ReviewCalculate.svelte';

	function submitAssessment() {
			const result = calculateRisk(assessment.data);
			assessment.result = result;
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2Demographics />

<Step3BloodPressure />

<Step4CholesterolLipids />

<Step5MetabolicHealth />

<Step6RenalFunction />

<Step7SmokingHistory />

<Step8MedicalHistory />

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

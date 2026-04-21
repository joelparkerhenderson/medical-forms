<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { page } from '$app/state';

	import Step1PatientDemographics from '$lib/components/steps/Step1PatientDemographics.svelte';
	import Step2DiabetesHistory from '$lib/components/steps/Step2DiabetesHistory.svelte';
	import Step3CardiovascularHistory from '$lib/components/steps/Step3CardiovascularHistory.svelte';
	import Step4BloodPressure from '$lib/components/steps/Step4BloodPressure.svelte';
	import Step5LipidProfile from '$lib/components/steps/Step5LipidProfile.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
	import Step7LifestyleFactors from '$lib/components/steps/Step7LifestyleFactors.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9ComplicationsScreening from '$lib/components/steps/Step9ComplicationsScreening.svelte';
	import Step10RiskAssessmentSummary from '$lib/components/steps/Step10RiskAssessmentSummary.svelte';

	function goToPrevious() {
			if (currentStep > 1) goto(`/assessment/${currentStep - 1}`);
		}
</script>

<Step1PatientDemographics />

<Step2DiabetesHistory />

<Step3CardiovascularHistory />

<Step4BloodPressure />

<Step5LipidProfile />

<Step6RenalFunction />

<Step7LifestyleFactors />

<Step8CurrentMedications />

<Step9ComplicationsScreening />

<Step10RiskAssessmentSummary />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={goToPrevious}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

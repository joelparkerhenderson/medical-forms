<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateVaccinationStatus } from '$lib/engine/vaccination-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2ImmunizationHistory from '$lib/components/steps/Step2ImmunizationHistory.svelte';
	import Step3ChildhoodVaccinations from '$lib/components/steps/Step3ChildhoodVaccinations.svelte';
	import Step4AdultVaccinations from '$lib/components/steps/Step4AdultVaccinations.svelte';
	import Step5TravelVaccinations from '$lib/components/steps/Step5TravelVaccinations.svelte';
	import Step6OccupationalVaccinations from '$lib/components/steps/Step6OccupationalVaccinations.svelte';
	import Step7ContraindicationsAllergies from '$lib/components/steps/Step7ContraindicationsAllergies.svelte';
	import Step8ConsentInformation from '$lib/components/steps/Step8ConsentInformation.svelte';
	import Step9AdministrationRecord from '$lib/components/steps/Step9AdministrationRecord.svelte';
	import Step10ClinicalReview from '$lib/components/steps/Step10ClinicalReview.svelte';

	function submitForm() {
			const { level, score, firedRules } = calculateVaccinationStatus(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				vaccinationLevel: level,
				vaccinationScore: score,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2ImmunizationHistory />

<Step3ChildhoodVaccinations />

<Step4AdultVaccinations />

<Step5TravelVaccinations />

<Step6OccupationalVaccinations />

<Step7ContraindicationsAllergies />

<Step8ConsentInformation />

<Step9AdministrationRecord />

<Step10ClinicalReview />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitForm}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

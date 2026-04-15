<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateDMFT } from '$lib/engine/dmft-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DentalHistory from '$lib/components/steps/Step3DentalHistory.svelte';
	import Step4DMFTAssessment from '$lib/components/steps/Step4DMFTAssessment.svelte';
	import Step5PeriodontalAssessment from '$lib/components/steps/Step5PeriodontalAssessment.svelte';
	import Step6OralExamination from '$lib/components/steps/Step6OralExamination.svelte';
	import Step7MedicalHistory from '$lib/components/steps/Step7MedicalHistory.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9RadiographicFindings from '$lib/components/steps/Step9RadiographicFindings.svelte';

	function submitAssessment() {
			const { dmftScore, dmftCategory, firedRules } = calculateDMFT(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				dmftScore,
				dmftCategory,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3DentalHistory />

<Step4DMFTAssessment />

<Step5PeriodontalAssessment />

<Step6OralExamination />

<Step7MedicalHistory />

<Step8CurrentMedications />

<Step9RadiographicFindings />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

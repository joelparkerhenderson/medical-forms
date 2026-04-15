<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateMRC } from '$lib/engine/mrc-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DyspnoeaAssessment from '$lib/components/steps/Step3DyspnoeaAssessment.svelte';
	import Step4CoughAssessment from '$lib/components/steps/Step4CoughAssessment.svelte';
	import Step5RespiratoryHistory from '$lib/components/steps/Step5RespiratoryHistory.svelte';
	import Step6PulmonaryFunction from '$lib/components/steps/Step6PulmonaryFunction.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8Allergies from '$lib/components/steps/Step8Allergies.svelte';
	import Step9SmokingExposures from '$lib/components/steps/Step9SmokingExposures.svelte';
	import Step10SleepFunctional from '$lib/components/steps/Step10SleepFunctional.svelte';

	function submitAssessment() {
			const { mrcGrade, firedRules } = calculateMRC(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				mrcGrade,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3DyspnoeaAssessment />

<Step4CoughAssessment />

<Step5RespiratoryHistory />

<Step6PulmonaryFunction />

<Step7CurrentMedications />

<Step8Allergies />

<Step9SmokingExposures />

<Step10SleepFunctional />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

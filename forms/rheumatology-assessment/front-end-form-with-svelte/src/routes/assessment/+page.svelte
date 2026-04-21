<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateDAS28 } from '$lib/engine/das28-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3JointAssessment from '$lib/components/steps/Step3JointAssessment.svelte';
	import Step4DiseaseHistory from '$lib/components/steps/Step4DiseaseHistory.svelte';
	import Step5ExtraArticular from '$lib/components/steps/Step5ExtraArticular.svelte';
	import Step6LaboratoryResults from '$lib/components/steps/Step6LaboratoryResults.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8Allergies from '$lib/components/steps/Step8Allergies.svelte';
	import Step9FunctionalAssessment from '$lib/components/steps/Step9FunctionalAssessment.svelte';
	import Step10ComorbiditiesSocial from '$lib/components/steps/Step10ComorbiditiesSocial.svelte';

	function submitAssessment() {
			const { das28Score, diseaseActivity, firedRules } = calculateDAS28(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				das28Score,
				diseaseActivity,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3JointAssessment />

<Step4DiseaseHistory />

<Step5ExtraArticular />

<Step6LaboratoryResults />

<Step7CurrentMedications />

<Step8Allergies />

<Step9FunctionalAssessment />

<Step10ComorbiditiesSocial />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

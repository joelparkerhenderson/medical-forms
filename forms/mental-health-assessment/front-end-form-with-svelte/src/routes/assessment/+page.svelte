<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { gradeAssessment } from '$lib/engine/mh-grader';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PhqDepression from '$lib/components/steps/Step2PhqDepression.svelte';
	import Step3GadAnxiety from '$lib/components/steps/Step3GadAnxiety.svelte';
	import Step4MoodAffect from '$lib/components/steps/Step4MoodAffect.svelte';
	import Step5RiskAssessment from '$lib/components/steps/Step5RiskAssessment.svelte';
	import Step6SubstanceUse from '$lib/components/steps/Step6SubstanceUse.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8TreatmentHistory from '$lib/components/steps/Step8TreatmentHistory.svelte';
	import Step9SocialFunctional from '$lib/components/steps/Step9SocialFunctional.svelte';

	function submitAssessment() {
			const result = gradeAssessment(assessment.data);
			assessment.result = result;
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2PhqDepression />

<Step3GadAnxiety />

<Step4MoodAffect />

<Step5RiskAssessment />

<Step6SubstanceUse />

<Step7CurrentMedications />

<Step8TreatmentHistory />

<Step9SocialFunctional />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

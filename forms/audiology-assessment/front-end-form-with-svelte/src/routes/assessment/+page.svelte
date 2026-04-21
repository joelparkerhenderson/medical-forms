<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateHearingGrade } from '$lib/engine/hearing-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3HearingHistory from '$lib/components/steps/Step3HearingHistory.svelte';
	import Step4AudiometricResults from '$lib/components/steps/Step4AudiometricResults.svelte';
	import Step5TinnitusAssessment from '$lib/components/steps/Step5TinnitusAssessment.svelte';
	import Step6VestibularSymptoms from '$lib/components/steps/Step6VestibularSymptoms.svelte';
	import Step7OtoscopicFindings from '$lib/components/steps/Step7OtoscopicFindings.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9FunctionalCommunication from '$lib/components/steps/Step9FunctionalCommunication.svelte';

	function submitAssessment() {
			const { hearingGrade, firedRules } = calculateHearingGrade(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				hearingGrade,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3HearingHistory />

<Step4AudiometricResults />

<Step5TinnitusAssessment />

<Step6VestibularSymptoms />

<Step7OtoscopicFindings />

<Step8MedicalHistory />

<Step9FunctionalCommunication />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

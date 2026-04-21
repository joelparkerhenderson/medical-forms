<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateNIHSS } from '$lib/engine/nihss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3NIHSSAssessment from '$lib/components/steps/Step3NIHSSAssessment.svelte';
	import Step4HeadacheAssessment from '$lib/components/steps/Step4HeadacheAssessment.svelte';
	import Step5SeizureHistory from '$lib/components/steps/Step5SeizureHistory.svelte';
	import Step6MotorSensoryExam from '$lib/components/steps/Step6MotorSensoryExam.svelte';
	import Step7CognitiveAssessment from '$lib/components/steps/Step7CognitiveAssessment.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9DiagnosticResults from '$lib/components/steps/Step9DiagnosticResults.svelte';
	import Step10FunctionalSocial from '$lib/components/steps/Step10FunctionalSocial.svelte';

	function submitAssessment() {
			const { nihssScore, nihssSeverity, firedRules } = calculateNIHSS(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				nihssScore,
				nihssSeverity,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3NIHSSAssessment />

<Step4HeadacheAssessment />

<Step5SeizureHistory />

<Step6MotorSensoryExam />

<Step7CognitiveAssessment />

<Step8CurrentMedications />

<Step9DiagnosticResults />

<Step10FunctionalSocial />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

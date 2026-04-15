<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateMRS, classifyHRTRisk } from '$lib/engine/mrs-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2MenopauseStatus from '$lib/components/steps/Step2MenopauseStatus.svelte';
	import Step3MRSSymptomScale from '$lib/components/steps/Step3MRSSymptomScale.svelte';
	import Step4VasomotorSymptoms from '$lib/components/steps/Step4VasomotorSymptoms.svelte';
	import Step5BoneHealth from '$lib/components/steps/Step5BoneHealth.svelte';
	import Step6CardiovascularRisk from '$lib/components/steps/Step6CardiovascularRisk.svelte';
	import Step7BreastHealth from '$lib/components/steps/Step7BreastHealth.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9ContraindicationsScreen from '$lib/components/steps/Step9ContraindicationsScreen.svelte';
	import Step10TreatmentPreferences from '$lib/components/steps/Step10TreatmentPreferences.svelte';

	function submitAssessment() {
			const { mrsResult, firedRules } = calculateMRS(assessment.data);
			const riskClassification = classifyHRTRisk(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				mrsResult,
				riskClassification,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2MenopauseStatus />

<Step3MRSSymptomScale />

<Step4VasomotorSymptoms />

<Step5BoneHealth />

<Step6CardiovascularRisk />

<Step7BreastHealth />

<Step8CurrentMedications />

<Step9ContraindicationsScreen />

<Step10TreatmentPreferences />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

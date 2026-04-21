<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateControl } from '$lib/engine/diabetes-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2DiabetesHistory from '$lib/components/steps/Step2DiabetesHistory.svelte';
	import Step3GlycaemicControl from '$lib/components/steps/Step3GlycaemicControl.svelte';
	import Step4Medications from '$lib/components/steps/Step4Medications.svelte';
	import Step5ComplicationsScreening from '$lib/components/steps/Step5ComplicationsScreening.svelte';
	import Step6CardiovascularRisk from '$lib/components/steps/Step6CardiovascularRisk.svelte';
	import Step7SelfCareLifestyle from '$lib/components/steps/Step7SelfCareLifestyle.svelte';
	import Step8PsychologicalWellbeing from '$lib/components/steps/Step8PsychologicalWellbeing.svelte';
	import Step9FootAssessment from '$lib/components/steps/Step9FootAssessment.svelte';
	import Step10ReviewCarePlan from '$lib/components/steps/Step10ReviewCarePlan.svelte';

	function submitAssessment() {
			const { controlLevel, controlScore, firedRules } = calculateControl(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				controlLevel,
				controlScore,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2DiabetesHistory />

<Step3GlycaemicControl />

<Step4Medications />

<Step5ComplicationsScreening />

<Step6CardiovascularRisk />

<Step7SelfCareLifestyle />

<Step8PsychologicalWellbeing />

<Step9FootAssessment />

<Step10ReviewCarePlan />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

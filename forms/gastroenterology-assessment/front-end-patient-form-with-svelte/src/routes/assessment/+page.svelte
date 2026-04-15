<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateGISeverity } from '$lib/engine/gi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3UpperGISymptoms from '$lib/components/steps/Step3UpperGISymptoms.svelte';
	import Step4LowerGISymptoms from '$lib/components/steps/Step4LowerGISymptoms.svelte';
	import Step5AbdominalPain from '$lib/components/steps/Step5AbdominalPain.svelte';
	import Step6LiverPancreas from '$lib/components/steps/Step6LiverPancreas.svelte';
	import Step7PreviousGIHistory from '$lib/components/steps/Step7PreviousGIHistory.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9AllergiesDiet from '$lib/components/steps/Step9AllergiesDiet.svelte';
	import Step10RedFlagsSocial from '$lib/components/steps/Step10RedFlagsSocial.svelte';

	function submitAssessment() {
			const { severityScore, severityLevel, firedRules } = calculateGISeverity(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				severityScore,
				severityLevel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3UpperGISymptoms />

<Step4LowerGISymptoms />

<Step5AbdominalPain />

<Step6LiverPancreas />

<Step7PreviousGIHistory />

<Step8CurrentMedications />

<Step9AllergiesDiet />

<Step10RedFlagsSocial />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

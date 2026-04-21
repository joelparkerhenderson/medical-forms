<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateVisualAcuityGrade } from '$lib/engine/va-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3VisualAcuity from '$lib/components/steps/Step3VisualAcuity.svelte';
	import Step4OcularHistory from '$lib/components/steps/Step4OcularHistory.svelte';
	import Step5AnteriorSegment from '$lib/components/steps/Step5AnteriorSegment.svelte';
	import Step6PosteriorSegment from '$lib/components/steps/Step6PosteriorSegment.svelte';
	import Step7VisualFieldPupils from '$lib/components/steps/Step7VisualFieldPupils.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9SystemicConditions from '$lib/components/steps/Step9SystemicConditions.svelte';
	import Step10FunctionalImpact from '$lib/components/steps/Step10FunctionalImpact.svelte';

	function submitAssessment() {
			const { vaGrade, firedRules } = calculateVisualAcuityGrade(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				vaGrade,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3VisualAcuity />

<Step4OcularHistory />

<Step5AnteriorSegment />

<Step6PosteriorSegment />

<Step7VisualFieldPupils />

<Step8CurrentMedications />

<Step9SystemicConditions />

<Step10FunctionalImpact />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

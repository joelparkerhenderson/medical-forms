<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateDASH } from '$lib/engine/dash-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3PainAssessment from '$lib/components/steps/Step3PainAssessment.svelte';
	import Step4DASHQuestionnaire from '$lib/components/steps/Step4DASHQuestionnaire.svelte';
	import Step5RangeOfMotion from '$lib/components/steps/Step5RangeOfMotion.svelte';
	import Step6StrengthTesting from '$lib/components/steps/Step6StrengthTesting.svelte';
	import Step7FunctionalLimitations from '$lib/components/steps/Step7FunctionalLimitations.svelte';
	import Step8ImagingHistory from '$lib/components/steps/Step8ImagingHistory.svelte';
	import Step9CurrentTreatment from '$lib/components/steps/Step9CurrentTreatment.svelte';
	import Step10SurgicalHistory from '$lib/components/steps/Step10SurgicalHistory.svelte';

	const stepNumber = $derived(Number($page.params.step));
	const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
	const visibleSteps = $derived(getVisibleSteps());
	const isLast = $derived(visibleSteps[visibleSteps.length - 1]?.number === stepNumber);
	const nextStep = $derived(getNextStep(stepNumber));
	const prevStep = $derived(getPrevStep(stepNumber));
	const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
	const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

	$effect(() => {
		assessment.currentStep = stepNumber;
	});

	function submitAssessment() {
		const { dashScore, dashCategoryLabel, firedRules } = calculateDASH(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			dashScore,
			dashCategory: dashCategoryLabel,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ChiefComplaint />
	{:else if stepNumber === 3}
		<Step3PainAssessment />
	{:else if stepNumber === 4}
		<Step4DASHQuestionnaire />
	{:else if stepNumber === 5}
		<Step5RangeOfMotion />
	{:else if stepNumber === 6}
		<Step6StrengthTesting />
	{:else if stepNumber === 7}
		<Step7FunctionalLimitations />
	{:else if stepNumber === 8}
		<Step8ImagingHistory />
	{:else if stepNumber === 9}
		<Step9CurrentTreatment />
	{:else if stepNumber === 10}
		<Step10SurgicalHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateGISeverity } from '$lib/engine/gi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

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

	const stepNumber = $derived(Number($page.params.step));
	const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
	const visibleSteps = $derived(getVisibleSteps(assessment.data));
	const isLast = $derived(visibleSteps[visibleSteps.length - 1]?.number === stepNumber);
	const nextStep = $derived(getNextStep(stepNumber, assessment.data));
	const prevStep = $derived(getPrevStep(stepNumber, assessment.data));
	const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
	const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

	$effect(() => {
		assessment.currentStep = stepNumber;
	});

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

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ChiefComplaint />
	{:else if stepNumber === 3}
		<Step3UpperGISymptoms />
	{:else if stepNumber === 4}
		<Step4LowerGISymptoms />
	{:else if stepNumber === 5}
		<Step5AbdominalPain />
	{:else if stepNumber === 6}
		<Step6LiverPancreas />
	{:else if stepNumber === 7}
		<Step7PreviousGIHistory />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9AllergiesDiet />
	{:else if stepNumber === 10}
		<Step10RedFlagsSocial />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

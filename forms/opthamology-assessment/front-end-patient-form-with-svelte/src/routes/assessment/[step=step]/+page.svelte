<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateVisualAcuityGrade } from '$lib/engine/va-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

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

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ChiefComplaint />
	{:else if stepNumber === 3}
		<Step3VisualAcuity />
	{:else if stepNumber === 4}
		<Step4OcularHistory />
	{:else if stepNumber === 5}
		<Step5AnteriorSegment />
	{:else if stepNumber === 6}
		<Step6PosteriorSegment />
	{:else if stepNumber === 7}
		<Step7VisualFieldPupils />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9SystemicConditions />
	{:else if stepNumber === 10}
		<Step10FunctionalImpact />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateCFS } from '$lib/engine/cfs-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2FunctionalAssessment from '$lib/components/steps/Step2FunctionalAssessment.svelte';
	import Step3CognitiveScreen from '$lib/components/steps/Step3CognitiveScreen.svelte';
	import Step4MobilityFalls from '$lib/components/steps/Step4MobilityFalls.svelte';
	import Step5Nutrition from '$lib/components/steps/Step5Nutrition.svelte';
	import Step6PolypharmacyReview from '$lib/components/steps/Step6PolypharmacyReview.svelte';
	import Step7Comorbidities from '$lib/components/steps/Step7Comorbidities.svelte';
	import Step8Psychosocial from '$lib/components/steps/Step8Psychosocial.svelte';
	import Step9ContinenceSkin from '$lib/components/steps/Step9ContinenceSkin.svelte';

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
		const { cfsScore, firedRules } = calculateCFS(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			cfsScore,
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
		<Step2FunctionalAssessment />
	{:else if stepNumber === 3}
		<Step3CognitiveScreen />
	{:else if stepNumber === 4}
		<Step4MobilityFalls />
	{:else if stepNumber === 5}
		<Step5Nutrition />
	{:else if stepNumber === 6}
		<Step6PolypharmacyReview />
	{:else if stepNumber === 7}
		<Step7Comorbidities />
	{:else if stepNumber === 8}
		<Step8Psychosocial />
	{:else if stepNumber === 9}
		<Step9ContinenceSkin />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateACT } from '$lib/engine/act-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomFrequency from '$lib/components/steps/Step2SymptomFrequency.svelte';
	import Step3LungFunction from '$lib/components/steps/Step3LungFunction.svelte';
	import Step4Triggers from '$lib/components/steps/Step4Triggers.svelte';
	import Step5CurrentMedications from '$lib/components/steps/Step5CurrentMedications.svelte';
	import Step6Allergies from '$lib/components/steps/Step6Allergies.svelte';
	import Step7ExacerbationHistory from '$lib/components/steps/Step7ExacerbationHistory.svelte';
	import Step8Comorbidities from '$lib/components/steps/Step8Comorbidities.svelte';
	import Step9SocialHistory from '$lib/components/steps/Step9SocialHistory.svelte';

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
		const { actScore, controlLevel, firedRules } = calculateACT(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			actScore,
			controlLevel,
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
		<Step2SymptomFrequency />
	{:else if stepNumber === 3}
		<Step3LungFunction />
	{:else if stepNumber === 4}
		<Step4Triggers />
	{:else if stepNumber === 5}
		<Step5CurrentMedications />
	{:else if stepNumber === 6}
		<Step6Allergies />
	{:else if stepNumber === 7}
		<Step7ExacerbationHistory />
	{:else if stepNumber === 8}
		<Step8Comorbidities />
	{:else if stepNumber === 9}
		<Step9SocialHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

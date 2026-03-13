<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateCardioGrade } from '$lib/engine/cardio-grader';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChestPainAngina from '$lib/components/steps/Step2ChestPainAngina.svelte';
	import Step3HeartFailureSymptoms from '$lib/components/steps/Step3HeartFailureSymptoms.svelte';
	import Step4CardiacHistory from '$lib/components/steps/Step4CardiacHistory.svelte';
	import Step5ArrhythmiaConduction from '$lib/components/steps/Step5ArrhythmiaConduction.svelte';
	import Step6RiskFactors from '$lib/components/steps/Step6RiskFactors.svelte';
	import Step7DiagnosticResults from '$lib/components/steps/Step7DiagnosticResults.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9Allergies from '$lib/components/steps/Step9Allergies.svelte';
	import Step10SocialFunctional from '$lib/components/steps/Step10SocialFunctional.svelte';

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
		const result = calculateCardioGrade(assessment.data);
		assessment.result = result;
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ChestPainAngina />
	{:else if stepNumber === 3}
		<Step3HeartFailureSymptoms />
	{:else if stepNumber === 4}
		<Step4CardiacHistory />
	{:else if stepNumber === 5}
		<Step5ArrhythmiaConduction />
	{:else if stepNumber === 6}
		<Step6RiskFactors />
	{:else if stepNumber === 7}
		<Step7DiagnosticResults />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9Allergies />
	{:else if stepNumber === 10}
		<Step10SocialFunctional />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

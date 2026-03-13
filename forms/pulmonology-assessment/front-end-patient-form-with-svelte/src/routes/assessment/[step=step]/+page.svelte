<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateGold } from '$lib/engine/gold-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3Spirometry from '$lib/components/steps/Step3Spirometry.svelte';
	import Step4SymptomAssessment from '$lib/components/steps/Step4SymptomAssessment.svelte';
	import Step5ExacerbationHistory from '$lib/components/steps/Step5ExacerbationHistory.svelte';
	import Step6CurrentMedications from '$lib/components/steps/Step6CurrentMedications.svelte';
	import Step7Allergies from '$lib/components/steps/Step7Allergies.svelte';
	import Step8Comorbidities from '$lib/components/steps/Step8Comorbidities.svelte';
	import Step9SmokingExposures from '$lib/components/steps/Step9SmokingExposures.svelte';
	import Step10FunctionalStatus from '$lib/components/steps/Step10FunctionalStatus.svelte';

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
		const { goldStage, abcdGroup, firedRules } = calculateGold(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			goldStage,
			abcdGroup,
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
		<Step3Spirometry />
	{:else if stepNumber === 4}
		<Step4SymptomAssessment />
	{:else if stepNumber === 5}
		<Step5ExacerbationHistory />
	{:else if stepNumber === 6}
		<Step6CurrentMedications />
	{:else if stepNumber === 7}
		<Step7Allergies />
	{:else if stepNumber === 8}
		<Step8Comorbidities />
	{:else if stepNumber === 9}
		<Step9SmokingExposures />
	{:else if stepNumber === 10}
		<Step10FunctionalStatus />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateAllergySeverity, calculateAllergyBurden } from '$lib/engine/allergy-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2AllergyHistory from '$lib/components/steps/Step2AllergyHistory.svelte';
	import Step3DrugAllergies from '$lib/components/steps/Step3DrugAllergies.svelte';
	import Step4FoodAllergies from '$lib/components/steps/Step4FoodAllergies.svelte';
	import Step5EnvironmentalAllergies from '$lib/components/steps/Step5EnvironmentalAllergies.svelte';
	import Step6AnaphylaxisHistory from '$lib/components/steps/Step6AnaphylaxisHistory.svelte';
	import Step7TestingResults from '$lib/components/steps/Step7TestingResults.svelte';
	import Step8CurrentManagement from '$lib/components/steps/Step8CurrentManagement.svelte';
	import Step9Comorbidities from '$lib/components/steps/Step9Comorbidities.svelte';
	import Step10ImpactActionPlan from '$lib/components/steps/Step10ImpactActionPlan.svelte';

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
		const { severityLevel, firedRules } = calculateAllergySeverity(assessment.data);
		const allergyBurdenScore = calculateAllergyBurden(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			severityLevel,
			allergyBurdenScore,
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
		<Step2AllergyHistory />
	{:else if stepNumber === 3}
		<Step3DrugAllergies />
	{:else if stepNumber === 4}
		<Step4FoodAllergies />
	{:else if stepNumber === 5}
		<Step5EnvironmentalAllergies />
	{:else if stepNumber === 6}
		<Step6AnaphylaxisHistory />
	{:else if stepNumber === 7}
		<Step7TestingResults />
	{:else if stepNumber === 8}
		<Step8CurrentManagement />
	{:else if stepNumber === 9}
		<Step9Comorbidities />
	{:else if stepNumber === 10}
		<Step10ImpactActionPlan />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

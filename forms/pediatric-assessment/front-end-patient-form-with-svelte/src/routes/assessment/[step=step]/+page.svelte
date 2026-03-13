<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateDevelopmentalScreen } from '$lib/engine/dev-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2BirthHistory from '$lib/components/steps/Step2BirthHistory.svelte';
	import Step3GrowthNutrition from '$lib/components/steps/Step3GrowthNutrition.svelte';
	import Step4DevelopmentalMilestones from '$lib/components/steps/Step4DevelopmentalMilestones.svelte';
	import Step5ImmunizationStatus from '$lib/components/steps/Step5ImmunizationStatus.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8FamilyHistory from '$lib/components/steps/Step8FamilyHistory.svelte';
	import Step9SocialEnvironmental from '$lib/components/steps/Step9SocialEnvironmental.svelte';

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
		const { overallResult, domainResults, firedRules } = calculateDevelopmentalScreen(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			overallResult,
			domainResults,
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
		<Step2BirthHistory />
	{:else if stepNumber === 3}
		<Step3GrowthNutrition />
	{:else if stepNumber === 4}
		<Step4DevelopmentalMilestones />
	{:else if stepNumber === 5}
		<Step5ImmunizationStatus />
	{:else if stepNumber === 6}
		<Step6MedicalHistory />
	{:else if stepNumber === 7}
		<Step7CurrentMedications />
	{:else if stepNumber === 8}
		<Step8FamilyHistory />
	{:else if stepNumber === 9}
		<Step9SocialEnvironmental />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

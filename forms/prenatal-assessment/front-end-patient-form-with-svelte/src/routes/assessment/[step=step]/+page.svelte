<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PregnancyDetails from '$lib/components/steps/Step2PregnancyDetails.svelte';
	import Step3ObstetricHistory from '$lib/components/steps/Step3ObstetricHistory.svelte';
	import Step4MedicalHistory from '$lib/components/steps/Step4MedicalHistory.svelte';
	import Step5CurrentSymptoms from '$lib/components/steps/Step5CurrentSymptoms.svelte';
	import Step6VitalSigns from '$lib/components/steps/Step6VitalSigns.svelte';
	import Step7LaboratoryResults from '$lib/components/steps/Step7LaboratoryResults.svelte';
	import Step8LifestyleNutrition from '$lib/components/steps/Step8LifestyleNutrition.svelte';
	import Step9MentalHealth from '$lib/components/steps/Step9MentalHealth.svelte';
	import Step10BirthPlan from '$lib/components/steps/Step10BirthPlan.svelte';

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
		const { riskScore, riskLevel, firedRules } = calculateRisk(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			riskScore,
			riskLevel,
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
		<Step2PregnancyDetails />
	{:else if stepNumber === 3}
		<Step3ObstetricHistory />
	{:else if stepNumber === 4}
		<Step4MedicalHistory />
	{:else if stepNumber === 5}
		<Step5CurrentSymptoms />
	{:else if stepNumber === 6}
		<Step6VitalSigns />
	{:else if stepNumber === 7}
		<Step7LaboratoryResults />
	{:else if stepNumber === 8}
		<Step8LifestyleNutrition />
	{:else if stepNumber === 9}
		<Step9MentalHealth />
	{:else if stepNumber === 10}
		<Step10BirthPlan />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

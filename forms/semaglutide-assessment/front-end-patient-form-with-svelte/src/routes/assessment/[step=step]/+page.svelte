<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { evaluateEligibility } from '$lib/engine/eligibility-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2IndicationGoals from '$lib/components/steps/Step2IndicationGoals.svelte';
	import Step3BodyComposition from '$lib/components/steps/Step3BodyComposition.svelte';
	import Step4MetabolicProfile from '$lib/components/steps/Step4MetabolicProfile.svelte';
	import Step5CardiovascularRisk from '$lib/components/steps/Step5CardiovascularRisk.svelte';
	import Step6ContraindicationsScreening from '$lib/components/steps/Step6ContraindicationsScreening.svelte';
	import Step7GastrointestinalHistory from '$lib/components/steps/Step7GastrointestinalHistory.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9MentalHealthScreening from '$lib/components/steps/Step9MentalHealthScreening.svelte';
	import Step10TreatmentPlan from '$lib/components/steps/Step10TreatmentPlan.svelte';

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
		const { eligibilityStatus, bmi, bmiCategoryLabel, absoluteContraindications, relativeContraindications } = evaluateEligibility(assessment.data);
		const monitoringFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			eligibilityStatus,
			bmi,
			bmiCategory: bmiCategoryLabel,
			absoluteContraindications,
			relativeContraindications,
			monitoringFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2IndicationGoals />
	{:else if stepNumber === 3}
		<Step3BodyComposition />
	{:else if stepNumber === 4}
		<Step4MetabolicProfile />
	{:else if stepNumber === 5}
		<Step5CardiovascularRisk />
	{:else if stepNumber === 6}
		<Step6ContraindicationsScreening />
	{:else if stepNumber === 7}
		<Step7GastrointestinalHistory />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9MentalHealthScreening />
	{:else if stepNumber === 10}
		<Step10TreatmentPlan />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

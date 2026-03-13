<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2Demographics from '$lib/components/steps/Step2Demographics.svelte';
	import Step3BloodPressure from '$lib/components/steps/Step3BloodPressure.svelte';
	import Step4CholesterolLipids from '$lib/components/steps/Step4CholesterolLipids.svelte';
	import Step5MetabolicHealth from '$lib/components/steps/Step5MetabolicHealth.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
	import Step7SmokingHistory from '$lib/components/steps/Step7SmokingHistory.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10ReviewCalculate from '$lib/components/steps/Step10ReviewCalculate.svelte';

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
		const result = calculateRisk(assessment.data);
		assessment.result = result;
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PatientInformation />
	{:else if stepNumber === 2}
		<Step2Demographics />
	{:else if stepNumber === 3}
		<Step3BloodPressure />
	{:else if stepNumber === 4}
		<Step4CholesterolLipids />
	{:else if stepNumber === 5}
		<Step5MetabolicHealth />
	{:else if stepNumber === 6}
		<Step6RenalFunction />
	{:else if stepNumber === 7}
		<Step7SmokingHistory />
	{:else if stepNumber === 8}
		<Step8MedicalHistory />
	{:else if stepNumber === 9}
		<Step9CurrentMedications />
	{:else if stepNumber === 10}
		<Step10ReviewCalculate />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep } from '$lib/config/steps';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2DemographicsEthnicity from '$lib/components/steps/Step2DemographicsEthnicity.svelte';
	import Step3BloodPressure from '$lib/components/steps/Step3BloodPressure.svelte';
	import Step4Cholesterol from '$lib/components/steps/Step4Cholesterol.svelte';
	import Step5MedicalConditions from '$lib/components/steps/Step5MedicalConditions.svelte';
	import Step6FamilyHistory from '$lib/components/steps/Step6FamilyHistory.svelte';
	import Step7SmokingAlcohol from '$lib/components/steps/Step7SmokingAlcohol.svelte';
	import Step8PhysicalActivityDiet from '$lib/components/steps/Step8PhysicalActivityDiet.svelte';
	import Step9BodyMeasurements from '$lib/components/steps/Step9BodyMeasurements.svelte';
	import Step10ReviewCalculate from '$lib/components/steps/Step10ReviewCalculate.svelte';

	const stepNumber = $derived(Number($page.params.step));
	const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
	const isLast = $derived(stepNumber === steps[steps.length - 1].number);
	const nextStep = $derived(getNextStep(stepNumber));
	const prevStep = $derived(getPrevStep(stepNumber));
	const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
	const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

	$effect(() => {
		assessment.currentStep = stepNumber;
	});

	function submitAssessment() {
		const risk = calculateRisk(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			riskCategory: risk.riskCategory,
			tenYearRiskPercent: risk.tenYearRiskPercent,
			heartAge: risk.heartAge,
			firedRules: risk.firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PatientInformation />
	{:else if stepNumber === 2}
		<Step2DemographicsEthnicity />
	{:else if stepNumber === 3}
		<Step3BloodPressure />
	{:else if stepNumber === 4}
		<Step4Cholesterol />
	{:else if stepNumber === 5}
		<Step5MedicalConditions />
	{:else if stepNumber === 6}
		<Step6FamilyHistory />
	{:else if stepNumber === 7}
		<Step7SmokingAlcohol />
	{:else if stepNumber === 8}
		<Step8PhysicalActivityDiet />
	{:else if stepNumber === 9}
		<Step9BodyMeasurements />
	{:else if stepNumber === 10}
		<Step10ReviewCalculate />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

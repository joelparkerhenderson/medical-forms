<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2Demographics from '$lib/components/steps/Step2Demographics.svelte';
	import Step3SmokingHistory from '$lib/components/steps/Step3SmokingHistory.svelte';
	import Step4BloodPressure from '$lib/components/steps/Step4BloodPressure.svelte';
	import Step5Cholesterol from '$lib/components/steps/Step5Cholesterol.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7FamilyHistory from '$lib/components/steps/Step7FamilyHistory.svelte';
	import Step8LifestyleFactors from '$lib/components/steps/Step8LifestyleFactors.svelte';
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
		const { riskCategory, tenYearRiskPercent, firedRules } = calculateRisk(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			riskCategory,
			tenYearRiskPercent,
			firedRules,
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
		<Step2Demographics />
	{:else if stepNumber === 3}
		<Step3SmokingHistory />
	{:else if stepNumber === 4}
		<Step4BloodPressure />
	{:else if stepNumber === 5}
		<Step5Cholesterol />
	{:else if stepNumber === 6}
		<Step6MedicalHistory />
	{:else if stepNumber === 7}
		<Step7FamilyHistory />
	{:else if stepNumber === 8}
		<Step8LifestyleFactors />
	{:else if stepNumber === 9}
		<Step9CurrentMedications />
	{:else if stepNumber === 10}
		<Step10ReviewCalculate />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

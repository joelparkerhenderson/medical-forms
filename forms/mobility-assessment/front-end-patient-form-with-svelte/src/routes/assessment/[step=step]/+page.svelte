<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateTinetti } from '$lib/engine/tinetti-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3FallHistory from '$lib/components/steps/Step3FallHistory.svelte';
	import Step4BalanceAssessment from '$lib/components/steps/Step4BalanceAssessment.svelte';
	import Step5GaitAssessment from '$lib/components/steps/Step5GaitAssessment.svelte';
	import Step6TimedUpAndGo from '$lib/components/steps/Step6TimedUpAndGo.svelte';
	import Step7RangeOfMotion from '$lib/components/steps/Step7RangeOfMotion.svelte';
	import Step8AssistiveDevices from '$lib/components/steps/Step8AssistiveDevices.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10FunctionalIndependence from '$lib/components/steps/Step10FunctionalIndependence.svelte';

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
		const { tinettiTotal, balanceScore, gaitScore, tinettiCategoryLabel, firedRules } = calculateTinetti(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			tinettiTotal,
			balanceScore,
			gaitScore,
			tinettiCategory: tinettiCategoryLabel,
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
		<Step2ReferralInfo />
	{:else if stepNumber === 3}
		<Step3FallHistory />
	{:else if stepNumber === 4}
		<Step4BalanceAssessment />
	{:else if stepNumber === 5}
		<Step5GaitAssessment />
	{:else if stepNumber === 6}
		<Step6TimedUpAndGo />
	{:else if stepNumber === 7}
		<Step7RangeOfMotion />
	{:else if stepNumber === 8}
		<Step8AssistiveDevices />
	{:else if stepNumber === 9}
		<Step9CurrentMedications />
	{:else if stepNumber === 10}
		<Step10FunctionalIndependence />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

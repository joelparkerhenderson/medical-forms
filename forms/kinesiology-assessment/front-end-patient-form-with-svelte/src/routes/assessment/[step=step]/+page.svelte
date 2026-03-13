<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateFMS } from '$lib/engine/fms-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInformation from '$lib/components/steps/Step2ReferralInformation.svelte';
	import Step3MovementHistory from '$lib/components/steps/Step3MovementHistory.svelte';
	import Step4DeepSquat from '$lib/components/steps/Step4DeepSquat.svelte';
	import Step5HurdleStep from '$lib/components/steps/Step5HurdleStep.svelte';
	import Step6InLineLunge from '$lib/components/steps/Step6InLineLunge.svelte';
	import Step7ShoulderMobility from '$lib/components/steps/Step7ShoulderMobility.svelte';
	import Step8ActiveStraightLegRaise from '$lib/components/steps/Step8ActiveStraightLegRaise.svelte';
	import Step9TrunkStabilityPushUp from '$lib/components/steps/Step9TrunkStabilityPushUp.svelte';
	import Step10RotaryStability from '$lib/components/steps/Step10RotaryStability.svelte';

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
		const { fmsScore, fmsCategoryLabel, firedRules } = calculateFMS(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			fmsScore,
			fmsCategory: fmsCategoryLabel,
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
		<Step2ReferralInformation />
	{:else if stepNumber === 3}
		<Step3MovementHistory />
	{:else if stepNumber === 4}
		<Step4DeepSquat />
	{:else if stepNumber === 5}
		<Step5HurdleStep />
	{:else if stepNumber === 6}
		<Step6InLineLunge />
	{:else if stepNumber === 7}
		<Step7ShoulderMobility />
	{:else if stepNumber === 8}
		<Step8ActiveStraightLegRaise />
	{:else if stepNumber === 9}
		<Step9TrunkStabilityPushUp />
	{:else if stepNumber === 10}
		<Step10RotaryStability />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

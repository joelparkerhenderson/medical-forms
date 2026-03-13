<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateMMSE } from '$lib/engine/mmse-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3Orientation from '$lib/components/steps/Step3Orientation.svelte';
	import Step4Registration from '$lib/components/steps/Step4Registration.svelte';
	import Step5AttentionCalculation from '$lib/components/steps/Step5AttentionCalculation.svelte';
	import Step6Recall from '$lib/components/steps/Step6Recall.svelte';
	import Step7Language from '$lib/components/steps/Step7Language.svelte';
	import Step8RepetitionCommands from '$lib/components/steps/Step8RepetitionCommands.svelte';
	import Step9Visuospatial from '$lib/components/steps/Step9Visuospatial.svelte';
	import Step10FunctionalHistory from '$lib/components/steps/Step10FunctionalHistory.svelte';

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
		const { mmseScore, mmseCategoryLabel, firedRules } = calculateMMSE(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			mmseScore,
			mmseCategory: mmseCategoryLabel,
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
		<Step3Orientation />
	{:else if stepNumber === 4}
		<Step4Registration />
	{:else if stepNumber === 5}
		<Step5AttentionCalculation />
	{:else if stepNumber === 6}
		<Step6Recall />
	{:else if stepNumber === 7}
		<Step7Language />
	{:else if stepNumber === 8}
		<Step8RepetitionCommands />
	{:else if stepNumber === 9}
		<Step9Visuospatial />
	{:else if stepNumber === 10}
		<Step10FunctionalHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

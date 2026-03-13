<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateSatisfaction } from '$lib/engine/satisfaction-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2VisitInformation from '$lib/components/steps/Step2VisitInformation.svelte';
	import Step3AccessScheduling from '$lib/components/steps/Step3AccessScheduling.svelte';
	import Step4Communication from '$lib/components/steps/Step4Communication.svelte';
	import Step5StaffProfessionalism from '$lib/components/steps/Step5StaffProfessionalism.svelte';
	import Step6CareQuality from '$lib/components/steps/Step6CareQuality.svelte';
	import Step7Environment from '$lib/components/steps/Step7Environment.svelte';
	import Step8OverallSatisfaction from '$lib/components/steps/Step8OverallSatisfaction.svelte';

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

	function submitSurvey() {
		const { compositeScore, category, domainScores, answeredCount } = calculateSatisfaction(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data, compositeScore);
		assessment.result = {
			compositeScore,
			category,
			domainScores,
			additionalFlags,
			answeredCount,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2VisitInformation />
	{:else if stepNumber === 3}
		<Step3AccessScheduling />
	{:else if stepNumber === 4}
		<Step4Communication />
	{:else if stepNumber === 5}
		<Step5StaffProfessionalism />
	{:else if stepNumber === 6}
		<Step6CareQuality />
	{:else if stepNumber === 7}
		<Step7Environment />
	{:else if stepNumber === 8}
		<Step8OverallSatisfaction />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitSurvey} />
{/if}

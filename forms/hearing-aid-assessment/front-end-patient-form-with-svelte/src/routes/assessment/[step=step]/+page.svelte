<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateHHIES } from '$lib/engine/hhies-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { hhiesCategory } from '$lib/engine/utils';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2HearingHistory from '$lib/components/steps/Step2HearingHistory.svelte';
	import Step3HHIESQuestionnaire from '$lib/components/steps/Step3HHIESQuestionnaire.svelte';
	import Step4CommunicationDifficulties from '$lib/components/steps/Step4CommunicationDifficulties.svelte';
	import Step5CurrentHearingAids from '$lib/components/steps/Step5CurrentHearingAids.svelte';
	import Step6EarExamination from '$lib/components/steps/Step6EarExamination.svelte';
	import Step7AudiogramResults from '$lib/components/steps/Step7AudiogramResults.svelte';
	import Step8LifestyleNeeds from '$lib/components/steps/Step8LifestyleNeeds.svelte';
	import Step9ExpectationsGoals from '$lib/components/steps/Step9ExpectationsGoals.svelte';

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
		const { hhiesScore, hhiesCategoryLabel, firedRules } = calculateHHIES(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			hhiesScore,
			hhiesCategory: hhiesCategoryLabel,
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
		<Step2HearingHistory />
	{:else if stepNumber === 3}
		<Step3HHIESQuestionnaire />
	{:else if stepNumber === 4}
		<Step4CommunicationDifficulties />
	{:else if stepNumber === 5}
		<Step5CurrentHearingAids />
	{:else if stepNumber === 6}
		<Step6EarExamination />
	{:else if stepNumber === 7}
		<Step7AudiogramResults />
	{:else if stepNumber === 8}
		<Step8LifestyleNeeds />
	{:else if stepNumber === 9}
		<Step9ExpectationsGoals />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

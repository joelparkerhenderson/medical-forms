<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateCOPM } from '$lib/engine/copm-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3SelfCareActivities from '$lib/components/steps/Step3SelfCareActivities.svelte';
	import Step4ProductivityActivities from '$lib/components/steps/Step4ProductivityActivities.svelte';
	import Step5LeisureActivities from '$lib/components/steps/Step5LeisureActivities.svelte';
	import Step6PerformanceRatings from '$lib/components/steps/Step6PerformanceRatings.svelte';
	import Step7SatisfactionRatings from '$lib/components/steps/Step7SatisfactionRatings.svelte';
	import Step8EnvironmentalFactors from '$lib/components/steps/Step8EnvironmentalFactors.svelte';
	import Step9PhysicalCognitiveStatus from '$lib/components/steps/Step9PhysicalCognitiveStatus.svelte';
	import Step10GoalsPriorities from '$lib/components/steps/Step10GoalsPriorities.svelte';

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
		const { performanceScore, satisfactionScore, performanceCategoryLabel, satisfactionCategoryLabel, firedRules } = calculateCOPM(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			performanceScore,
			satisfactionScore,
			performanceCategory: performanceCategoryLabel,
			satisfactionCategory: satisfactionCategoryLabel,
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
		<Step3SelfCareActivities />
	{:else if stepNumber === 4}
		<Step4ProductivityActivities />
	{:else if stepNumber === 5}
		<Step5LeisureActivities />
	{:else if stepNumber === 6}
		<Step6PerformanceRatings />
	{:else if stepNumber === 7}
		<Step7SatisfactionRatings />
	{:else if stepNumber === 8}
		<Step8EnvironmentalFactors />
	{:else if stepNumber === 9}
		<Step9PhysicalCognitiveStatus />
	{:else if stepNumber === 10}
		<Step10GoalsPriorities />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

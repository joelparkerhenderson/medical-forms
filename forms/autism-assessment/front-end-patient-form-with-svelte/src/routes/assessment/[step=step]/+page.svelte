<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateAQ10 } from '$lib/engine/aq10-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { aq10Category } from '$lib/engine/utils';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ScreeningPurpose from '$lib/components/steps/Step2ScreeningPurpose.svelte';
	import Step3AQ10Questionnaire from '$lib/components/steps/Step3AQ10Questionnaire.svelte';
	import Step4SocialCommunication from '$lib/components/steps/Step4SocialCommunication.svelte';
	import Step5RepetitiveBehaviors from '$lib/components/steps/Step5RepetitiveBehaviors.svelte';
	import Step6SensoryProfile from '$lib/components/steps/Step6SensoryProfile.svelte';
	import Step7DevelopmentalHistory from '$lib/components/steps/Step7DevelopmentalHistory.svelte';
	import Step8CurrentSupport from '$lib/components/steps/Step8CurrentSupport.svelte';
	import Step9FamilyHistory from '$lib/components/steps/Step9FamilyHistory.svelte';

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
		const { aq10Score, aq10CategoryLabel, firedRules } = calculateAQ10(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			aq10Score,
			aq10Category: aq10CategoryLabel,
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
		<Step2ScreeningPurpose />
	{:else if stepNumber === 3}
		<Step3AQ10Questionnaire />
	{:else if stepNumber === 4}
		<Step4SocialCommunication />
	{:else if stepNumber === 5}
		<Step5RepetitiveBehaviors />
	{:else if stepNumber === 6}
		<Step6SensoryProfile />
	{:else if stepNumber === 7}
		<Step7DevelopmentalHistory />
	{:else if stepNumber === 8}
		<Step8CurrentSupport />
	{:else if stepNumber === 9}
		<Step9FamilyHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

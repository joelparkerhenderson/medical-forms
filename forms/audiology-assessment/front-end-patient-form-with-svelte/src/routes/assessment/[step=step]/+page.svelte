<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateHearingGrade } from '$lib/engine/hearing-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3HearingHistory from '$lib/components/steps/Step3HearingHistory.svelte';
	import Step4AudiometricResults from '$lib/components/steps/Step4AudiometricResults.svelte';
	import Step5TinnitusAssessment from '$lib/components/steps/Step5TinnitusAssessment.svelte';
	import Step6VestibularSymptoms from '$lib/components/steps/Step6VestibularSymptoms.svelte';
	import Step7OtoscopicFindings from '$lib/components/steps/Step7OtoscopicFindings.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9FunctionalCommunication from '$lib/components/steps/Step9FunctionalCommunication.svelte';

	const stepNumber = $derived(Number($page.params.step));
	const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
	const visibleSteps = $derived(getVisibleSteps(assessment.data));
	const isLast = $derived(visibleSteps[visibleSteps.length - 1]?.number === stepNumber);
	const nextStep = $derived(getNextStep(stepNumber, assessment.data));
	const prevStep = $derived(getPrevStep(stepNumber, assessment.data));
	const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
	const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

	$effect(() => {
		assessment.currentStep = stepNumber;
	});

	function submitAssessment() {
		const { hearingGrade, firedRules } = calculateHearingGrade(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			hearingGrade,
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
		<Step2ChiefComplaint />
	{:else if stepNumber === 3}
		<Step3HearingHistory />
	{:else if stepNumber === 4}
		<Step4AudiometricResults />
	{:else if stepNumber === 5}
		<Step5TinnitusAssessment />
	{:else if stepNumber === 6}
		<Step6VestibularSymptoms />
	{:else if stepNumber === 7}
		<Step7OtoscopicFindings />
	{:else if stepNumber === 8}
		<Step8MedicalHistory />
	{:else if stepNumber === 9}
		<Step9FunctionalCommunication />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

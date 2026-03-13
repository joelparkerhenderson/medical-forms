<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateNIHSS } from '$lib/engine/nihss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3NIHSSAssessment from '$lib/components/steps/Step3NIHSSAssessment.svelte';
	import Step4HeadacheAssessment from '$lib/components/steps/Step4HeadacheAssessment.svelte';
	import Step5SeizureHistory from '$lib/components/steps/Step5SeizureHistory.svelte';
	import Step6MotorSensoryExam from '$lib/components/steps/Step6MotorSensoryExam.svelte';
	import Step7CognitiveAssessment from '$lib/components/steps/Step7CognitiveAssessment.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9DiagnosticResults from '$lib/components/steps/Step9DiagnosticResults.svelte';
	import Step10FunctionalSocial from '$lib/components/steps/Step10FunctionalSocial.svelte';

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
		const { nihssScore, nihssSeverity, firedRules } = calculateNIHSS(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			nihssScore,
			nihssSeverity,
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
		<Step3NIHSSAssessment />
	{:else if stepNumber === 4}
		<Step4HeadacheAssessment />
	{:else if stepNumber === 5}
		<Step5SeizureHistory />
	{:else if stepNumber === 6}
		<Step6MotorSensoryExam />
	{:else if stepNumber === 7}
		<Step7CognitiveAssessment />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9DiagnosticResults />
	{:else if stepNumber === 10}
		<Step10FunctionalSocial />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

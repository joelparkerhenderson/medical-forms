<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateMRC } from '$lib/engine/mrc-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DyspnoeaAssessment from '$lib/components/steps/Step3DyspnoeaAssessment.svelte';
	import Step4CoughAssessment from '$lib/components/steps/Step4CoughAssessment.svelte';
	import Step5RespiratoryHistory from '$lib/components/steps/Step5RespiratoryHistory.svelte';
	import Step6PulmonaryFunction from '$lib/components/steps/Step6PulmonaryFunction.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8Allergies from '$lib/components/steps/Step8Allergies.svelte';
	import Step9SmokingExposures from '$lib/components/steps/Step9SmokingExposures.svelte';
	import Step10SleepFunctional from '$lib/components/steps/Step10SleepFunctional.svelte';

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
		const { mrcGrade, firedRules } = calculateMRC(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			mrcGrade,
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
		<Step3DyspnoeaAssessment />
	{:else if stepNumber === 4}
		<Step4CoughAssessment />
	{:else if stepNumber === 5}
		<Step5RespiratoryHistory />
	{:else if stepNumber === 6}
		<Step6PulmonaryFunction />
	{:else if stepNumber === 7}
		<Step7CurrentMedications />
	{:else if stepNumber === 8}
		<Step8Allergies />
	{:else if stepNumber === 9}
		<Step9SmokingExposures />
	{:else if stepNumber === 10}
		<Step10SleepFunctional />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

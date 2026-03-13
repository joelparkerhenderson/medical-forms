<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateMRS, classifyHRTRisk } from '$lib/engine/mrs-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2MenopauseStatus from '$lib/components/steps/Step2MenopauseStatus.svelte';
	import Step3MRSSymptomScale from '$lib/components/steps/Step3MRSSymptomScale.svelte';
	import Step4VasomotorSymptoms from '$lib/components/steps/Step4VasomotorSymptoms.svelte';
	import Step5BoneHealth from '$lib/components/steps/Step5BoneHealth.svelte';
	import Step6CardiovascularRisk from '$lib/components/steps/Step6CardiovascularRisk.svelte';
	import Step7BreastHealth from '$lib/components/steps/Step7BreastHealth.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9ContraindicationsScreen from '$lib/components/steps/Step9ContraindicationsScreen.svelte';
	import Step10TreatmentPreferences from '$lib/components/steps/Step10TreatmentPreferences.svelte';

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
		const { mrsResult, firedRules } = calculateMRS(assessment.data);
		const riskClassification = classifyHRTRisk(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			mrsResult,
			riskClassification,
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
		<Step2MenopauseStatus />
	{:else if stepNumber === 3}
		<Step3MRSSymptomScale />
	{:else if stepNumber === 4}
		<Step4VasomotorSymptoms />
	{:else if stepNumber === 5}
		<Step5BoneHealth />
	{:else if stepNumber === 6}
		<Step6CardiovascularRisk />
	{:else if stepNumber === 7}
		<Step7BreastHealth />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9ContraindicationsScreen />
	{:else if stepNumber === 10}
		<Step10TreatmentPreferences />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

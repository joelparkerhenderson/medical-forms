<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateASA } from '$lib/engine/asa-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2Cardiovascular from '$lib/components/steps/Step2Cardiovascular.svelte';
	import Step3Respiratory from '$lib/components/steps/Step3Respiratory.svelte';
	import Step4Renal from '$lib/components/steps/Step4Renal.svelte';
	import Step5Hepatic from '$lib/components/steps/Step5Hepatic.svelte';
	import Step6Endocrine from '$lib/components/steps/Step6Endocrine.svelte';
	import Step7Neurological from '$lib/components/steps/Step7Neurological.svelte';
	import Step8Haematological from '$lib/components/steps/Step8Haematological.svelte';
	import Step9MusculoskeletalAirway from '$lib/components/steps/Step9MusculoskeletalAirway.svelte';
	import Step10Gastrointestinal from '$lib/components/steps/Step10Gastrointestinal.svelte';
	import Step11Medications from '$lib/components/steps/Step11Medications.svelte';
	import Step12Allergies from '$lib/components/steps/Step12Allergies.svelte';
	import Step13PreviousAnaesthesia from '$lib/components/steps/Step13PreviousAnaesthesia.svelte';
	import Step14SocialHistory from '$lib/components/steps/Step14SocialHistory.svelte';
	import Step15FunctionalCapacity from '$lib/components/steps/Step15FunctionalCapacity.svelte';
	import Step16Pregnancy from '$lib/components/steps/Step16Pregnancy.svelte';

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
		const { asaGrade, firedRules } = calculateASA(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			asaGrade,
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
		<Step2Cardiovascular />
	{:else if stepNumber === 3}
		<Step3Respiratory />
	{:else if stepNumber === 4}
		<Step4Renal />
	{:else if stepNumber === 5}
		<Step5Hepatic />
	{:else if stepNumber === 6}
		<Step6Endocrine />
	{:else if stepNumber === 7}
		<Step7Neurological />
	{:else if stepNumber === 8}
		<Step8Haematological />
	{:else if stepNumber === 9}
		<Step9MusculoskeletalAirway />
	{:else if stepNumber === 10}
		<Step10Gastrointestinal />
	{:else if stepNumber === 11}
		<Step11Medications />
	{:else if stepNumber === 12}
		<Step12Allergies />
	{:else if stepNumber === 13}
		<Step13PreviousAnaesthesia />
	{:else if stepNumber === 14}
		<Step14SocialHistory />
	{:else if stepNumber === 15}
		<Step15FunctionalCapacity />
	{:else if stepNumber === 16}
		<Step16Pregnancy />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

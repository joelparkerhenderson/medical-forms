<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateGAF } from '$lib/engine/gaf-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PresentingComplaint from '$lib/components/steps/Step2PresentingComplaint.svelte';
	import Step3PsychiatricHistory from '$lib/components/steps/Step3PsychiatricHistory.svelte';
	import Step4MentalStatusExam from '$lib/components/steps/Step4MentalStatusExam.svelte';
	import Step5RiskAssessment from '$lib/components/steps/Step5RiskAssessment.svelte';
	import Step6MoodAndAnxiety from '$lib/components/steps/Step6MoodAndAnxiety.svelte';
	import Step7SubstanceUse from '$lib/components/steps/Step7SubstanceUse.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9MedicalHistory from '$lib/components/steps/Step9MedicalHistory.svelte';
	import Step10SocialHistory from '$lib/components/steps/Step10SocialHistory.svelte';
	import Step11CapacityAndConsent from '$lib/components/steps/Step11CapacityAndConsent.svelte';

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
		const { gafScore, firedRules } = calculateGAF(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			gafScore,
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
		<Step2PresentingComplaint />
	{:else if stepNumber === 3}
		<Step3PsychiatricHistory />
	{:else if stepNumber === 4}
		<Step4MentalStatusExam />
	{:else if stepNumber === 5}
		<Step5RiskAssessment />
	{:else if stepNumber === 6}
		<Step6MoodAndAnxiety />
	{:else if stepNumber === 7}
		<Step7SubstanceUse />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9MedicalHistory />
	{:else if stepNumber === 10}
		<Step10SocialHistory />
	{:else if stepNumber === 11}
		<Step11CapacityAndConsent />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

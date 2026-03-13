<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateDMFT } from '$lib/engine/dmft-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DentalHistory from '$lib/components/steps/Step3DentalHistory.svelte';
	import Step4DMFTAssessment from '$lib/components/steps/Step4DMFTAssessment.svelte';
	import Step5PeriodontalAssessment from '$lib/components/steps/Step5PeriodontalAssessment.svelte';
	import Step6OralExamination from '$lib/components/steps/Step6OralExamination.svelte';
	import Step7MedicalHistory from '$lib/components/steps/Step7MedicalHistory.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9RadiographicFindings from '$lib/components/steps/Step9RadiographicFindings.svelte';

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
		const { dmftScore, dmftCategory, firedRules } = calculateDMFT(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			dmftScore,
			dmftCategory,
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
		<Step3DentalHistory />
	{:else if stepNumber === 4}
		<Step4DMFTAssessment />
	{:else if stepNumber === 5}
		<Step5PeriodontalAssessment />
	{:else if stepNumber === 6}
		<Step6OralExamination />
	{:else if stepNumber === 7}
		<Step7MedicalHistory />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9RadiographicFindings />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

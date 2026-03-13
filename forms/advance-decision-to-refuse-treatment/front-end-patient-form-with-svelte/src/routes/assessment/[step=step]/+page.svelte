<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateValidity } from '$lib/engine/validity-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2CapacityDeclaration from '$lib/components/steps/Step2CapacityDeclaration.svelte';
	import Step3Circumstances from '$lib/components/steps/Step3Circumstances.svelte';
	import Step4TreatmentsRefusedGeneral from '$lib/components/steps/Step4TreatmentsRefusedGeneral.svelte';
	import Step5TreatmentsRefusedLifeSustaining from '$lib/components/steps/Step5TreatmentsRefusedLifeSustaining.svelte';
	import Step6ExceptionsConditions from '$lib/components/steps/Step6ExceptionsConditions.svelte';
	import Step7OtherWishes from '$lib/components/steps/Step7OtherWishes.svelte';
	import Step8LastingPowerOfAttorney from '$lib/components/steps/Step8LastingPowerOfAttorney.svelte';
	import Step9HealthcareProfessionalReview from '$lib/components/steps/Step9HealthcareProfessionalReview.svelte';
	import Step10LegalSignatures from '$lib/components/steps/Step10LegalSignatures.svelte';

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
		const { validityStatus, firedRules } = calculateValidity(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			validityStatus,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PersonalInformation />
	{:else if stepNumber === 2}
		<Step2CapacityDeclaration />
	{:else if stepNumber === 3}
		<Step3Circumstances />
	{:else if stepNumber === 4}
		<Step4TreatmentsRefusedGeneral />
	{:else if stepNumber === 5}
		<Step5TreatmentsRefusedLifeSustaining />
	{:else if stepNumber === 6}
		<Step6ExceptionsConditions />
	{:else if stepNumber === 7}
		<Step7OtherWishes />
	{:else if stepNumber === 8}
		<Step8LastingPowerOfAttorney />
	{:else if stepNumber === 9}
		<Step9HealthcareProfessionalReview />
	{:else if stepNumber === 10}
		<Step10LegalSignatures />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

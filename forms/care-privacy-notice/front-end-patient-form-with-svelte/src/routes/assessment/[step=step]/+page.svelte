<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { validateForm } from '$lib/engine/form-validator';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PracticeConfiguration from '$lib/components/steps/Step1PracticeConfiguration.svelte';
	import Step2PrivacyNotice from '$lib/components/steps/Step2PrivacyNotice.svelte';
	import Step3AcknowledgmentSignature from '$lib/components/steps/Step3AcknowledgmentSignature.svelte';

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
		const { completeness, status, firedRules } = validateForm(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			completenessPercent: completeness,
			status,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	<div class="min-h-screen bg-gray-50 px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<ProgressBar currentStep={stepNumber} {steps} />
		</div>

		{#if stepNumber === 1}
			<Step1PracticeConfiguration />
		{:else if stepNumber === 2}
			<Step2PrivacyNotice />
		{:else if stepNumber === 3}
			<Step3AcknowledgmentSignature />
		{/if}

		<div class="mx-auto max-w-2xl">
			<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
		</div>
	</div>
{/if}

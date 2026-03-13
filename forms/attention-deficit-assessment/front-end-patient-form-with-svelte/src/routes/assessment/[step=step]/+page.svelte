<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateASRS } from '$lib/engine/asrs-grader';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ASRSPartA from '$lib/components/steps/Step2ASRSPartA.svelte';
	import Step3ASRSPartB from '$lib/components/steps/Step3ASRSPartB.svelte';
	import Step4ChildhoodHistory from '$lib/components/steps/Step4ChildhoodHistory.svelte';
	import Step5FunctionalImpact from '$lib/components/steps/Step5FunctionalImpact.svelte';
	import Step6ComorbidConditions from '$lib/components/steps/Step6ComorbidConditions.svelte';
	import Step7Medications from '$lib/components/steps/Step7Medications.svelte';
	import Step8Allergies from '$lib/components/steps/Step8Allergies.svelte';
	import Step9MedicalHistory from '$lib/components/steps/Step9MedicalHistory.svelte';
	import Step10SocialSupport from '$lib/components/steps/Step10SocialSupport.svelte';

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
		const result = calculateASRS(assessment.data);
		assessment.result = result;
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ASRSPartA />
	{:else if stepNumber === 3}
		<Step3ASRSPartB />
	{:else if stepNumber === 4}
		<Step4ChildhoodHistory />
	{:else if stepNumber === 5}
		<Step5FunctionalImpact />
	{:else if stepNumber === 6}
		<Step6ComorbidConditions />
	{:else if stepNumber === 7}
		<Step7Medications />
	{:else if stepNumber === 8}
		<Step8Allergies />
	{:else if stepNumber === 9}
		<Step9MedicalHistory />
	{:else if stepNumber === 10}
		<Step10SocialSupport />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateDLQI } from '$lib/engine/dlqi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { dlqiCategory } from '$lib/engine/utils';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3DLQIQuestionnaire from '$lib/components/steps/Step3DLQIQuestionnaire.svelte';
	import Step4LesionCharacteristics from '$lib/components/steps/Step4LesionCharacteristics.svelte';
	import Step5MedicalHistory from '$lib/components/steps/Step5MedicalHistory.svelte';
	import Step6CurrentMedications from '$lib/components/steps/Step6CurrentMedications.svelte';
	import Step7Allergies from '$lib/components/steps/Step7Allergies.svelte';
	import Step8FamilyHistory from '$lib/components/steps/Step8FamilyHistory.svelte';
	import Step9SocialHistory from '$lib/components/steps/Step9SocialHistory.svelte';

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
		const { dlqiScore, dlqiCategoryLabel, firedRules } = calculateDLQI(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			dlqiScore,
			dlqiCategory: dlqiCategoryLabel,
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
		<Step3DLQIQuestionnaire />
	{:else if stepNumber === 4}
		<Step4LesionCharacteristics />
	{:else if stepNumber === 5}
		<Step5MedicalHistory />
	{:else if stepNumber === 6}
		<Step6CurrentMedications />
	{:else if stepNumber === 7}
		<Step7Allergies />
	{:else if stepNumber === 8}
		<Step8FamilyHistory />
	{:else if stepNumber === 9}
		<Step9SocialHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

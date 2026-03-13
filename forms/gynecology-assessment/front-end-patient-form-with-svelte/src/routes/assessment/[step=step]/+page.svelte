<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateSymptomScore } from '$lib/engine/symptom-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3MenstrualHistory from '$lib/components/steps/Step3MenstrualHistory.svelte';
	import Step4GynecologicalSymptoms from '$lib/components/steps/Step4GynecologicalSymptoms.svelte';
	import Step5CervicalScreening from '$lib/components/steps/Step5CervicalScreening.svelte';
	import Step6ObstetricHistory from '$lib/components/steps/Step6ObstetricHistory.svelte';
	import Step7SexualHealth from '$lib/components/steps/Step7SexualHealth.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10FamilyHistory from '$lib/components/steps/Step10FamilyHistory.svelte';

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
		const { symptomScore, symptomCategoryLabel, firedRules } = calculateSymptomScore(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			symptomScore,
			symptomCategory: symptomCategoryLabel,
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
		<Step3MenstrualHistory />
	{:else if stepNumber === 4}
		<Step4GynecologicalSymptoms />
	{:else if stepNumber === 5}
		<Step5CervicalScreening />
	{:else if stepNumber === 6}
		<Step6ObstetricHistory />
	{:else if stepNumber === 7}
		<Step7SexualHealth />
	{:else if stepNumber === 8}
		<Step8MedicalHistory />
	{:else if stepNumber === 9}
		<Step9CurrentMedications />
	{:else if stepNumber === 10}
		<Step10FamilyHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

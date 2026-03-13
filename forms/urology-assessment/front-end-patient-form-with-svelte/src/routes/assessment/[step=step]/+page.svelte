<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateIPSS } from '$lib/engine/ipss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { ipssCategory } from '$lib/engine/utils';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3IPSSQuestionnaire from '$lib/components/steps/Step3IPSSQuestionnaire.svelte';
	import Step4QualityOfLife from '$lib/components/steps/Step4QualityOfLife.svelte';
	import Step5UrinarySymptoms from '$lib/components/steps/Step5UrinarySymptoms.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
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
		const { ipssScore, ipssCategoryLabel, firedRules } = calculateIPSS(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			ipssScore,
			ipssCategory: ipssCategoryLabel,
			qolScore: assessment.data.qualityOfLife.qolScore,
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
		<Step3IPSSQuestionnaire />
	{:else if stepNumber === 4}
		<Step4QualityOfLife />
	{:else if stepNumber === 5}
		<Step5UrinarySymptoms />
	{:else if stepNumber === 6}
		<Step6RenalFunction />
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

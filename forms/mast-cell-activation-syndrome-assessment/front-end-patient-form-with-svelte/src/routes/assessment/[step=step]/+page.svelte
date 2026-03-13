<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateMCASScore } from '$lib/engine/symptom-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomOverview from '$lib/components/steps/Step2SymptomOverview.svelte';
	import Step3DermatologicalSymptoms from '$lib/components/steps/Step3DermatologicalSymptoms.svelte';
	import Step4GastrointestinalSymptoms from '$lib/components/steps/Step4GastrointestinalSymptoms.svelte';
	import Step5CardiovascularSymptoms from '$lib/components/steps/Step5CardiovascularSymptoms.svelte';
	import Step6RespiratorySymptoms from '$lib/components/steps/Step6RespiratorySymptoms.svelte';
	import Step7NeurologicalSymptoms from '$lib/components/steps/Step7NeurologicalSymptoms.svelte';
	import Step8TriggersPatterns from '$lib/components/steps/Step8TriggersPatterns.svelte';
	import Step9LaboratoryResults from '$lib/components/steps/Step9LaboratoryResults.svelte';
	import Step10CurrentTreatment from '$lib/components/steps/Step10CurrentTreatment.svelte';

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
		const { symptomScore, mcasCategoryLabel, organSystemsAffected, firedRules } = calculateMCASScore(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			symptomScore,
			mcasCategory: mcasCategoryLabel,
			organSystemsAffected,
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
		<Step2SymptomOverview />
	{:else if stepNumber === 3}
		<Step3DermatologicalSymptoms />
	{:else if stepNumber === 4}
		<Step4GastrointestinalSymptoms />
	{:else if stepNumber === 5}
		<Step5CardiovascularSymptoms />
	{:else if stepNumber === 6}
		<Step6RespiratorySymptoms />
	{:else if stepNumber === 7}
		<Step7NeurologicalSymptoms />
	{:else if stepNumber === 8}
		<Step8TriggersPatterns />
	{:else if stepNumber === 9}
		<Step9LaboratoryResults />
	{:else if stepNumber === 10}
		<Step10CurrentTreatment />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

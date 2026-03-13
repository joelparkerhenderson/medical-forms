<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateECOG } from '$lib/engine/ecog-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2CancerDiagnosis from '$lib/components/steps/Step2CancerDiagnosis.svelte';
	import Step3TreatmentHistory from '$lib/components/steps/Step3TreatmentHistory.svelte';
	import Step4CurrentTreatment from '$lib/components/steps/Step4CurrentTreatment.svelte';
	import Step5SymptomAssessment from '$lib/components/steps/Step5SymptomAssessment.svelte';
	import Step6SideEffects from '$lib/components/steps/Step6SideEffects.svelte';
	import Step7LaboratoryResults from '$lib/components/steps/Step7LaboratoryResults.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9Psychosocial from '$lib/components/steps/Step9Psychosocial.svelte';
	import Step10FunctionalNutritional from '$lib/components/steps/Step10FunctionalNutritional.svelte';

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
		const { ecogGrade, firedRules } = calculateECOG(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			ecogGrade,
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
		<Step2CancerDiagnosis />
	{:else if stepNumber === 3}
		<Step3TreatmentHistory />
	{:else if stepNumber === 4}
		<Step4CurrentTreatment />
	{:else if stepNumber === 5}
		<Step5SymptomAssessment />
	{:else if stepNumber === 6}
		<Step6SideEffects />
	{:else if stepNumber === 7}
		<Step7LaboratoryResults />
	{:else if stepNumber === 8}
		<Step8CurrentMedications />
	{:else if stepNumber === 9}
		<Step9Psychosocial />
	{:else if stepNumber === 10}
		<Step10FunctionalNutritional />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

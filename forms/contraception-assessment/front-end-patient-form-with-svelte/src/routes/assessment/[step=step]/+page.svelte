<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { evaluateUKMEC } from '$lib/engine/ukmec-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReproductiveHistory from '$lib/components/steps/Step2ReproductiveHistory.svelte';
	import Step3MenstrualHistory from '$lib/components/steps/Step3MenstrualHistory.svelte';
	import Step4CurrentContraception from '$lib/components/steps/Step4CurrentContraception.svelte';
	import Step5MedicalHistory from '$lib/components/steps/Step5MedicalHistory.svelte';
	import Step6CardiovascularRisk from '$lib/components/steps/Step6CardiovascularRisk.svelte';
	import Step7LifestyleFactors from '$lib/components/steps/Step7LifestyleFactors.svelte';
	import Step8PreferencesPriorities from '$lib/components/steps/Step8PreferencesPriorities.svelte';
	import Step9BreastCervicalScreening from '$lib/components/steps/Step9BreastCervicalScreening.svelte';
	import Step10FamilyPlanningGoals from '$lib/components/steps/Step10FamilyPlanningGoals.svelte';

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
		const { ukmecResults, firedRules } = evaluateUKMEC(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data, ukmecResults);

		const overallHighest = Math.max(...ukmecResults.map((r) => r.category)) as 1 | 2 | 3 | 4;

		const preferredMethod = assessment.data.preferencesPriorities.preferredMethod;
		const preferredResult = preferredMethod
			? ukmecResults.find((r) => r.method === preferredMethod)
			: null;

		assessment.result = {
			ukmecResults,
			overallHighestCategory: overallHighest,
			preferredMethodCategory: preferredResult ? preferredResult.category : null,
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
		<Step2ReproductiveHistory />
	{:else if stepNumber === 3}
		<Step3MenstrualHistory />
	{:else if stepNumber === 4}
		<Step4CurrentContraception />
	{:else if stepNumber === 5}
		<Step5MedicalHistory />
	{:else if stepNumber === 6}
		<Step6CardiovascularRisk />
	{:else if stepNumber === 7}
		<Step7LifestyleFactors />
	{:else if stepNumber === 8}
		<Step8PreferencesPriorities />
	{:else if stepNumber === 9}
		<Step9BreastCervicalScreening />
	{:else if stepNumber === 10}
		<Step10FamilyPlanningGoals />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

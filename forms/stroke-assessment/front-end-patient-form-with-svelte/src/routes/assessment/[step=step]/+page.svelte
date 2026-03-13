<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateNIHSS } from '$lib/engine/nihss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { nihssCategory } from '$lib/engine/utils';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomOnset from '$lib/components/steps/Step2SymptomOnset.svelte';
	import Step3LevelOfConsciousness from '$lib/components/steps/Step3LevelOfConsciousness.svelte';
	import Step4BestGazeVisual from '$lib/components/steps/Step4BestGazeVisual.svelte';
	import Step5FacialPalsyMotor from '$lib/components/steps/Step5FacialPalsyMotor.svelte';
	import Step6LimbAtaxiaSensory from '$lib/components/steps/Step6LimbAtaxiaSensory.svelte';
	import Step7LanguageDysarthria from '$lib/components/steps/Step7LanguageDysarthria.svelte';
	import Step8ExtinctionInattention from '$lib/components/steps/Step8ExtinctionInattention.svelte';
	import Step9RiskFactors from '$lib/components/steps/Step9RiskFactors.svelte';
	import Step10CurrentMedications from '$lib/components/steps/Step10CurrentMedications.svelte';

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
		const { nihssScore, nihssCategoryLabel, firedRules } = calculateNIHSS(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			nihssScore,
			nihssCategory: nihssCategoryLabel,
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
		<Step2SymptomOnset />
	{:else if stepNumber === 3}
		<Step3LevelOfConsciousness />
	{:else if stepNumber === 4}
		<Step4BestGazeVisual />
	{:else if stepNumber === 5}
		<Step5FacialPalsyMotor />
	{:else if stepNumber === 6}
		<Step6LimbAtaxiaSensory />
	{:else if stepNumber === 7}
		<Step7LanguageDysarthria />
	{:else if stepNumber === 8}
		<Step8ExtinctionInattention />
	{:else if stepNumber === 9}
		<Step9RiskFactors />
	{:else if stepNumber === 10}
		<Step10CurrentMedications />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

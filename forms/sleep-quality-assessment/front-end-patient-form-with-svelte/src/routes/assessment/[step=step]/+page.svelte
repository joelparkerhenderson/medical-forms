<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculatePSQI } from '$lib/engine/psqi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SleepHabits from '$lib/components/steps/Step2SleepHabits.svelte';
	import Step3SleepLatency from '$lib/components/steps/Step3SleepLatency.svelte';
	import Step4SleepDuration from '$lib/components/steps/Step4SleepDuration.svelte';
	import Step5SleepEfficiency from '$lib/components/steps/Step5SleepEfficiency.svelte';
	import Step6SleepDisturbances from '$lib/components/steps/Step6SleepDisturbances.svelte';
	import Step7DaytimeDysfunction from '$lib/components/steps/Step7DaytimeDysfunction.svelte';
	import Step8SleepMedicationUse from '$lib/components/steps/Step8SleepMedicationUse.svelte';
	import Step9MedicalLifestyle from '$lib/components/steps/Step9MedicalLifestyle.svelte';

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
		const { psqiScore, psqiCategoryLabel, firedRules } = calculatePSQI(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			psqiScore,
			psqiCategory: psqiCategoryLabel,
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
		<Step2SleepHabits />
	{:else if stepNumber === 3}
		<Step3SleepLatency />
	{:else if stepNumber === 4}
		<Step4SleepDuration />
	{:else if stepNumber === 5}
		<Step5SleepEfficiency />
	{:else if stepNumber === 6}
		<Step6SleepDisturbances />
	{:else if stepNumber === 7}
		<Step7DaytimeDysfunction />
	{:else if stepNumber === 8}
		<Step8SleepMedicationUse />
	{:else if stepNumber === 9}
		<Step9MedicalLifestyle />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

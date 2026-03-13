<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { gradeAssessment } from '$lib/engine/mh-grader';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PhqDepression from '$lib/components/steps/Step2PhqDepression.svelte';
	import Step3GadAnxiety from '$lib/components/steps/Step3GadAnxiety.svelte';
	import Step4MoodAffect from '$lib/components/steps/Step4MoodAffect.svelte';
	import Step5RiskAssessment from '$lib/components/steps/Step5RiskAssessment.svelte';
	import Step6SubstanceUse from '$lib/components/steps/Step6SubstanceUse.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8TreatmentHistory from '$lib/components/steps/Step8TreatmentHistory.svelte';
	import Step9SocialFunctional from '$lib/components/steps/Step9SocialFunctional.svelte';

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
		const result = gradeAssessment(assessment.data);
		assessment.result = result;
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2PhqDepression />
	{:else if stepNumber === 3}
		<Step3GadAnxiety />
	{:else if stepNumber === 4}
		<Step4MoodAffect />
	{:else if stepNumber === 5}
		<Step5RiskAssessment />
	{:else if stepNumber === 6}
		<Step6SubstanceUse />
	{:else if stepNumber === 7}
		<Step7CurrentMedications />
	{:else if stepNumber === 8}
		<Step8TreatmentHistory />
	{:else if stepNumber === 9}
		<Step9SocialFunctional />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateAbnormality } from '$lib/engine/hematology-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2BloodCountAnalysis from '$lib/components/steps/Step2BloodCountAnalysis.svelte';
	import Step3CoagulationStudies from '$lib/components/steps/Step3CoagulationStudies.svelte';
	import Step4PeripheralBloodFilm from '$lib/components/steps/Step4PeripheralBloodFilm.svelte';
	import Step5IronStudies from '$lib/components/steps/Step5IronStudies.svelte';
	import Step6HemoglobinopathyScreening from '$lib/components/steps/Step6HemoglobinopathyScreening.svelte';
	import Step7BoneMarrowAssessment from '$lib/components/steps/Step7BoneMarrowAssessment.svelte';
	import Step8TransfusionHistory from '$lib/components/steps/Step8TransfusionHistory.svelte';
	import Step9TreatmentMedications from '$lib/components/steps/Step9TreatmentMedications.svelte';
	import Step10ClinicalReview from '$lib/components/steps/Step10ClinicalReview.svelte';

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
		const { abnormalityLevel, abnormalityScore, firedRules } = calculateAbnormality(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			abnormalityLevel,
			abnormalityScore,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	<div class="min-h-screen bg-gray-50 px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<ProgressBar currentStep={stepNumber} steps={visibleSteps} />
		</div>

		{#if stepNumber === 1}
			<Step1PatientInformation />
		{:else if stepNumber === 2}
			<Step2BloodCountAnalysis />
		{:else if stepNumber === 3}
			<Step3CoagulationStudies />
		{:else if stepNumber === 4}
			<Step4PeripheralBloodFilm />
		{:else if stepNumber === 5}
			<Step5IronStudies />
		{:else if stepNumber === 6}
			<Step6HemoglobinopathyScreening />
		{:else if stepNumber === 7}
			<Step7BoneMarrowAssessment />
		{:else if stepNumber === 8}
			<Step8TransfusionHistory />
		{:else if stepNumber === 9}
			<Step9TreatmentMedications />
		{:else if stepNumber === 10}
			<Step10ClinicalReview />
		{/if}

		<div class="mx-auto max-w-2xl">
			<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
		</div>
	</div>
{/if}

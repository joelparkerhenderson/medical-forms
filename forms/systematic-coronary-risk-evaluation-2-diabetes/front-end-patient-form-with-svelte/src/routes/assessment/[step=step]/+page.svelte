<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte.js';
	import { steps } from '$lib/config/steps.js';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';
	import Step1PatientDemographics from '$lib/components/steps/Step1PatientDemographics.svelte';
	import Step2DiabetesHistory from '$lib/components/steps/Step2DiabetesHistory.svelte';
	import Step3CardiovascularHistory from '$lib/components/steps/Step3CardiovascularHistory.svelte';
	import Step4BloodPressure from '$lib/components/steps/Step4BloodPressure.svelte';
	import Step5LipidProfile from '$lib/components/steps/Step5LipidProfile.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
	import Step7LifestyleFactors from '$lib/components/steps/Step7LifestyleFactors.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9ComplicationsScreening from '$lib/components/steps/Step9ComplicationsScreening.svelte';
	import Step10RiskAssessmentSummary from '$lib/components/steps/Step10RiskAssessmentSummary.svelte';

	let currentStep = $derived(parseInt(page.params.step, 10));
	let stepConfig = $derived(steps[currentStep - 1]);

	$effect(() => {
		assessment.currentStep = currentStep;
	});

	function goToPrevious() {
		if (currentStep > 1) goto(`/assessment/${currentStep - 1}`);
	}

	function goToNext() {
		if (currentStep < assessment.totalSteps) goto(`/assessment/${currentStep + 1}`);
	}

	function handleSubmit() {
		assessment.grade();
		goto('/report');
	}
</script>

<svelte:head>
	<title>Step {currentStep} - {stepConfig?.title ?? ''} | SCORE2-Diabetes</title>
</svelte:head>

<ProgressBar {currentStep} totalSteps={assessment.totalSteps} />

<h2 class="mb-6 text-xl font-bold text-gray-800">
	Step {currentStep}: {stepConfig?.title ?? ''}
</h2>

{#if currentStep === 1}
	<Step1PatientDemographics bind:data={assessment.data.patientDemographics} />
{:else if currentStep === 2}
	<Step2DiabetesHistory bind:data={assessment.data.diabetesHistory} />
{:else if currentStep === 3}
	<Step3CardiovascularHistory bind:data={assessment.data.cardiovascularHistory} />
{:else if currentStep === 4}
	<Step4BloodPressure bind:data={assessment.data.bloodPressure} />
{:else if currentStep === 5}
	<Step5LipidProfile bind:data={assessment.data.lipidProfile} />
{:else if currentStep === 6}
	<Step6RenalFunction bind:data={assessment.data.renalFunction} />
{:else if currentStep === 7}
	<Step7LifestyleFactors bind:data={assessment.data.lifestyleFactors} />
{:else if currentStep === 8}
	<Step8CurrentMedications bind:data={assessment.data.currentMedications} />
{:else if currentStep === 9}
	<Step9ComplicationsScreening bind:data={assessment.data.complicationsScreening} />
{:else if currentStep === 10}
	<Step10RiskAssessmentSummary bind:data={assessment.data.riskAssessmentSummary} />
{/if}

<StepNavigation
	{currentStep}
	totalSteps={assessment.totalSteps}
	onPrevious={goToPrevious}
	onNext={goToNext}
	onSubmit={handleSubmit}
/>

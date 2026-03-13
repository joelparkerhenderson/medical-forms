<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateVaccinationStatus } from '$lib/engine/vaccination-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2ImmunizationHistory from '$lib/components/steps/Step2ImmunizationHistory.svelte';
	import Step3ChildhoodVaccinations from '$lib/components/steps/Step3ChildhoodVaccinations.svelte';
	import Step4AdultVaccinations from '$lib/components/steps/Step4AdultVaccinations.svelte';
	import Step5TravelVaccinations from '$lib/components/steps/Step5TravelVaccinations.svelte';
	import Step6OccupationalVaccinations from '$lib/components/steps/Step6OccupationalVaccinations.svelte';
	import Step7ContraindicationsAllergies from '$lib/components/steps/Step7ContraindicationsAllergies.svelte';
	import Step8ConsentInformation from '$lib/components/steps/Step8ConsentInformation.svelte';
	import Step9AdministrationRecord from '$lib/components/steps/Step9AdministrationRecord.svelte';
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

	function submitForm() {
		const { level, score, firedRules } = calculateVaccinationStatus(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			vaccinationLevel: level,
			vaccinationScore: score,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PatientInformation />
	{:else if stepNumber === 2}
		<Step2ImmunizationHistory />
	{:else if stepNumber === 3}
		<Step3ChildhoodVaccinations />
	{:else if stepNumber === 4}
		<Step4AdultVaccinations />
	{:else if stepNumber === 5}
		<Step5TravelVaccinations />
	{:else if stepNumber === 6}
		<Step6OccupationalVaccinations />
	{:else if stepNumber === 7}
		<Step7ContraindicationsAllergies />
	{:else if stepNumber === 8}
		<Step8ConsentInformation />
	{:else if stepNumber === 9}
		<Step9AdministrationRecord />
	{:else if stepNumber === 10}
		<Step10ClinicalReview />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitForm} />
{/if}

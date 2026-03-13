<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import { steps, getNextStep, getPrevStep } from '$lib/config/steps';
	import { calculateNEWS2 } from '$lib/engine/news2-calculator';
	import { detectFlaggedIssues } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2NextOfKinGP from '$lib/components/steps/Step2NextOfKinGP.svelte';
	import Step3ArrivalTriage from '$lib/components/steps/Step3ArrivalTriage.svelte';
	import Step4PresentingComplaint from '$lib/components/steps/Step4PresentingComplaint.svelte';
	import Step5PainAssessment from '$lib/components/steps/Step5PainAssessment.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7VitalSigns from '$lib/components/steps/Step7VitalSigns.svelte';
	import Step8PrimarySurvey from '$lib/components/steps/Step8PrimarySurvey.svelte';
	import Step9ClinicalExamination from '$lib/components/steps/Step9ClinicalExamination.svelte';
	import Step10Investigations from '$lib/components/steps/Step10Investigations.svelte';
	import Step11Treatment from '$lib/components/steps/Step11Treatment.svelte';
	import Step12AssessmentPlan from '$lib/components/steps/Step12AssessmentPlan.svelte';
	import Step13Disposition from '$lib/components/steps/Step13Disposition.svelte';
	import Step14SafeguardingConsent from '$lib/components/steps/Step14SafeguardingConsent.svelte';

	const stepNumber = $derived(Number($page.params.step));
	const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
	const isLast = $derived(stepNumber === steps[steps.length - 1].number);
	const nextStep = $derived(getNextStep(stepNumber));
	const prevStep = $derived(getPrevStep(stepNumber));
	const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
	const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

	$effect(() => {
		casualtyCard.currentStep = stepNumber;
	});

	function submitAssessment() {
		const news2 = calculateNEWS2(casualtyCard.data.vitalSigns);
		const flaggedIssues = detectFlaggedIssues(casualtyCard.data, news2);
		casualtyCard.result = {
			news2,
			flaggedIssues,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2NextOfKinGP />
	{:else if stepNumber === 3}
		<Step3ArrivalTriage />
	{:else if stepNumber === 4}
		<Step4PresentingComplaint />
	{:else if stepNumber === 5}
		<Step5PainAssessment />
	{:else if stepNumber === 6}
		<Step6MedicalHistory />
	{:else if stepNumber === 7}
		<Step7VitalSigns />
	{:else if stepNumber === 8}
		<Step8PrimarySurvey />
	{:else if stepNumber === 9}
		<Step9ClinicalExamination />
	{:else if stepNumber === 10}
		<Step10Investigations />
	{:else if stepNumber === 11}
		<Step11Treatment />
	{:else if stepNumber === 12}
		<Step12AssessmentPlan />
	{:else if stepNumber === 13}
		<Step13Disposition />
	{:else if stepNumber === 14}
		<Step14SafeguardingConsent />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

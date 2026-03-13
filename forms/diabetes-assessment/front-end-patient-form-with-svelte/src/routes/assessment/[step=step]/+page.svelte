<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateControl } from '$lib/engine/diabetes-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2DiabetesHistory from '$lib/components/steps/Step2DiabetesHistory.svelte';
	import Step3GlycaemicControl from '$lib/components/steps/Step3GlycaemicControl.svelte';
	import Step4Medications from '$lib/components/steps/Step4Medications.svelte';
	import Step5ComplicationsScreening from '$lib/components/steps/Step5ComplicationsScreening.svelte';
	import Step6CardiovascularRisk from '$lib/components/steps/Step6CardiovascularRisk.svelte';
	import Step7SelfCareLifestyle from '$lib/components/steps/Step7SelfCareLifestyle.svelte';
	import Step8PsychologicalWellbeing from '$lib/components/steps/Step8PsychologicalWellbeing.svelte';
	import Step9FootAssessment from '$lib/components/steps/Step9FootAssessment.svelte';
	import Step10ReviewCarePlan from '$lib/components/steps/Step10ReviewCarePlan.svelte';

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
		const { controlLevel, controlScore, firedRules } = calculateControl(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			controlLevel,
			controlScore,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="mx-auto max-w-2xl px-4">
			<ProgressBar currentStep={stepNumber} steps={visibleSteps} />
		</div>

		{#if stepNumber === 1}
			<Step1PatientInformation />
		{:else if stepNumber === 2}
			<Step2DiabetesHistory />
		{:else if stepNumber === 3}
			<Step3GlycaemicControl />
		{:else if stepNumber === 4}
			<Step4Medications />
		{:else if stepNumber === 5}
			<Step5ComplicationsScreening />
		{:else if stepNumber === 6}
			<Step6CardiovascularRisk />
		{:else if stepNumber === 7}
			<Step7SelfCareLifestyle />
		{:else if stepNumber === 8}
			<Step8PsychologicalWellbeing />
		{:else if stepNumber === 9}
			<Step9FootAssessment />
		{:else if stepNumber === 10}
			<Step10ReviewCarePlan />
		{/if}

		<div class="mx-auto max-w-2xl px-4">
			<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
		</div>
	</div>
{/if}

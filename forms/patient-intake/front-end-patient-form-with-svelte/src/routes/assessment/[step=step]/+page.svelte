<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateRiskLevel } from '$lib/engine/intake-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2InsuranceAndId from '$lib/components/steps/Step2InsuranceAndId.svelte';
	import Step3ReasonForVisit from '$lib/components/steps/Step3ReasonForVisit.svelte';
	import Step4MedicalHistory from '$lib/components/steps/Step4MedicalHistory.svelte';
	import Step5Medications from '$lib/components/steps/Step5Medications.svelte';
	import Step6Allergies from '$lib/components/steps/Step6Allergies.svelte';
	import Step7FamilyHistory from '$lib/components/steps/Step7FamilyHistory.svelte';
	import Step8SocialHistory from '$lib/components/steps/Step8SocialHistory.svelte';
	import Step9ReviewOfSystems from '$lib/components/steps/Step9ReviewOfSystems.svelte';
	import Step10ConsentAndPreferences from '$lib/components/steps/Step10ConsentAndPreferences.svelte';

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
		const { riskLevel, firedRules } = calculateRiskLevel(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			riskLevel,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PersonalInformation />
	{:else if stepNumber === 2}
		<Step2InsuranceAndId />
	{:else if stepNumber === 3}
		<Step3ReasonForVisit />
	{:else if stepNumber === 4}
		<Step4MedicalHistory />
	{:else if stepNumber === 5}
		<Step5Medications />
	{:else if stepNumber === 6}
		<Step6Allergies />
	{:else if stepNumber === 7}
		<Step7FamilyHistory />
	{:else if stepNumber === 8}
		<Step8SocialHistory />
	{:else if stepNumber === 9}
		<Step9ReviewOfSystems />
	{:else if stepNumber === 10}
		<Step10ConsentAndPreferences />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

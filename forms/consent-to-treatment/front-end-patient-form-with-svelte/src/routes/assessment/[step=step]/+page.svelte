<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { validateForm } from '$lib/engine/form-validator';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2ProcedureDetails from '$lib/components/steps/Step2ProcedureDetails.svelte';
	import Step3RisksBenefits from '$lib/components/steps/Step3RisksBenefits.svelte';
	import Step4AlternativeTreatments from '$lib/components/steps/Step4AlternativeTreatments.svelte';
	import Step5AnesthesiaInformation from '$lib/components/steps/Step5AnesthesiaInformation.svelte';
	import Step6QuestionsUnderstanding from '$lib/components/steps/Step6QuestionsUnderstanding.svelte';
	import Step7PatientRights from '$lib/components/steps/Step7PatientRights.svelte';
	import Step8SignatureConsent from '$lib/components/steps/Step8SignatureConsent.svelte';

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
		const { completeness, status, firedRules } = validateForm(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			completenessPercent: completeness,
			status,
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
		<Step2ProcedureDetails />
	{:else if stepNumber === 3}
		<Step3RisksBenefits />
	{:else if stepNumber === 4}
		<Step4AlternativeTreatments />
	{:else if stepNumber === 5}
		<Step5AnesthesiaInformation />
	{:else if stepNumber === 6}
		<Step6QuestionsUnderstanding />
	{:else if stepNumber === 7}
		<Step7PatientRights />
	{:else if stepNumber === 8}
		<Step8SignatureConsent />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

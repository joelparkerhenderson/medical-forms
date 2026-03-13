<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInformation from '$lib/components/steps/Step2ReferralInformation.svelte';
	import Step3PersonalMedicalHistory from '$lib/components/steps/Step3PersonalMedicalHistory.svelte';
	import Step4CancerHistory from '$lib/components/steps/Step4CancerHistory.svelte';
	import Step5FamilyPedigree from '$lib/components/steps/Step5FamilyPedigree.svelte';
	import Step6CardiovascularGenetics from '$lib/components/steps/Step6CardiovascularGenetics.svelte';
	import Step7Neurogenetics from '$lib/components/steps/Step7Neurogenetics.svelte';
	import Step8ReproductiveGenetics from '$lib/components/steps/Step8ReproductiveGenetics.svelte';
	import Step9EthnicBackground from '$lib/components/steps/Step9EthnicBackground.svelte';
	import Step10GeneticTestingHistory from '$lib/components/steps/Step10GeneticTestingHistory.svelte';

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
		const { riskScore, riskLevel, firedRules } = calculateRisk(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			riskScore,
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
		<Step1Demographics />
	{:else if stepNumber === 2}
		<Step2ReferralInformation />
	{:else if stepNumber === 3}
		<Step3PersonalMedicalHistory />
	{:else if stepNumber === 4}
		<Step4CancerHistory />
	{:else if stepNumber === 5}
		<Step5FamilyPedigree />
	{:else if stepNumber === 6}
		<Step6CardiovascularGenetics />
	{:else if stepNumber === 7}
		<Step7Neurogenetics />
	{:else if stepNumber === 8}
		<Step8ReproductiveGenetics />
	{:else if stepNumber === 9}
		<Step9EthnicBackground />
	{:else if stepNumber === 10}
		<Step10GeneticTestingHistory />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}

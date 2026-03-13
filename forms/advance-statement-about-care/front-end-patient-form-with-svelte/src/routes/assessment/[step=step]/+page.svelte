<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
	import { calculateCompleteness } from '$lib/engine/completeness-grader';
	import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2StatementContext from '$lib/components/steps/Step2StatementContext.svelte';
	import Step3ValuesBeliefs from '$lib/components/steps/Step3ValuesBeliefs.svelte';
	import Step4CarePreferences from '$lib/components/steps/Step4CarePreferences.svelte';
	import Step5MedicalTreatmentWishes from '$lib/components/steps/Step5MedicalTreatmentWishes.svelte';
	import Step6CommunicationPreferences from '$lib/components/steps/Step6CommunicationPreferences.svelte';
	import Step7PeopleImportantToMe from '$lib/components/steps/Step7PeopleImportantToMe.svelte';
	import Step8PracticalMatters from '$lib/components/steps/Step8PracticalMatters.svelte';
	import Step9SignaturesWitnesses from '$lib/components/steps/Step9SignaturesWitnesses.svelte';

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

	function submitStatement() {
		const result = calculateCompleteness(assessment.data);
		assessment.result = result;
		goto('/report');
	}
</script>

{#if stepConfig}
	{#if stepNumber === 1}
		<Step1PersonalInformation />
	{:else if stepNumber === 2}
		<Step2StatementContext />
	{:else if stepNumber === 3}
		<Step3ValuesBeliefs />
	{:else if stepNumber === 4}
		<Step4CarePreferences />
	{:else if stepNumber === 5}
		<Step5MedicalTreatmentWishes />
	{:else if stepNumber === 6}
		<Step6CommunicationPreferences />
	{:else if stepNumber === 7}
		<Step7PeopleImportantToMe />
	{:else if stepNumber === 8}
		<Step8PracticalMatters />
	{:else if stepNumber === 9}
		<Step9SignaturesWitnesses />
	{/if}

	<StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitStatement} />
{/if}

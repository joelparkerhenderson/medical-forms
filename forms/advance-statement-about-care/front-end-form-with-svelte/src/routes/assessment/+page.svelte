<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateCompleteness } from '$lib/engine/completeness-grader';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2StatementContext from '$lib/components/steps/Step2StatementContext.svelte';
	import Step3ValuesBeliefs from '$lib/components/steps/Step3ValuesBeliefs.svelte';
	import Step4CarePreferences from '$lib/components/steps/Step4CarePreferences.svelte';
	import Step5MedicalTreatmentWishes from '$lib/components/steps/Step5MedicalTreatmentWishes.svelte';
	import Step6CommunicationPreferences from '$lib/components/steps/Step6CommunicationPreferences.svelte';
	import Step7PeopleImportantToMe from '$lib/components/steps/Step7PeopleImportantToMe.svelte';
	import Step8PracticalMatters from '$lib/components/steps/Step8PracticalMatters.svelte';
	import Step9SignaturesWitnesses from '$lib/components/steps/Step9SignaturesWitnesses.svelte';

	function submitStatement() {
			const result = calculateCompleteness(assessment.data);
			assessment.result = result;
			goto('/report');
		}
</script>

<Step1PersonalInformation />

<Step2StatementContext />

<Step3ValuesBeliefs />

<Step4CarePreferences />

<Step5MedicalTreatmentWishes />

<Step6CommunicationPreferences />

<Step7PeopleImportantToMe />

<Step8PracticalMatters />

<Step9SignaturesWitnesses />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitStatement}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>

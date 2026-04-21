<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.immunizationHistory;
</script>

<SectionCard title="Immunization History" description="Please provide details about the patient's vaccination history and records.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Does the patient have a vaccination record?"
			name="hasVaccinationRecord"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'unknown', label: 'Unknown' }
			]}
			bind:value={h.hasVaccinationRecord}
		/>
		<SelectInput
			label="Record Source"
			name="recordSource"
			options={[
				{ value: 'redBook', label: 'Red Book' },
				{ value: 'gpRecords', label: 'GP Records' },
				{ value: 'nhsApp', label: 'NHS App' },
				{ value: 'patientRecall', label: 'Patient Recall' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={h.recordSource}
		/>
	</div>

	<TextInput label="Last Immunization Review Date" name="lastReviewDate" type="date" bind:value={h.lastReviewDate} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Any previous adverse reactions to vaccines?"
			name="previousAdverseReactions"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={h.previousAdverseReactions}
		/>
		<TextArea label="If yes, please describe" name="adverseReactionDetails" bind:value={h.adverseReactionDetails} placeholder="Describe any adverse reactions..." />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Is the patient immunocompromised?"
			name="immunocompromised"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={h.immunocompromised}
		/>
		<TextArea label="If yes, please describe" name="immunocompromisedDetails" bind:value={h.immunocompromisedDetails} placeholder="Describe immunocompromised condition..." />
	</div>
</SectionCard>

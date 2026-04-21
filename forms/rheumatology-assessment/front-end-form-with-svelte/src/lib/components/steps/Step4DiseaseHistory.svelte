<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.diseaseHistory;
</script>

<SectionCard title="Disease History" description="Rheumatological diagnosis and treatment history">
	<SelectInput
		label="Primary Diagnosis"
		name="primaryDiagnosis"
		options={[
			{ value: 'rheumatoid-arthritis', label: 'Rheumatoid Arthritis' },
			{ value: 'psoriatic-arthritis', label: 'Psoriatic Arthritis' },
			{ value: 'ankylosing-spondylitis', label: 'Ankylosing Spondylitis' },
			{ value: 'systemic-lupus', label: 'Systemic Lupus Erythematosus' },
			{ value: 'gout', label: 'Gout' },
			{ value: 'osteoarthritis', label: 'Osteoarthritis' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={d.primaryDiagnosis}
		required
	/>

	<TextInput label="Date of Diagnosis" name="diagnosisDate" type="date" bind:value={d.diagnosisDate} />

	<NumberInput
		label="Disease Duration"
		name="diseaseDurationYears"
		bind:value={d.diseaseDurationYears}
		unit="years"
		min={0}
		max={80}
	/>

	<TextArea
		label="Previous DMARDs"
		name="previousDMARDs"
		bind:value={d.previousDMARDs}
		placeholder="e.g., Methotrexate, Sulfasalazine, Hydroxychloroquine..."
	/>

	<TextArea
		label="Previous Biologics"
		name="previousBiologics"
		bind:value={d.previousBiologics}
		placeholder="e.g., Adalimumab, Etanercept, Rituximab..."
	/>

	<RadioGroup
		label="Any Remission Periods?"
		name="remissionPeriods"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={d.remissionPeriods}
	/>

	{#if d.remissionPeriods === 'yes'}
		<TextArea
			label="Remission Details"
			name="remissionDetails"
			bind:value={d.remissionDetails}
			placeholder="Duration, how achieved, any relapses..."
		/>
	{/if}
</SectionCard>

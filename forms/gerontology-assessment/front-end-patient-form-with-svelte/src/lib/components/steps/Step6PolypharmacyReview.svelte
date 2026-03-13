<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const p = assessment.data.polypharmacyReview;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Polypharmacy Review" description="Medication count, high-risk medications, Beers criteria, and adherence">
	<NumberInput label="Total number of regular medications" name="numberOfMedications" bind:value={p.numberOfMedications} min={0} max={50} />

	<RadioGroup label="Are there any high-risk medications (e.g., anticoagulants, sedatives, opioids)?" name="highRiskMedications" options={yesNo} bind:value={p.highRiskMedications} />
	{#if p.highRiskMedications === 'yes'}
		<TextArea label="High-risk medication details" name="highRiskMedicationDetails" bind:value={p.highRiskMedicationDetails} placeholder="List the high-risk medications" />
	{/if}

	<RadioGroup label="Any Beers criteria flags (potentially inappropriate medications for older adults)?" name="beersCriteriaFlags" options={yesNo} bind:value={p.beersCriteriaFlags} />
	{#if p.beersCriteriaFlags === 'yes'}
		<TextArea label="Beers criteria details" name="beersCriteriaDetails" bind:value={p.beersCriteriaDetails} placeholder="List the flagged medications" />
	{/if}

	<SelectInput
		label="Medication Adherence"
		name="medicationAdherence"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={p.medicationAdherence}
	/>

	<hr class="my-4 border-gray-200" />
	<h3 class="mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide">Current Medications List</h3>
	<MedicationEntry bind:medications={assessment.data.medications} />
</SectionCard>

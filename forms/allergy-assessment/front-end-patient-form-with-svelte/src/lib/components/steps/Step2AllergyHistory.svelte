<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.allergyHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Allergy History" description="Age of onset, known allergens, and family history">
	<NumberInput label="Age of allergy onset" name="ageOfOnset" bind:value={h.ageOfOnset} unit="years" min={0} max={120} />

	<TextArea label="Known allergens (list all)" name="knownAllergens" bind:value={h.knownAllergens} placeholder="e.g. Penicillin, peanuts, pollen, dust mites..." />

	<RadioGroup label="Family history of atopy (asthma, eczema, hay fever)?" name="familyAtopy" options={yesNo} bind:value={h.familyHistoryOfAtopy} />
	{#if h.familyHistoryOfAtopy === 'yes'}
		<TextArea label="Atopy details" name="familyAtopyDetails" bind:value={h.familyAtopyDetails} placeholder="Which family members and conditions?" />
	{/if}

	<RadioGroup label="Family history of allergy?" name="familyAllergy" options={yesNo} bind:value={h.familyHistoryOfAllergy} />
	{#if h.familyHistoryOfAllergy === 'yes'}
		<TextArea label="Allergy details" name="familyAllergyDetails" bind:value={h.familyAllergyDetails} placeholder="Which family members and allergens?" />
	{/if}
</SectionCard>

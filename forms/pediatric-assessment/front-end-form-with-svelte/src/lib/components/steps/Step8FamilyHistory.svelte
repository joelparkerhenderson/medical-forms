<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const fh = assessment.data.familyHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Family History" description="Hereditary and genetic factors">
	<RadioGroup label="Are there any known genetic conditions in the family?" name="genetic" options={yesNo} bind:value={fh.geneticConditions} />
	{#if fh.geneticConditions === 'yes'}
		<TextArea label="Please describe genetic conditions" name="geneticDetails" bind:value={fh.geneticConditionDetails} placeholder="e.g., Down syndrome, cystic fibrosis, sickle cell..." />
	{/if}

	<RadioGroup label="Are there any chronic diseases in the family?" name="chronicFamily" options={yesNo} bind:value={fh.chronicDiseases} />
	{#if fh.chronicDiseases === 'yes'}
		<TextArea label="Please describe chronic diseases" name="chronicFamilyDetails" bind:value={fh.chronicDiseaseDetails} placeholder="e.g., diabetes, heart disease, cancer..." />
	{/if}

	<RadioGroup label="Are there any developmental disorders in the family?" name="devDisorders" options={yesNo} bind:value={fh.developmentalDisorders} />
	{#if fh.developmentalDisorders === 'yes'}
		<TextArea label="Please describe developmental disorders" name="devDisorderDetails" bind:value={fh.developmentalDisorderDetails} placeholder="e.g., autism, ADHD, speech delay..." />
	{/if}

	<RadioGroup label="Is there consanguinity (parents are related)?" name="consanguinity" options={yesNo} bind:value={fh.consanguinity} />
</SectionCard>

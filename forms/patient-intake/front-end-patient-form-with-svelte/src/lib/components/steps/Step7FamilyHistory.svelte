<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const f = assessment.data.familyHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Family History" description="Medical conditions in your immediate family (parents, siblings, children)">
	<RadioGroup label="Heart disease in family?" name="fhHeart" options={yesNo} bind:value={f.heartDisease} />
	{#if f.heartDisease === 'yes'}
		<TextInput label="Please provide details" name="fhHeartDetails" bind:value={f.heartDiseaseDetails} />
	{/if}

	<RadioGroup label="Cancer in family?" name="fhCancer" options={yesNo} bind:value={f.cancer} />
	{#if f.cancer === 'yes'}
		<TextInput label="Please provide details (type, relation)" name="fhCancerDetails" bind:value={f.cancerDetails} />
	{/if}

	<RadioGroup label="Diabetes in family?" name="fhDiabetes" options={yesNo} bind:value={f.diabetes} />
	{#if f.diabetes === 'yes'}
		<TextInput label="Please provide details" name="fhDiabetesDetails" bind:value={f.diabetesDetails} />
	{/if}

	<RadioGroup label="Stroke in family?" name="fhStroke" options={yesNo} bind:value={f.stroke} />
	{#if f.stroke === 'yes'}
		<TextInput label="Please provide details" name="fhStrokeDetails" bind:value={f.strokeDetails} />
	{/if}

	<RadioGroup label="Mental illness in family?" name="fhMental" options={yesNo} bind:value={f.mentalIllness} />
	{#if f.mentalIllness === 'yes'}
		<TextInput label="Please provide details" name="fhMentalDetails" bind:value={f.mentalIllnessDetails} />
	{/if}

	<RadioGroup label="Genetic conditions in family?" name="fhGenetic" options={yesNo} bind:value={f.geneticConditions} />
	{#if f.geneticConditions === 'yes'}
		<TextInput label="Please provide details" name="fhGeneticDetails" bind:value={f.geneticConditionsDetails} />
	{/if}
</SectionCard>

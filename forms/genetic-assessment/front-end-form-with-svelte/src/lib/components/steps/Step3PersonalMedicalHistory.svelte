<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.personalMedicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Personal Medical History" description="Medical conditions relevant to genetic assessment">
	<RadioGroup label="Do you have any birth defects?" name="birthDefects" options={yesNo} bind:value={p.birthDefects} />
	{#if p.birthDefects === 'yes'}
		<TextArea label="Please provide details" name="birthDefectsDetails" bind:value={p.birthDefectsDetails} placeholder="Describe the birth defects..." />
	{/if}

	<RadioGroup label="Have you been diagnosed with developmental delay?" name="developmentalDelay" options={yesNo} bind:value={p.developmentalDelay} />
	{#if p.developmentalDelay === 'yes'}
		<TextArea label="Please provide details" name="developmentalDelayDetails" bind:value={p.developmentalDelayDetails} placeholder="Describe the developmental delay..." />
	{/if}

	<RadioGroup label="Do you have an intellectual disability?" name="intellectualDisability" options={yesNo} bind:value={p.intellectualDisability} />
	{#if p.intellectualDisability === 'yes'}
		<TextArea label="Please provide details" name="intellectualDisabilityDetails" bind:value={p.intellectualDisabilityDetails} placeholder="Describe the intellectual disability..." />
	{/if}

	<RadioGroup label="Do you have multiple congenital anomalies?" name="multipleAnomalies" options={yesNo} bind:value={p.multipleAnomalies} />
	{#if p.multipleAnomalies === 'yes'}
		<TextArea label="Please provide details" name="multipleAnomaliesDetails" bind:value={p.multipleAnomaliesDetails} placeholder="Describe the anomalies..." />
	{/if}

	<RadioGroup label="Do you have a known chromosomal condition?" name="chromosomalCondition" options={yesNo} bind:value={p.chromosomalCondition} />
	{#if p.chromosomalCondition === 'yes'}
		<TextArea label="Please provide details" name="chromosomalConditionDetails" bind:value={p.chromosomalConditionDetails} placeholder="e.g., Down syndrome, Turner syndrome..." />
	{/if}

	<RadioGroup label="Do you have a known genetic condition?" name="knownGeneticCondition" options={yesNo} bind:value={p.knownGeneticCondition} />
	{#if p.knownGeneticCondition === 'yes'}
		<TextArea label="Please provide details" name="knownGeneticConditionDetails" bind:value={p.knownGeneticConditionDetails} placeholder="e.g., cystic fibrosis, sickle cell disease, BRCA mutation..." />
	{/if}
</SectionCard>

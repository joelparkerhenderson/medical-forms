<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.comorbidities;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const severityOptions = [
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];
</script>

<SectionCard title="Comorbidities" description="Associated conditions: asthma, eczema, rhinitis, and other relevant conditions">
	<RadioGroup label="Do you have asthma?" name="asthma" options={yesNo} bind:value={c.asthma} />
	{#if c.asthma === 'yes'}
		<SelectInput label="Asthma severity" name="asthmaSeverity" options={severityOptions} bind:value={c.asthmaSeverity} required />
	{/if}

	<RadioGroup label="Do you have eczema (atopic dermatitis)?" name="eczema" options={yesNo} bind:value={c.eczema} />
	{#if c.eczema === 'yes'}
		<SelectInput label="Eczema severity" name="eczemaSeverity" options={severityOptions} bind:value={c.eczemaSeverity} required />
	{/if}

	<RadioGroup label="Do you have rhinitis (allergic or non-allergic)?" name="rhinitis" options={yesNo} bind:value={c.rhinitis} />
	{#if c.rhinitis === 'yes'}
		<SelectInput label="Rhinitis severity" name="rhinitisSeverity" options={severityOptions} bind:value={c.rhinitisSeverity} required />
	{/if}

	<RadioGroup label="Do you have eosinophilic oesophagitis?" name="eoe" options={yesNo} bind:value={c.eosinophilicOesophagitis} />

	<RadioGroup label="Do you have a mast cell disorder?" name="mastCell" options={yesNo} bind:value={c.mastCellDisorders} />
	{#if c.mastCellDisorders === 'yes'}
		<TextArea label="Mast cell disorder details" name="mastCellDetails" bind:value={c.mastCellDetails} placeholder="Diagnosis, treatment, triggers..." />
	{/if}

	<RadioGroup label="Has your allergy affected your mental health?" name="mentalHealth" options={yesNo} bind:value={c.mentalHealthImpact} />
	{#if c.mentalHealthImpact === 'yes'}
		<TextArea label="Mental health impact details" name="mentalHealthDetails" bind:value={c.mentalHealthDetails} placeholder="Anxiety, avoidance behaviours, social impact..." />
	{/if}
</SectionCard>

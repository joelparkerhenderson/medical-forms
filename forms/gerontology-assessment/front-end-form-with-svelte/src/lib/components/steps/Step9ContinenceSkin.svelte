<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.continenceSkin;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Continence & Skin" description="Urinary and faecal incontinence, pressure injury risk, and skin integrity">
	<SelectInput
		label="Urinary Incontinence"
		name="urinaryIncontinence"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'stress', label: 'Stress incontinence' },
			{ value: 'urge', label: 'Urge incontinence' },
			{ value: 'mixed', label: 'Mixed incontinence' },
			{ value: 'functional', label: 'Functional incontinence' }
		]}
		bind:value={c.urinaryIncontinence}
	/>

	{#if c.urinaryIncontinence !== 'none' && c.urinaryIncontinence !== ''}
		<SelectInput
			label="Urinary Incontinence Frequency"
			name="urinaryIncontinenceFrequency"
			options={[
				{ value: 'occasional', label: 'Occasional' },
				{ value: 'frequent', label: 'Frequent' },
				{ value: 'continuous', label: 'Continuous' }
			]}
			bind:value={c.urinaryIncontinenceFrequency}
			required
		/>
	{/if}

	<RadioGroup label="Any faecal incontinence?" name="faecalIncontinence" options={yesNo} bind:value={c.faecalIncontinence} />
	{#if c.faecalIncontinence === 'yes'}
		<SelectInput
			label="Faecal Incontinence Frequency"
			name="faecalIncontinenceFrequency"
			options={[
				{ value: 'occasional', label: 'Occasional' },
				{ value: 'frequent', label: 'Frequent' },
				{ value: 'continuous', label: 'Continuous' }
			]}
			bind:value={c.faecalIncontinenceFrequency}
			required
		/>
	{/if}

	<NumberInput label="Braden Scale Score (pressure injury risk)" name="bradenScale" bind:value={c.bradenScale} min={6} max={23} />

	<RadioGroup label="Are there any pressure injuries present?" name="pressureInjuryPresent" options={yesNo} bind:value={c.pressureInjuryPresent} />
	{#if c.pressureInjuryPresent === 'yes'}
		<SelectInput
			label="Pressure Injury Stage"
			name="pressureInjuryStage"
			options={[
				{ value: '1', label: 'Stage 1 - Non-blanchable erythema' },
				{ value: '2', label: 'Stage 2 - Partial thickness skin loss' },
				{ value: '3', label: 'Stage 3 - Full thickness skin loss' },
				{ value: '4', label: 'Stage 4 - Full thickness tissue loss' }
			]}
			bind:value={c.pressureInjuryStage}
			required
		/>
	{/if}

	<SelectInput
		label="Overall Skin Integrity"
		name="skinIntegrity"
		options={[
			{ value: 'intact', label: 'Intact' },
			{ value: 'impaired', label: 'Impaired' },
			{ value: 'wound-present', label: 'Wound present' }
		]}
		bind:value={c.skinIntegrity}
	/>
</SectionCard>

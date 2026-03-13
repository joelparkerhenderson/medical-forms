<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const s = assessment.data.smokingExposures;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Smoking & Exposures" description="Smoking history and environmental/occupational exposures">
	<RadioGroup
		label="Smoking Status"
		name="smokingStatus"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={s.smokingStatus}
	/>
	{#if s.smokingStatus === 'current' || s.smokingStatus === 'ex'}
		<NumberInput label="Pack-years" name="packYears" bind:value={s.packYears} min={0} max={200} />
	{/if}

	<RadioGroup label="Do you vape or use e-cigarettes?" name="vaping" options={yesNo} bind:value={s.vaping} />
	{#if s.vaping === 'yes'}
		<TextInput label="Vaping Details" name="vapingDetails" bind:value={s.vapingDetails} placeholder="e.g. type, frequency, duration..." />
	{/if}

	<RadioGroup label="Do you have any occupational respiratory exposures?" name="occupational" options={yesNo} bind:value={s.occupationalExposure} />
	{#if s.occupationalExposure === 'yes'}
		<TextInput label="Occupational Exposure Details" name="occupationalDetails" bind:value={s.occupationalDetails} placeholder="e.g. dust, fumes, chemicals, farming..." />
	{/if}

	<RadioGroup label="Have you ever been exposed to asbestos?" name="asbestos" options={yesNo} bind:value={s.asbestosExposure} />
	{#if s.asbestosExposure === 'yes'}
		<TextInput label="Asbestos Exposure Details" name="asbestosDetails" bind:value={s.asbestosDetails} placeholder="e.g. duration, occupation, timeframe..." />
	{/if}

	<RadioGroup label="Do you have pets at home?" name="pets" options={yesNo} bind:value={s.pets} />
	{#if s.pets === 'yes'}
		<TextInput label="Pet Details" name="petDetails" bind:value={s.petDetails} placeholder="e.g. cat, dog, birds..." />
	{/if}
</SectionCard>

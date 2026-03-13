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
		label="Smoking status"
		name="smokingStatus"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={s.smokingStatus}
		required
	/>

	{#if s.smokingStatus === 'current' || s.smokingStatus === 'ex'}
		<NumberInput label="Pack-years" name="packYears" bind:value={s.packYears} min={0} max={200} />
	{/if}

	<RadioGroup label="Have you had occupational exposures (dust, chemicals, fumes)?" name="occupExposure" options={yesNo} bind:value={s.occupationalExposures} />
	{#if s.occupationalExposures === 'yes'}
		<TextInput label="Please describe the exposures" name="occupDetails" bind:value={s.occupationalDetails} />
	{/if}

	<RadioGroup label="Have you had significant biomass fuel exposure (wood, coal, dung for cooking/heating)?" name="biomass" options={yesNo} bind:value={s.biomassFuelExposure} />
</SectionCard>

<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.socialHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Social History" description="Lifestyle and environmental factors affecting your asthma">
	<RadioGroup
		label="Do you smoke?"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={s.smoking}
	/>
	{#if s.smoking === 'current' || s.smoking === 'ex'}
		<NumberInput label="Pack-years" name="smokingPackYears" bind:value={s.smokingPackYears} min={0} max={200} />
	{/if}

	<RadioGroup
		label="Do you vape?"
		name="vaping"
		options={[
			{ value: 'current', label: 'Current vaper' },
			{ value: 'ex', label: 'Ex-vaper' },
			{ value: 'never', label: 'Never vaped' }
		]}
		bind:value={s.vaping}
	/>

	<RadioGroup label="Do you have occupational exposures (chemicals, fumes, dust)?" name="occupationalExposures" options={yesNo} bind:value={s.occupationalExposures} />
	{#if s.occupationalExposures === 'yes'}
		<TextInput label="Details of occupational exposures" name="occupationalExposureDetails" bind:value={s.occupationalExposureDetails} />
	{/if}

	<TextArea
		label="Home environment"
		name="homeEnvironment"
		bind:value={s.homeEnvironment}
		placeholder="Describe your home (e.g., type of housing, ventilation, heating system)..."
	/>

	<RadioGroup label="Do you have pets?" name="pets" options={yesNo} bind:value={s.pets} />
	{#if s.pets === 'yes'}
		<TextInput label="What type of pets?" name="petDetails" bind:value={s.petDetails} />
	{/if}

	<RadioGroup label="Do you have carpet in your bedroom?" name="carpetInBedroom" options={yesNo} bind:value={s.carpetInBedroom} />

	<RadioGroup label="Is there mold in your home?" name="moldExposure" options={yesNo} bind:value={s.moldExposure} />
</SectionCard>

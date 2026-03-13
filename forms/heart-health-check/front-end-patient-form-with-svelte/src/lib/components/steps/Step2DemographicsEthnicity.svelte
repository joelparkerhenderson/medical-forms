<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.demographicsEthnicity;
</script>

<SectionCard title="Demographics & Ethnicity" description="Required for QRISK3 risk calculation">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Age" name="age" bind:value={d.age} min={18} max={100} unit="years" required />
		<NumberInput label="Townsend Deprivation Score" name="townsendDeprivation" bind:value={d.townsendDeprivation} step={0.1} min={-8} max={12} />
	</div>
	<RadioGroup
		label="Sex"
		name="sex"
		bind:value={d.sex}
		required
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' }
		]}
	/>
	<SelectInput
		label="Ethnicity"
		name="ethnicity"
		bind:value={d.ethnicity}
		options={[
			{ value: 'white', label: 'White or not stated' },
			{ value: 'indian', label: 'Indian' },
			{ value: 'pakistani', label: 'Pakistani' },
			{ value: 'bangladeshi', label: 'Bangladeshi' },
			{ value: 'other-asian', label: 'Other Asian' },
			{ value: 'black-caribbean', label: 'Black Caribbean' },
			{ value: 'black-african', label: 'Black African' },
			{ value: 'chinese', label: 'Chinese' },
			{ value: 'other', label: 'Other ethnic group' }
		]}
	/>
</SectionCard>

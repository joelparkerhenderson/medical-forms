<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Age, sex, and body measurements used in risk calculation">
	<NumberInput label="Age" name="age" bind:value={d.age} min={18} max={120} unit="years" required />

	<RadioGroup
		label="Sex"
		name="sex"
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' }
		]}
		bind:value={d.sex}
		required
	/>

	<SelectInput
		label="Ethnicity"
		name="ethnicity"
		options={[
			{ value: 'white', label: 'White' },
			{ value: 'black', label: 'Black / African American' },
			{ value: 'hispanic', label: 'Hispanic / Latino' },
			{ value: 'asian', label: 'Asian' },
			{ value: 'native', label: 'Native American / Pacific Islander' },
			{ value: 'mixed', label: 'Mixed / Multiple' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={d.ethnicity}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Height" name="heightCm" bind:value={d.heightCm} min={50} max={250} step={0.1} unit="cm" />
		<NumberInput label="Weight" name="weightKg" bind:value={d.weightKg} min={20} max={400} step={0.1} unit="kg" />
	</div>

	<TextInput label="ZIP / Postal Code" name="zipCode" bind:value={d.zipCode} placeholder="e.g. 10001 or SW1A 1AA" />
</SectionCard>

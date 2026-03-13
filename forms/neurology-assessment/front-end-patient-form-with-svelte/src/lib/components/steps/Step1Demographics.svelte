<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
</script>

<SectionCard title="Demographics" description="Basic patient information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={assessment.data.demographics.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={assessment.data.demographics.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={assessment.data.demographics.dateOfBirth} required />

	<RadioGroup
		label="Sex"
		name="sex"
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={assessment.data.demographics.sex}
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Weight" name="weight" bind:value={assessment.data.demographics.weight} unit="kg" min={1} max={400} />
		<NumberInput label="Height" name="height" bind:value={assessment.data.demographics.height} unit="cm" min={50} max={250} />
	</div>
</SectionCard>

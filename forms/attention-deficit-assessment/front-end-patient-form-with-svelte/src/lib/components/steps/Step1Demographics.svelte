<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Basic patient information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={d.dateOfBirth} required />

	<RadioGroup
		label="Sex"
		name="sex"
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={d.sex}
		required
	/>

	<TextInput label="Occupation" name="occupation" bind:value={d.occupation} />

	<SelectInput
		label="Highest Education Level"
		name="educationLevel"
		options={[
			{ value: 'none', label: 'No formal qualification' },
			{ value: 'secondary', label: 'Secondary / GCSE / High School' },
			{ value: 'college', label: 'College / A-Level / Vocational' },
			{ value: 'undergraduate', label: 'Undergraduate degree' },
			{ value: 'postgraduate', label: 'Postgraduate degree' }
		]}
		bind:value={d.educationLevel}
	/>
</SectionCard>

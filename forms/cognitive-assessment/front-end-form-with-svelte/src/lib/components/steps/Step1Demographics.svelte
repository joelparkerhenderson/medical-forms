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

	<SelectInput
		label="Education Level"
		name="educationLevel"
		options={[
			{ value: 'none', label: 'No formal education' },
			{ value: 'primary', label: 'Primary school' },
			{ value: 'secondary', label: 'Secondary school' },
			{ value: 'university', label: 'University/College' },
			{ value: 'postgraduate', label: 'Postgraduate' }
		]}
		bind:value={d.educationLevel}
		required
	/>

	<TextInput
		label="Primary Language"
		name="primaryLanguage"
		bind:value={d.primaryLanguage}
		placeholder="e.g., English, Spanish, Mandarin..."
		required
	/>

	<RadioGroup
		label="Handedness"
		name="handedness"
		options={[
			{ value: 'right', label: 'Right' },
			{ value: 'left', label: 'Left' },
			{ value: 'ambidextrous', label: 'Ambidextrous' }
		]}
		bind:value={d.handedness}
	/>
</SectionCard>

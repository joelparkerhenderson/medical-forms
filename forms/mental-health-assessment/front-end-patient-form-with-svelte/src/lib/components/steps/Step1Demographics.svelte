<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Basic patient information and emergency contact">
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

	<div class="mt-6 border-t border-gray-200 pt-6">
		<h3 class="mb-4 text-sm font-semibold text-gray-700">Emergency Contact</h3>
		<TextInput label="Contact Name" name="emergencyName" bind:value={d.emergencyContactName} required />
		<TextInput label="Contact Phone" name="emergencyPhone" bind:value={d.emergencyContactPhone} required />
		<TextInput label="Relationship" name="emergencyRelationship" bind:value={d.emergencyContactRelationship} required />
	</div>
</SectionCard>

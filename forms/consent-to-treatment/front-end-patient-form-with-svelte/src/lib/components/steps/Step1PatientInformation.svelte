<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Personal details and emergency contact information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={p.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={p.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={p.dob} required />

	<RadioGroup
		label="Sex"
		name="sex"
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={p.sex}
		required
	/>

	<TextInput label="NHS Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="000 000 0000" required />

	<TextInput label="Address" name="address" bind:value={p.address} required />

	<TextInput label="Phone Number" name="phone" bind:value={p.phone} required />

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Emergency Contact</h3>
		<TextInput label="Emergency Contact Name" name="emergencyContact" bind:value={p.emergencyContact} required />
		<TextInput label="Emergency Contact Phone" name="emergencyContactPhone" bind:value={p.emergencyContactPhone} required />
	</div>
</SectionCard>

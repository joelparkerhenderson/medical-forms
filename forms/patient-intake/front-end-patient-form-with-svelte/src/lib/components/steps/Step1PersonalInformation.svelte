<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.personalInformation;
</script>

<SectionCard title="Personal Information" description="Please provide your basic personal details">
	<TextInput label="Full Name" name="fullName" bind:value={p.fullName} required />

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={p.dateOfBirth} required />

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

	<TextInput label="Address Line 1" name="addr1" bind:value={p.addressLine1} required />
	<TextInput label="Address Line 2" name="addr2" bind:value={p.addressLine2} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="City" name="city" bind:value={p.city} required />
		<TextInput label="Postcode" name="postcode" bind:value={p.postcode} required />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Phone Number" name="phone" bind:value={p.phone} required />
		<TextInput label="Email" name="email" type="email" bind:value={p.email} />
	</div>

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Emergency Contact</h3>
		<TextInput label="Contact Name" name="emergName" bind:value={p.emergencyContactName} required />
		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput label="Contact Phone" name="emergPhone" bind:value={p.emergencyContactPhone} required />
			<TextInput label="Relationship" name="emergRelation" bind:value={p.emergencyContactRelationship} />
		</div>
	</div>
</SectionCard>

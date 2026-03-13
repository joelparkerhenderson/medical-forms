<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Full patient details for the records release authorization">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={p.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={p.lastName} required />
	</div>

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
	/>

	<TextInput
		label="Address"
		name="address"
		bind:value={p.address}
		placeholder="Full postal address"
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput
			label="Phone Number"
			name="phone"
			bind:value={p.phone}
			placeholder="e.g., 020 7946 0958"
		/>
		<TextInput
			label="Email Address"
			name="email"
			type="email"
			bind:value={p.email}
			placeholder="e.g., patient@example.com"
		/>
	</div>

	<TextInput
		label="NHS Number"
		name="nhsNumber"
		bind:value={p.nhsNumber}
		placeholder="e.g., 943 476 5919"
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput
			label="GP Name"
			name="gpName"
			bind:value={p.gpName}
			placeholder="e.g., Dr Sarah Thompson"
		/>
		<TextInput
			label="GP Practice"
			name="gpPractice"
			bind:value={p.gpPractice}
			placeholder="e.g., Elm Street Surgery"
		/>
	</div>
</SectionCard>

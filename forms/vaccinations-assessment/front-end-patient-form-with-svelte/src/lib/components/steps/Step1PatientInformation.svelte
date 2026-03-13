<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Please provide the patient's personal details.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Patient Name" name="patientName" bind:value={p.patientName} placeholder="e.g. John Smith" required />
		<TextInput label="Date of Birth" name="dateOfBirth" type="date" bind:value={p.dateOfBirth} required />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Sex"
			name="patientSex"
			options={[
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={p.patientSex}
		/>
		<TextInput label="Age" name="patientAge" bind:value={p.patientAge} placeholder="e.g. 35" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="NHS Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 123 456 7890" required />
		<TextInput label="GP Practice" name="gpPractice" bind:value={p.gpPractice} placeholder="e.g. Oak Tree Surgery" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Contact Phone" name="contactPhone" type="tel" bind:value={p.contactPhone} placeholder="e.g. 07700 900000" />
		<TextInput label="Contact Email" name="contactEmail" type="email" bind:value={p.contactEmail} placeholder="e.g. patient@example.com" />
	</div>
</SectionCard>

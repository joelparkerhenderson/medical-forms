<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const d = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Please provide the patient's demographic and contact details.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Full Name" name="fullName" bind:value={d.fullName} placeholder="e.g. John Smith" />
		<TextInput label="Date of Birth" name="dateOfBirth" type="date" bind:value={d.dateOfBirth} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="NHS Number" name="nhsNumber" bind:value={d.nhsNumber} placeholder="e.g. 123 456 7890" />
		<TextInput label="Telephone" name="telephone" type="tel" bind:value={d.telephone} placeholder="e.g. 07700 900000" />
	</div>

	<TextArea label="Address" name="address" bind:value={d.address} rows={2} placeholder="Full postal address" />

	<TextInput label="Email" name="email" type="email" bind:value={d.email} placeholder="e.g. patient@example.com" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="GP Name" name="gpName" bind:value={d.gpName} placeholder="e.g. Dr Jones" />
		<TextInput label="GP Practice" name="gpPractice" bind:value={d.gpPractice} placeholder="e.g. Riverside Surgery" />
	</div>
</SectionCard>

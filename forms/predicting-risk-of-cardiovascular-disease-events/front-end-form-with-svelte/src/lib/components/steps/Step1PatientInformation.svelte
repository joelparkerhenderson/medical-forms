<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Basic patient identification details">
	<TextInput label="Full Name" name="fullName" bind:value={p.fullName} required />
	<TextInput label="Date of Birth" name="dateOfBirth" type="date" bind:value={p.dateOfBirth} required />
	<TextInput label="NHS Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 123 456 7890" />

	<TextInput label="Address" name="address" bind:value={p.address} placeholder="Full postal address" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Telephone" name="telephone" bind:value={p.telephone} placeholder="e.g. 07700 900000" />
		<TextInput label="Email" name="email" type="email" bind:value={p.email} placeholder="patient@example.com" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="GP Name" name="gpName" bind:value={p.gpName} />
		<TextInput label="GP Practice" name="gpPractice" bind:value={p.gpPractice} />
	</div>
</SectionCard>

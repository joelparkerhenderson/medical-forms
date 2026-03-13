<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Patient identification and contact details">
	<TextInput label="Full Name" name="fullName" bind:value={d.fullName} required />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Date of Birth" name="dateOfBirth" bind:value={d.dateOfBirth} type="date" required />
		<TextInput label="NHS Number" name="nhsNumber" bind:value={d.nhsNumber} placeholder="000 000 0000" />
	</div>
	<TextInput label="Address" name="address" bind:value={d.address} />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Postcode" name="postcode" bind:value={d.postcode} />
		<TextInput label="Telephone" name="telephone" bind:value={d.telephone} type="tel" />
	</div>
	<TextInput label="Email" name="email" bind:value={d.email} type="email" />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="GP Name" name="gpName" bind:value={d.gpName} />
		<TextInput label="GP Practice" name="gpPractice" bind:value={d.gpPractice} />
	</div>
</SectionCard>

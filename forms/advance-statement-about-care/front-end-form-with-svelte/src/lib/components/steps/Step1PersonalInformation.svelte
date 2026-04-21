<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.personalInformation;
</script>

<SectionCard title="Personal Information" description="Your basic details for identification and contact purposes">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={p.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={p.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={p.dateOfBirth} required />
	<TextInput label="NHS Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 943 476 5919" />
	<TextInput label="Address" name="address" bind:value={p.address} required />
	<TextInput label="Postcode" name="postcode" bind:value={p.postcode} />
	<TextInput label="Telephone" name="telephone" bind:value={p.telephone} />
	<TextInput label="Email" name="email" type="email" bind:value={p.email} />

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">GP Details</h3>
		<TextInput label="GP Name" name="gpName" bind:value={p.gpName} />
		<TextInput label="GP Practice" name="gpPractice" bind:value={p.gpPractice} />
		<TextInput label="GP Telephone" name="gpTelephone" bind:value={p.gpTelephone} />
	</div>
</SectionCard>

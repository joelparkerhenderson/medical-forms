<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.personalInformation;
</script>

<SectionCard title="Personal Information" description="Your full legal details as they will appear on the ADRT document">
	<TextInput label="Full Legal Name" name="fullLegalName" bind:value={d.fullLegalName} required />
	<TextInput label="Date of Birth" name="dob" type="date" bind:value={d.dateOfBirth} required />
	<TextInput label="NHS Number" name="nhsNumber" bind:value={d.nhsNumber} placeholder="e.g. 943 476 5919" />
	<TextInput label="Address" name="address" bind:value={d.address} required />
	<TextInput label="Postcode" name="postcode" bind:value={d.postcode} required />
	<TextInput label="Telephone" name="telephone" bind:value={d.telephone} />
	<TextInput label="Email" name="email" type="email" bind:value={d.email} />

	<div class="mt-6 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">GP Details</h3>
		<TextInput label="GP Name" name="gpName" bind:value={d.gpName} />
		<TextInput label="GP Practice" name="gpPractice" bind:value={d.gpPractice} />
		<TextInput label="GP Address" name="gpAddress" bind:value={d.gpAddress} />
		<TextInput label="GP Telephone" name="gpTelephone" bind:value={d.gpTelephone} />
	</div>
</SectionCard>

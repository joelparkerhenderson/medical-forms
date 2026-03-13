<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Please provide patient identification details.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Full Name" name="fullName" bind:value={p.fullName} placeholder="e.g. John Smith" />
		<TextInput label="Date of Birth" name="dateOfBirth" type="date" bind:value={p.dateOfBirth} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="NHS Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 123 456 7890" />
		<TextInput label="Telephone" name="telephone" bind:value={p.telephone} placeholder="e.g. 07700 900000" />
	</div>

	<div class="mb-4">
		<label for="address" class="mb-1 block text-sm font-medium text-gray-700">Address</label>
		<textarea id="address" name="address" rows="2" bind:value={p.address} placeholder="Full postal address" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"></textarea>
	</div>

	<TextInput label="Email" name="email" type="email" bind:value={p.email} placeholder="e.g. patient@example.com" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="GP Name" name="gpName" bind:value={p.gpName} placeholder="e.g. Dr Jones" />
		<TextInput label="GP Practice" name="gpPractice" bind:value={p.gpPractice} placeholder="e.g. City Health Centre" />
	</div>
</SectionCard>

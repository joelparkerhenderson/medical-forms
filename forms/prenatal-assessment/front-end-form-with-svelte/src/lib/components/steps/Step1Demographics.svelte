<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Basic patient information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={d.dateOfBirth} required />

	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium text-gray-700">Sex</label>
		<div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
			Female (prenatal assessment)
		</div>
	</div>
</SectionCard>

<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { PatientDemographics } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: PatientDemographics } = $props();
</script>

<SectionCard title="Patient Demographics">
	<TextInput label="Full Name" id="fullName" bind:value={data.fullName} />

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput label="Date of Birth" id="dateOfBirth" type="date" bind:value={data.dateOfBirth} />
		<RadioGroup
			label="Sex"
			name="sex"
			options={[
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' }
			]}
			bind:value={data.sex}
		/>
	</div>

	<TextInput
		label="NHS Number"
		id="nhsNumber"
		bind:value={data.nhsNumber}
		placeholder="e.g. 123 456 7890"
	/>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput
			label="Height (cm)"
			id="heightCm"
			type="number"
			bind:value={data.heightCm}
			min={50}
			max={250}
			step={0.1}
		/>
		<TextInput
			label="Weight (kg)"
			id="weightKg"
			type="number"
			bind:value={data.weightKg}
			min={20}
			max={300}
			step={0.1}
		/>
	</div>

	<div class="mb-4">
		<label for="ethnicity" class="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
		<select
			id="ethnicity"
			bind:value={data.ethnicity}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="white">White</option>
			<option value="mixedOrMultiple">Mixed or Multiple ethnic groups</option>
			<option value="asian">Asian or Asian British</option>
			<option value="black">Black, African, Caribbean or Black British</option>
			<option value="arab">Arab</option>
			<option value="other">Other ethnic group</option>
			<option value="preferNotToSay">Prefer not to say</option>
		</select>
	</div>
</SectionCard>

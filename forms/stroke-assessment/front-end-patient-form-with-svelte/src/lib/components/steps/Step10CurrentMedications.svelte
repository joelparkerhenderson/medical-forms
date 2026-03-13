<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const med = assessment.data.currentMedications;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="List all current medications and allergies">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Current Medications</h3>
	<MedicationEntry bind:medications={med.medications} />
	{#if med.medications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No medications added.</p>
	{/if}

	<div class="mt-6">
		<RadioGroup
			label="Currently taking anticoagulants?"
			name="anticoagulants"
			options={yesNoOptions}
			bind:value={med.anticoagulants}
		/>
		{#if med.anticoagulants === 'yes'}
			<TextInput
				label="Anticoagulant Details"
				name="anticoagulantDetails"
				bind:value={med.anticoagulantDetails}
				placeholder="e.g., Warfarin, Apixaban, Rivaroxaban..."
			/>
		{/if}
	</div>

	<div class="mt-4">
		<RadioGroup
			label="Currently taking antiplatelets?"
			name="antiplatelets"
			options={yesNoOptions}
			bind:value={med.antiplatelets}
		/>
		{#if med.antiplatelets === 'yes'}
			<TextInput
				label="Antiplatelet Details"
				name="antiplateletDetails"
				bind:value={med.antiplateletDetails}
				placeholder="e.g., Aspirin, Clopidogrel..."
			/>
		{/if}
	</div>

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Known Allergies</h3>
	<AllergyEntry bind:allergies={med.allergies} />
	{#if med.allergies.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No allergies added.</p>
	{/if}
</SectionCard>

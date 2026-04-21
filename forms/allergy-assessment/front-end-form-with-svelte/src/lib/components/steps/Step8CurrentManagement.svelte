<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const m = assessment.data.currentManagement;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Management" description="Medications, immunotherapy, biologics, and avoidance strategies">
	<RadioGroup label="Taking antihistamines?" name="antihistamines" options={yesNo} bind:value={m.antihistamines} />
	{#if m.antihistamines === 'yes'}
		<TextInput label="Antihistamine details" name="antihistamineDetails" bind:value={m.antihistamineDetails} placeholder="e.g. Cetirizine 10mg daily" />
	{/if}

	<RadioGroup label="Using nasal steroids?" name="nasalSteroids" options={yesNo} bind:value={m.nasalSteroids} />
	<RadioGroup label="Carry adrenaline auto-injector?" name="autoInjector" options={yesNo} bind:value={m.adrenalineAutoInjector} />

	<RadioGroup label="Receiving immunotherapy?" name="immunotherapy" options={yesNo} bind:value={m.immunotherapy} />
	{#if m.immunotherapy === 'yes'}
		<TextInput label="Immunotherapy details" name="immunotherapyDetails" bind:value={m.immunotherapyDetails} placeholder="e.g. Grass pollen SCIT, started 2024" />
	{/if}

	<RadioGroup label="On biologic therapy?" name="biologics" options={yesNo} bind:value={m.biologics} />
	{#if m.biologics === 'yes'}
		<TextInput label="Biologic details" name="biologicDetails" bind:value={m.biologicDetails} placeholder="e.g. Omalizumab 300mg monthly" />
	{/if}

	<TextArea label="Allergen avoidance strategies" name="avoidance" bind:value={m.allergenAvoidanceStrategies} placeholder="Describe any allergen avoidance measures in place..." />

	<div class="mb-4">
		<label class="mb-2 block text-sm font-medium text-gray-700">Other medications</label>
		<MedicationEntry bind:medications={m.otherMedications} />
	</div>
</SectionCard>

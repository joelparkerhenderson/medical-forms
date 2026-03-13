<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const med = assessment.data.currentMedications;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Current pharmacological treatments - important for interaction assessment">
	<RadioGroup label="Currently on insulin therapy?" name="insulinTherapy" options={yesNoOptions} bind:value={med.insulinTherapy} />

	{#if med.insulinTherapy === 'yes'}
		<TextInput
			label="Insulin Type and Regimen"
			name="insulinType"
			bind:value={med.insulinType}
			placeholder="e.g., Basal insulin glargine 20 units, Rapid-acting insulin aspart..."
		/>
	{/if}

	<RadioGroup label="Currently on sulfonylureas?" name="sulfonylureas" options={yesNoOptions} bind:value={med.sulfonylureas} />

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Other Diabetes Medications</h3>
	<MedicationEntry bind:medications={med.otherDiabetesMedications} />
	{#if med.otherDiabetesMedications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No other diabetes medications added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Antihypertensives</h3>
	<MedicationEntry bind:medications={med.antihypertensives} />
	{#if med.antihypertensives.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No antihypertensives added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Lipid-Lowering Medications</h3>
	<MedicationEntry bind:medications={med.lipidLowering} />
	{#if med.lipidLowering.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No lipid-lowering medications added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Other Medications</h3>
	<MedicationEntry bind:medications={med.otherMedications} />
	{#if med.otherMedications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No other medications added.</p>
	{/if}
</SectionCard>

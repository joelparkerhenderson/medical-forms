<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="List all asthma-related medications you currently take">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Controller Medications (preventers)</h3>
	<p class="mb-3 text-xs text-gray-500">e.g., inhaled corticosteroids (ICS), ICS/LABA combinations, leukotriene receptor antagonists</p>
	<MedicationEntry bind:medications={m.controllerMedications} />
	{#if m.controllerMedications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No controller medications added.</p>
	{/if}

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Rescue Inhalers (relievers)</h3>
	<p class="mb-3 text-xs text-gray-500">e.g., salbutamol, terbutaline</p>
	<MedicationEntry bind:medications={m.rescueInhalers} />
	{#if m.rescueInhalers.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No rescue inhalers added.</p>
	{/if}

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Biologic Therapies</h3>
	<p class="mb-3 text-xs text-gray-500">e.g., omalizumab, mepolizumab, dupilumab, benralizumab, tezepelumab</p>
	<MedicationEntry bind:medications={m.biologics} />
	{#if m.biologics.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No biologic therapies added.</p>
	{/if}

	<div class="mt-6">
		<RadioGroup label="Are you currently taking oral corticosteroids?" name="oralSteroids" options={yesNo} bind:value={m.oralSteroids} />
		{#if m.oralSteroids === 'yes'}
			<TextInput label="Details (name, dose, duration)" name="oralSteroidDetails" bind:value={m.oralSteroidDetails} />
		{/if}
	</div>

	<RadioGroup label="Has your inhaler technique been reviewed recently?" name="inhalerTechniqueReviewed" options={yesNo} bind:value={m.inhalerTechniqueReviewed} />

	<SelectInput
		label="How would you rate your medication adherence?"
		name="medicationAdherence"
		options={[
			{ value: 'good', label: 'Good - I take my medications as prescribed' },
			{ value: 'partial', label: 'Partial - I sometimes miss doses' },
			{ value: 'poor', label: 'Poor - I often miss doses or do not take regularly' }
		]}
		bind:value={m.medicationAdherence}
	/>
</SectionCard>

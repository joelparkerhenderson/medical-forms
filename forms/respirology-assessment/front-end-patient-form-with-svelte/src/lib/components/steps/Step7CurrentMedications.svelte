<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Respiratory medications and therapies">
	<h3 class="mb-2 font-medium text-gray-800">Inhalers</h3>
	<MedicationEntry bind:medications={m.inhalers} />
	{#if m.inhalers.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No inhalers added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-medium text-gray-800">Nebulizers</h3>
	<MedicationEntry bind:medications={m.nebulizers} />
	{#if m.nebulizers.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No nebulizers added.</p>
	{/if}

	<div class="mt-6">
		<RadioGroup label="Are you on long-term oxygen therapy?" name="oxygenTherapy" options={yesNo} bind:value={m.oxygenTherapy} />
		{#if m.oxygenTherapy === 'yes'}
			<SelectInput
				label="Oxygen Delivery Method"
				name="oxygenDelivery"
				options={[
					{ value: 'nasal-cannula', label: 'Nasal Cannula' },
					{ value: 'venturi', label: 'Venturi Mask' },
					{ value: 'non-rebreather', label: 'Non-Rebreather Mask' },
					{ value: 'cpap', label: 'CPAP' },
					{ value: 'bipap', label: 'BiPAP' }
				]}
				bind:value={m.oxygenDelivery}
			/>
			<NumberInput label="Flow Rate" name="flowRate" bind:value={m.oxygenFlowRate} unit="L/min" min={0} max={15} />
		{/if}
	</div>

	<RadioGroup label="Are you on oral corticosteroids?" name="oralSteroids" options={yesNo} bind:value={m.oralSteroids} />
	{#if m.oralSteroids === 'yes'}
		<TextInput label="Steroid Details" name="steroidDetails" bind:value={m.oralSteroidDetails} placeholder="e.g. Prednisolone 5mg daily" />
	{/if}

	<RadioGroup label="Are you currently taking antibiotics for a respiratory infection?" name="antibiotics" options={yesNo} bind:value={m.antibiotics} />
	{#if m.antibiotics === 'yes'}
		<TextInput label="Antibiotic Details" name="antibioticDetails" bind:value={m.antibioticDetails} placeholder="e.g. Amoxicillin 500mg TDS" />
	{/if}
</SectionCard>

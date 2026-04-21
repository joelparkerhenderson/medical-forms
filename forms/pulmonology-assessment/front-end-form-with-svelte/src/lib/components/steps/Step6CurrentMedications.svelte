<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Inhalers, oral medications, and respiratory therapies">
	<RadioGroup label="SABA (Short-acting bronchodilator, e.g. salbutamol)?" name="saba" options={yesNo} bind:value={m.saba} />
	<RadioGroup label="LABA (Long-acting beta-agonist, e.g. salmeterol, formoterol)?" name="laba" options={yesNo} bind:value={m.laba} />
	<RadioGroup label="LAMA (Long-acting muscarinic antagonist, e.g. tiotropium)?" name="lama" options={yesNo} bind:value={m.lama} />
	<RadioGroup label="ICS (Inhaled corticosteroid, e.g. fluticasone, budesonide)?" name="ics" options={yesNo} bind:value={m.ics} />
	<RadioGroup label="Oral corticosteroids (e.g. prednisolone)?" name="oralCS" options={yesNo} bind:value={m.oralCorticosteroids} />
	<RadioGroup label="Nebulisers?" name="nebulizers" options={yesNo} bind:value={m.nebulizers} />

	<RadioGroup label="Long-term oxygen therapy?" name="oxygenTherapy" options={yesNo} bind:value={m.oxygenTherapy} />
	{#if m.oxygenTherapy === 'yes'}
		<NumberInput label="Oxygen flow rate" name="o2LPM" bind:value={m.oxygenLitresPerMinute} unit="L/min" min={0} max={15} step={0.5} />
	{/if}

	<div class="mt-4">
		<h3 class="mb-2 text-sm font-medium text-gray-700">Other Medications</h3>
		<MedicationEntry bind:medications={m.otherMedications} />
		{#if m.otherMedications.length === 0}
			<p class="mt-3 text-sm text-gray-500">No other medications added. Click the button above to add one, or proceed to next step if you take none.</p>
		{/if}
	</div>
</SectionCard>

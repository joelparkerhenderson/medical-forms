<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const med = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Neurological and relevant medications">
	<h3 class="mb-3 font-semibold text-gray-800">Medication List</h3>
	<MedicationEntry bind:medications={med.medications} />

	<div class="mt-6 space-y-4">
		<RadioGroup label="Taking anticonvulsants?" name="anticonvulsants" options={yesNo} bind:value={med.anticonvulsants} />
		{#if med.anticonvulsants === 'yes'}
			<TextArea label="Anticonvulsant details" name="anticonvulsantDetails" bind:value={med.anticonvulsantDetails} placeholder="e.g., levetiracetam 500mg BD, carbamazepine 200mg TDS" />
		{/if}

		<RadioGroup label="Taking migraine prophylaxis?" name="migraineProphylaxis" options={yesNo} bind:value={med.migraineProphylaxis} />
		{#if med.migraineProphylaxis === 'yes'}
			<TextArea label="Migraine prophylaxis details" name="migraineDetails" bind:value={med.migraineProphylaxisDetails} placeholder="e.g., propranolol, topiramate, amitriptyline" />
		{/if}

		<RadioGroup label="Taking neuropathic pain medication?" name="neuropathicPain" options={yesNo} bind:value={med.neuropathicPainMeds} />
		{#if med.neuropathicPainMeds === 'yes'}
			<TextArea label="Neuropathic pain medication details" name="neuropathicDetails" bind:value={med.neuropathicPainDetails} placeholder="e.g., gabapentin, pregabalin, duloxetine" />
		{/if}

		<RadioGroup label="Taking anticoagulants?" name="anticoagulants" options={yesNo} bind:value={med.anticoagulants} />
		{#if med.anticoagulants === 'yes'}
			<TextArea label="Anticoagulant details" name="anticoagulantDetails" bind:value={med.anticoagulantDetails} placeholder="e.g., warfarin, apixaban, rivaroxaban - include INR if applicable" />
		{/if}
	</div>
</SectionCard>

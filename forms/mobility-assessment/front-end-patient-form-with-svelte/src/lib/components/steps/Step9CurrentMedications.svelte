<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const med = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="List all current medications, especially those affecting fall risk">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">All Current Medications</h3>
	<MedicationEntry bind:medications={med.medications} />
	{#if med.medications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No medications added.</p>
	{/if}

	<div class="mt-6">
		<CheckboxGroup
			label="Fall-Risk Medication Classes"
			options={[
				{ value: 'benzodiazepine', label: 'Benzodiazepines' },
				{ value: 'opioid', label: 'Opioids' },
				{ value: 'antihistamine', label: 'Antihistamines' },
				{ value: 'antipsychotic', label: 'Antipsychotics' },
				{ value: 'antihypertensive', label: 'Antihypertensives' },
				{ value: 'diuretic', label: 'Diuretics' },
				{ value: 'sedative', label: 'Sedatives/Hypnotics' },
				{ value: 'antidepressant', label: 'Antidepressants' },
				{ value: 'anticonvulsant', label: 'Anticonvulsants' }
			]}
			bind:values={med.fallRiskMedications}
		/>
	</div>

	<div class="mt-4">
		<TextArea
			label="Recent Medication Changes"
			name="recentMedicationChanges"
			bind:value={med.recentMedicationChanges}
			placeholder="Describe any recent changes to medications..."
		/>
	</div>
</SectionCard>

<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const meds = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="All current medications by category">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Chemotherapy Agents</h3>
	<MedicationEntry bind:medications={meds.chemotherapyAgents} />

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Antiemetics</h3>
	<MedicationEntry bind:medications={meds.antiemetics} />

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Pain Medications</h3>
	<MedicationEntry bind:medications={meds.painMedications} />

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Growth Factors</h3>
	<MedicationEntry bind:medications={meds.growthFactors} />

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Supportive Care</h3>
	<MedicationEntry bind:medications={meds.supportiveCare} />
</SectionCard>

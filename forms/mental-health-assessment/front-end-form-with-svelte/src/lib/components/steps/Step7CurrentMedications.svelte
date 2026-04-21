<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const meds = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="List all medications you are currently taking">
	<div class="mb-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Psychiatric Medications</h3>
		<p class="mb-3 text-xs text-gray-500">Antidepressants, anxiolytics, mood stabilisers, antipsychotics, etc.</p>
		<MedicationEntry bind:medications={meds.psychiatricMedications} />
	</div>

	<div class="border-t border-gray-200 pt-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Other Medications</h3>
		<p class="mb-3 text-xs text-gray-500">All other medications including over-the-counter and supplements.</p>
		<MedicationEntry bind:medications={meds.otherMedications} />
	</div>
</SectionCard>

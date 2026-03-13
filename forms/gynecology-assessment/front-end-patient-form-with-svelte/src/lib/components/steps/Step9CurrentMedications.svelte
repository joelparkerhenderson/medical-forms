<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const med = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="List all current medications and supplements">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Hormonal Medications</h3>
	<MedicationEntry bind:medications={med.hormonal} />
	{#if med.hormonal.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No hormonal medications added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Non-Hormonal Medications</h3>
	<MedicationEntry bind:medications={med.nonHormonal} />
	{#if med.nonHormonal.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No non-hormonal medications added.</p>
	{/if}

	<div class="mt-6">
		<TextArea
			label="Supplements and over-the-counter products"
			name="supplements"
			bind:value={med.supplements}
			placeholder="e.g., iron supplements, folic acid, vitamins..."
		/>
	</div>
</SectionCard>

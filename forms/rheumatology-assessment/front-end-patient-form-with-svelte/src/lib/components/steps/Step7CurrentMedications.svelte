<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const d = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="All medications currently being taken for rheumatological and other conditions">
	<h3 class="mb-2 font-semibold text-gray-800">DMARDs (Disease-Modifying Anti-Rheumatic Drugs)</h3>
	<MedicationEntry bind:medications={d.dmards} />
	{#if d.dmards.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No DMARDs added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-semibold text-gray-800">Biologics</h3>
	<MedicationEntry bind:medications={d.biologics} />
	{#if d.biologics.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No biologics added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-semibold text-gray-800">NSAIDs</h3>
	<MedicationEntry bind:medications={d.nsaids} />
	{#if d.nsaids.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No NSAIDs added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-semibold text-gray-800">Steroids</h3>
	<MedicationEntry bind:medications={d.steroids} />
	{#if d.steroids.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No steroids added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-semibold text-gray-800">Pain Medication</h3>
	<MedicationEntry bind:medications={d.painMedication} />
	{#if d.painMedication.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No pain medication added.</p>
	{/if}

	<h3 class="mb-2 mt-6 font-semibold text-gray-800">Supplements</h3>
	<MedicationEntry bind:medications={d.supplements} />
	{#if d.supplements.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No supplements added.</p>
	{/if}
</SectionCard>

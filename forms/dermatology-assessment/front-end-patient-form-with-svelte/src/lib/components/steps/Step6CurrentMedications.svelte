<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const med = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="List all current treatments for your skin condition">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Topical Medications</h3>
	<MedicationEntry bind:medications={med.topicals} />
	{#if med.topicals.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No topical medications added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Systemic Medications</h3>
	<MedicationEntry bind:medications={med.systemics} />
	{#if med.systemics.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No systemic medications added.</p>
	{/if}

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Biologic Therapies</h3>
	<MedicationEntry bind:medications={med.biologics} />
	{#if med.biologics.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No biologic therapies added.</p>
	{/if}

	<div class="mt-6">
		<TextArea
			label="Over-the-counter products currently in use"
			name="otcProducts"
			bind:value={med.otcProducts}
			placeholder="e.g., moisturisers, sunscreen, medicated shampoos..."
		/>
	</div>
</SectionCard>
